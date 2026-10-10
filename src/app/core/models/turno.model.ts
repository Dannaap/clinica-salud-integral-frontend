// Días de la semana en los que puede programarse un turno médico
export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO';

// Franja del día a la que pertenece el turno (se deriva de la hora de inicio)
export type FranjaTurno = 'MAÑANA' | 'TARDE' | 'NOCHE';

// Un turno está reservado cuando ya tiene una cita vigente asignada
export type EstadoTurno = 'DISPONIBLE' | 'RESERVADO';

// Turno tal como lo expone el backend (pe.saludintegral.clinica.turnos.TurnoResponse)
export interface TurnoDTO {
  id: number;
  medicoId: number;
  medico: string;
  especialidad: string;
  inicio: string; // formato: '2026-09-14T08:00:00'
  fin: string;
  disponible: boolean;
}

// Turno médico: bloque de horario con fecha asignado a un médico
export interface Turno {
  id: number;
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  iniciales: string;
  diaSemana: DiaSemana;
  fecha: string; // formato: '2026-09-14'
  horaInicio: string; // formato: '08:00'
  horaFin: string; // formato: '13:00'
  inicio: string; // formato: '2026-09-14T08:00:00'
  fin: string;
  estado: EstadoTurno;
}

// Filtros que acepta GET /turnos
export interface FiltrosTurno {
  medicoId?: number;
  desde?: Date;
  hasta?: Date;
}

// Resumen estadístico para las tarjetas KPI del módulo de turnos
export interface ResumenTurnos {
  totalTurnos: number;
  turnosDisponibles: number;
  turnosReservados: number;
  medicosConTurno: number;
}
