// Perfil médico (pe.saludintegral.clinica.medicos.MedicoResponse)
export interface Medico {
  id: number;
  usuarioId: number;
  nombres: string;
  apellidos: string;
  email: string;
  especialidadId: number;
  especialidad: string;
  colegiatura: string;
  activo: boolean;
}
