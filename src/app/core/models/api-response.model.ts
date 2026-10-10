// Estructura común de respuesta del backend (pe.saludintegral.clinica.common.ApiResponse)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
