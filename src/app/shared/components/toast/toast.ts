import { Component, inject } from '@angular/core';
import { TipoToast, ToastService } from '../../../core/services/toast.service';

const ICONOS: Record<TipoToast, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  icono(tipo: TipoToast): string {
    return ICONOS[tipo];
  }
}
