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

    return this._turnos().filter((turno) => {
      const coincideTexto =
        !termino ||
        turno.medicoNombre.toLowerCase().includes(termino) ||
        turno.especialidad.toLowerCase().includes(termino) ||
        turno.consultorio.toLowerCase().includes(termino);

      const coincideDia = dia === 'TODOS' || turno.diaSemana === dia;
      const coincideEstado = estado === 'TODOS' || turno.estado === estado;

      return coincideTexto && coincideDia && coincideEstado;
    });
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

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroDia.set('TODOS');
    this.filtroEstado.set('TODOS');
  }

  obtenerFranja(horaInicio: string): FranjaTurno {
    const hora = Number(horaInicio.split(':')[0]);
    if (hora < 12) return 'MAÑANA';
    if (hora < 18) return 'TARDE';
    return 'NOCHE';
  }

  private ordenDia(dia: DiaSemana): number {
    const orden: DiaSemana[] = [
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
      'DOMINGO',
    ];
    return orden.indexOf(dia);
  }

  // Genera turnos semanales de ejemplo para cada médico activo de la clínica
  private generarTurnosIniciales(): Turno[] {
    const medicos = this.usuarioService.obtenerMedicos();

    const patrones: Array<{
      dias: DiaSemana[];
      horaInicio: string;
      horaFin: string;
      cupoMaximo: number;
    }> = [
      { dias: ['LUNES', 'MIERCOLES', 'VIERNES'], horaInicio: '08:00', horaFin: '13:00', cupoMaximo: 10 },
      { dias: ['MARTES', 'JUEVES'], horaInicio: '14:00', horaFin: '19:00', cupoMaximo: 8 },
      { dias: ['SABADO'], horaInicio: '09:00', horaFin: '12:00', cupoMaximo: 6 },
    ];

    let idCounter = 1;
    const turnos: Turno[] = [];

    medicos.forEach((medico: Usuario, index: number) => {
      const patron = patrones[index % patrones.length];
      const consultorio = `Consultorio ${(index % 6) + 1}`;
      const estado: EstadoTurno = medico.activo === false ? 'INACTIVO' : 'ACTIVO';

      patron.dias.forEach((dia, i) => {
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
          cupoMaximo: patron.cupoMaximo,
          citasAgendadas: Math.min(patron.cupoMaximo, ((index + i) * 2) % (patron.cupoMaximo + 1)),
          estado,
        });
      });
    });

    return turnos;
  }
}
