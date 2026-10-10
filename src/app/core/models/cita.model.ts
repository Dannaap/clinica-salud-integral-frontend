// Estados posibles de una cita (pe.saludintegral.clinica.citas.Cita.Estado)
export type EstadoCita = 'RESERVADA' | 'CANCELADA' | 'ATENDIDA' | 'AUSENTE';

// Cita tal como la expone el backend (pe.saludintegral.clinica.citas.CitaResponse)
export interface CitaDTO {
  id: number;
  pacienteId: number;
  paciente: string;
  dniPaciente: string;
  medicoId: number;
  medico: string;
  especialidad: string;
  inicio: string; // formato: '2026-09-16T09:00:00'
  fin: string;
  estado: EstadoCita;
  motivo: string | null;
}

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
  hora: string; // formato: '09:00'
  horaFin: string; // formato: '09:30'
  duracion: number; // en minutos
  inicio: string; // formato: '2026-09-16T09:00:00'
  estado: EstadoCita;
  motivo?: string;
}

// Cuerpo de POST /citas: la fecha y el médico los define el turno elegido
export interface CrearCitaRequest {
  pacienteId: number;
  turnoId: number;
  motivo?: string;
}

// Cuerpo de POST /atenciones: registrar la atención marca la cita como ATENDIDA
export interface RegistrarAtencionRequest {
  citaId: number;
  motivoConsulta: string;
  diagnostico: string;
  codigoCie10: string;
  notas?: string;
}

// Para los KPIs del dashboard
export interface ResumenCitas {
  total: number;
  reservadas: number;
  atendidas: number;
  canceladas: number;
  ausentes: number;
}

export const ETIQUETAS_ESTADO_CITA: Record<EstadoCita, string> = {
  RESERVADA: 'Reservada',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
  AUSENTE: 'No asistió',
};
