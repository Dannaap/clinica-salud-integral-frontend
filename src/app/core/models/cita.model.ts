// Estados posibles de una cita 
export type EstadoCita = 'CONFIRMADA' | 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA';

// Tipos de consulta
export type TipoConsulta = 'CONSULTA_GENERAL' | 'CONTROL' | 'EMERGENCIA' | 'SEGUIMIENTO';

// Interfaz principal de Cita
export interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  pacienteDni: string;
  medicoId: number;
  medicoNombre: string;
  especialidad: string;
  fecha: string; // formato: '2026-09-16'
  hora: string;  // formato: '09:00'
  duracion: number; // en minutos
  estado: EstadoCita;
  tipo: TipoConsulta;
  observaciones?: string;
  turnoId?: number;
}

// Para crear una nueva cita
export interface CrearCitaRequest {
  pacienteId: number;
  medicoId: number;
  fecha: string;
  hora: string;
  tipo: TipoConsulta;
  observaciones?: string;
}

// Para editar una cita existente
export interface EditarCitaRequest {
  id: number;
  estado?: EstadoCita;
  fecha?: string;
  hora?: string;
  observaciones?: string;
}

// Respuesta del backend al crear/editar
export interface CitaResponse {
  success: boolean;
  message: string;
  data?: Cita;
}

// Filtros para búsqueda de citas
export interface FiltrosCita {
  fecha?: string;
  estado?: EstadoCita;
  medicoId?: number;
  pacienteId?: number;
  tipo?: TipoConsulta;
}

// Para los KPIs del dashboard
export interface ResumenCitas {
  totalHoy: number;
  confirmadas: number;
  pendientes: number;
  atendidas: number;
  canceladas: number;
  inasistencias: number;
}