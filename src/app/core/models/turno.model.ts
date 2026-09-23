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

// Estado operativo del turno
export type EstadoTurno = 'ACTIVO' | 'INACTIVO';

// Turno médico: bloque de horario semanal asignado a un médico
export interface Turno {
  id: number;
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  iniciales: string;
  diaSemana: DiaSemana;
  horaInicio: string; // formato: '08:00'
  horaFin: string; // formato: '13:00'
  consultorio: string;
  estado: EstadoTurno;
}

// Resumen estadístico para las tarjetas KPI del módulo de turnos
export interface ResumenTurnos {
  totalTurnos: number;
  turnosActivos: number;
  medicosConTurno: number;
  consultoriosEnUso: number;
}
