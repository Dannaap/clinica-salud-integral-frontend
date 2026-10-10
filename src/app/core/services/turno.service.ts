import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  DiaSemana,
  EstadoTurno,
  FiltrosTurno,
  FranjaTurno,
  ResumenTurnos,
  Turno,
  TurnoDTO,
} from '../models/turno.model';
import {
  aFechaHoraIso,
  desdeFechaHoraIso,
  iniciales,
  parteFecha,
  parteHora,
} from '../utils/fechas';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/turnos`;

  // Turnos de la semana visible, tal como los devuelve el backend
  private readonly _turnos = signal<Turno[]>([]);
  readonly turnos = this._turnos.asReadonly();

  // Estado de la carga del listado
  readonly cargando = signal<boolean>(false);

  // Filtros reactivos con Signals
  readonly busqueda = signal<string>('');
  readonly filtroDia = signal<DiaSemana | 'TODOS'>('TODOS');
  readonly filtroEstado = signal<EstadoTurno | 'TODOS'>('TODOS');
  readonly filtroEspecialidad = signal<string>('TODAS');
  readonly filtroFranja = signal<FranjaTurno | 'TODAS'>('TODAS');

  // Días de la semana en orden, para agrupar y ordenar turnos
  readonly diasSemana: DiaSemana[] = [
    'LUNES',
    'MARTES',
    'MIERCOLES',
    'JUEVES',
    'VIERNES',
    'SABADO',
    'DOMINGO',
  ];

  // Fecha de referencia (hoy)
  readonly hoy = signal<Date>(new Date());

  // Semana visible respecto a la actual (0 = esta semana, 1 = la siguiente, ...)
  readonly desplazamientoSemanas = signal<number>(0);

  // Fecha exacta de cada día de la semana visible (lunes a domingo)
  readonly fechasSemana = computed<Record<DiaSemana, Date>>(() => {
    const hoy = this.hoy();
    const lunes = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7) + this.desplazamientoSemanas() * 7);

    return this.diasSemana.reduce(
      (fechas, dia, i) => {
        fechas[dia] = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
        return fechas;
      },
      {} as Record<DiaSemana, Date>
    );
  });

  // Especialidades disponibles (para el filtro del administrador)
  readonly especialidades = computed<string[]>(() =>
    [...new Set(this._turnos().map((t) => t.especialidad))].sort((a, b) => a.localeCompare(b))
  );

  // Estadísticas KPI computadas dinámicamente
  readonly stats = computed<ResumenTurnos>(() => {
    const lista = this._turnos();
    const disponibles = lista.filter((t) => t.estado === 'DISPONIBLE').length;

    return {
      totalTurnos: lista.length,
      turnosDisponibles: disponibles,
      turnosReservados: lista.length - disponibles,
      medicosConTurno: new Set(lista.map((t) => t.medicoId)).size,
    };
  });

  // Lista filtrada reactivamente
  readonly turnosFiltrados = computed<Turno[]>(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const dia = this.filtroDia();
    const estado = this.filtroEstado();
    const especialidad = this.filtroEspecialidad();
    const franja = this.filtroFranja();

    return this._turnos()
      .filter((turno) => {
        const coincideTexto =
          !termino ||
          turno.medicoNombre.toLowerCase().includes(termino) ||
          turno.especialidad.toLowerCase().includes(termino);

        const coincideDia = dia === 'TODOS' || turno.diaSemana === dia;
        const coincideEstado = estado === 'TODOS' || turno.estado === estado;
        const coincideEspecialidad =
          especialidad === 'TODAS' || turno.especialidad === especialidad;
        const coincideFranja = franja === 'TODAS' || this.obtenerFranja(turno.horaInicio) === franja;

        return (
          coincideTexto && coincideDia && coincideEstado && coincideEspecialidad && coincideFranja
        );
      })
      .sort(
        (a, b) => a.inicio.localeCompare(b.inicio) || a.medicoNombre.localeCompare(b.medicoNombre)
      );
  });

  // Turnos filtrados agrupados por día (vista semanal del administrador)
  readonly turnosPorDia = computed<Array<{ dia: DiaSemana; turnos: Turno[] }>>(() => {
    const lista = this.turnosFiltrados();
    return this.diasSemana.map((dia) => ({
      dia,
      turnos: lista.filter((t) => t.diaSemana === dia),
    }));
  });

  // ─── Llamadas al backend ──────────────────────────────────

  // GET /turnos con filtros opcionales por médico y rango de fechas
  listar(filtros: FiltrosTurno = {}): Observable<Turno[]> {
    let params = new HttpParams();
    if (filtros.medicoId !== undefined) {
      params = params.set('medicoId', filtros.medicoId);
    }
    // El backend exige indicar ambas fechas del rango
    if (filtros.desde && filtros.hasta) {
      params = params
        .set('desde', aFechaHoraIso(filtros.desde))
        .set('hasta', aFechaHoraIso(filtros.hasta));
    }

    return this.http
      .get<ApiResponse<TurnoDTO[]>>(this.url, { params })
      .pipe(map(({ data }) => data.map((dto) => this.aTurno(dto))));
  }

  // Turnos sin cita asignada y con fecha futura, para reservar o reprogramar
  listarDisponibles(medicoId?: number): Observable<Turno[]> {
    const ahora = aFechaHoraIso(new Date());
    return this.listar({ medicoId }).pipe(
      map((turnos) =>
        turnos
          .filter((t) => t.estado === 'DISPONIBLE' && t.inicio > ahora)
          .sort((a, b) => a.inicio.localeCompare(b.inicio))
      )
    );
  }

  // Carga los turnos de la semana visible y refleja el estado en `cargando`
  cargar(): void {
    const desde = this.fechasSemana().LUNES;
    const hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + 7);

    this.cargando.set(true);
    this.listar({ desde, hasta })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (turnos) => this._turnos.set(turnos),
        error: () => this._turnos.set([]),
      });
  }

  // Cambia la semana visible y recarga sus turnos
  cambiarSemana(semanas: number): void {
    this.desplazamientoSemanas.update((actual) => actual + semanas);
    this.cargar();
  }

  irASemanaActual(): void {
    this.desplazamientoSemanas.set(0);
    this.cargar();
  }

  // Todos los turnos de un médico en la semana visible (vista de horario semanal)
  obtenerTurnosPorMedico(medicoId: number): Turno[] {
    return this._turnos()
      .filter((t) => t.medicoId === medicoId)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  // Fecha exacta en la semana visible del día indicado
  obtenerFecha(dia: DiaSemana): Date {
    return this.fechasSemana()[dia];
  }

  esHoy(dia: DiaSemana): boolean {
    return this.obtenerFecha(dia).toDateString() === this.hoy().toDateString();
  }

  // Métodos de mutación de filtros
  setBusqueda(termino: string): void {
    this.busqueda.set(termino);
  }

  setFiltroDia(dia: DiaSemana | 'TODOS'): void {
    this.filtroDia.set(dia);
  }

  setFiltroEstado(estado: EstadoTurno | 'TODOS'): void {
    this.filtroEstado.set(estado);
  }

  setFiltroEspecialidad(especialidad: string): void {
    this.filtroEspecialidad.set(especialidad);
  }

  setFiltroFranja(franja: FranjaTurno | 'TODAS'): void {
    this.filtroFranja.set(franja);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroDia.set('TODOS');
    this.filtroEstado.set('TODOS');
    this.filtroEspecialidad.set('TODAS');
    this.filtroFranja.set('TODAS');
  }

  obtenerFranja(horaInicio: string): FranjaTurno {
    const hora = Number(horaInicio.split(':')[0]);
    if (hora < 12) return 'MAÑANA';
    if (hora < 18) return 'TARDE';
    return 'NOCHE';
  }

  // Adapta el TurnoResponse del backend al modelo que usan las vistas
  private aTurno(dto: TurnoDTO): Turno {
    const inicio = desdeFechaHoraIso(dto.inicio);

    return {
      id: dto.id,
      medicoId: dto.medicoId,
      medicoNombre: dto.medico,
      especialidad: dto.especialidad,
      iniciales: iniciales(dto.medico),
      // getDay(): 0 = domingo ... 6 = sábado
      diaSemana: this.diasSemana[(inicio.getDay() + 6) % 7],
      fecha: parteFecha(dto.inicio),
      horaInicio: parteHora(dto.inicio),
      horaFin: parteHora(dto.fin),
      inicio: dto.inicio,
      fin: dto.fin,
      estado: dto.disponible ? 'DISPONIBLE' : 'RESERVADO',
    };
  }
}
