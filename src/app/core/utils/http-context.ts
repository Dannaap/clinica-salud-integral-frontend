import { HttpContext, HttpContextToken } from '@angular/common/http';

// Marca una petición cuyo error lo maneja quien la hace (no se muestra el toast global)
export const SIN_TOAST_DE_ERROR = new HttpContextToken<boolean>(() => false);

export function sinToastDeError(): HttpContext {
  return new HttpContext().set(SIN_TOAST_DE_ERROR, true);
}
