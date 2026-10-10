// Paciente tal como lo persiste el backend (pe.saludintegral.clinica.pacientes.Paciente)
export interface Paciente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string | null; // formato: '1992-03-14'
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
}

// Cuerpo de POST /pacientes y PUT /pacientes/{id}
export type PacienteFormValue = Omit<Paciente, 'id'>;
