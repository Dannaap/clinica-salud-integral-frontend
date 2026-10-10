import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';

const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión no es válida. Inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'La operación entra en conflicto con datos existentes.',
  500: 'Ocurrió un error interno en el servidor. Inténtalo más tarde.',
};

// Traduce cualquier error de una petición al backend en un mensaje para el usuario.
// Prioriza el `message` del ApiResponse y, si no viene, usa un texto según el estado HTTP.
export function obtenerMensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error as Partial<ApiResponse<unknown>> | null;
    // El 500 del backend siempre dice "Error interno del servidor": se prefiere el texto local
    if (error.status < 500 && typeof cuerpo?.message === 'string' && cuerpo.message.trim()) {
      return cuerpo.message;
    }
    return MENSAJES_POR_ESTADO[error.status] ?? MENSAJES_POR_ESTADO[error.status >= 500 ? 500 : 400];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}
