export type SexoPaciente = 'Masculino' | 'Femenino' | 'Otro';
export type EstadoPaciente = 'Activo' | 'Inactivo' | 'Nuevo';

export interface Paciente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  sexo: SexoPaciente;
  telefono: string;
  correo?: string;
  tipoSangre?: string;
  direccion?: string;
  alergias?: string;
  ultimaAtencion?: string;
  citasActivas: number;
  estado: EstadoPaciente;
}

export type PacienteFormValue = Omit<
  Paciente,
  'id' | 'citasActivas' | 'estado' | 'ultimaAtencion'
>;
