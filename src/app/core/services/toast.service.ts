import { Injectable, signal } from '@angular/core';

export type TipoToast = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

// Notificaciones flotantes (toasts) visibles desde cualquier pantalla
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private siguienteId = 1;

  exito(mensaje: string): void {
    this.mostrar('success', mensaje, 4000);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje, 6000);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje, 4000);
  }

  cerrar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, mensaje: string, duracionMs: number): void {
    // Varias peticiones fallando a la vez no deben apilar el mismo aviso
    if (this._toasts().some((t) => t.tipo === tipo && t.mensaje === mensaje)) {
      return;
    }

    const id = this.siguienteId++;
    this._toasts.update((lista) => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }
}
