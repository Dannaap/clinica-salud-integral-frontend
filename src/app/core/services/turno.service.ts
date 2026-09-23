import { Injectable, computed, inject, signal } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../models/usuario.model';
import { DiaSemana, EstadoTurno, FranjaTurno, ResumenTurnos, Turno } from '../models/turno.model';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private readonly usuarioService = inject(UsuarioService);

  // Turnos base generados a partir de los médicos registrados en el sistema
  private readonly _turnos = signal<Turno[]>(this.generarTurnosIniciales());

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

  // Especialidades disponibles (para el filtro del administrador)
  readonly especialidades = computed<string[]>(() =>
    [...new Set(this._turnos().map((t) => t.especialidad))].sort((a, b) => a.localeCompare(b))
  );

  // Estadísticas KPI computadas dinámicamente
  readonly stats = computed<ResumenTurnos>(() => {
    const lista = this._turnos();
    const medicosConTurno = new Set(lista.map((t) => t.medicoId)).size;
    const consultoriosEnUso = new Set(lista.map((t) => t.consultorio)).size;

    return {
      totalTurnos: lista.length,
      turnosActivos: lista.filter((t) => t.estado === 'ACTIVO').length,
      medicosConTurno,
      consultoriosEnUso,
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
          turno.especialidad.toLowerCase().includes(termino) ||
          turno.consultorio.toLowerCase().includes(termino);

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
        (a, b) =>
          this.ordenDia(a.diaSemana) - this.ordenDia(b.diaSemana) ||
          a.horaInicio.localeCompare(b.horaInicio) ||
          a.medicoNombre.localeCompare(b.medicoNombre)
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

  // Todos los turnos de un médico específico (para la vista de horario semanal)
  obtenerTurnosPorMedico(medicoId: number): Turno[] {
    return this._turnos()
      .filter((t) => t.medicoId === medicoId)
      .sort((a, b) => this.ordenDia(a.diaSemana) - this.ordenDia(b.diaSemana));
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

  private ordenDia(dia: DiaSemana): number {
    return this.diasSemana.indexOf(dia);
  }

  // Genera turnos semanales de ejemplo para cada médico activo de la clínica
  private generarTurnosIniciales(): Turno[] {
    const medicos = this.usuarioService.obtenerMedicos();

    const patrones: Array<{
      dias: DiaSemana[];
      horaInicio: string;
      horaFin: string;
    }> = [
      { dias: ['LUNES', 'MIERCOLES', 'VIERNES'], horaInicio: '08:00', horaFin: '13:00' },
      { dias: ['MARTES', 'JUEVES'], horaInicio: '14:00', horaFin: '19:00' },
      { dias: ['SABADO'], horaInicio: '09:00', horaFin: '12:00' },
    ];

    let idCounter = 1;
    const turnos: Turno[] = [];

    medicos.forEach((medico: Usuario, index: number) => {
      const patron = patrones[index % patrones.length];
      const consultorio = `Consultorio ${(index % 6) + 1}`;
      const estado: EstadoTurno = medico.activo === false ? 'INACTIVO' : 'ACTIVO';

      patron.dias.forEach((dia) => {
        turnos.push({
          id: idCounter++,
          medicoId: medico.id,
          medicoNombre: `${medico.nombre} ${medico.apellidos}`.trim(),
          especialidad: medico.especialidad ?? 'Medicina General',
          iniciales: medico.iniciales ?? 'MD',
          diaSemana: dia,
          horaInicio: patron.horaInicio,
          horaFin: patron.horaFin,
          consultorio,
          estado,
        });
      });
    });

    return turnos;
  }
}
