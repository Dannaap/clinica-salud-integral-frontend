import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);

  get usuario() {
    const u = this.authService.obtenerUsuario();
    const info = this.authService.usuarioActual();
    return {
      nombre: info?.nombreCompleto ?? '',
      iniciales: info?.iniciales ?? '',
      email: u?.email ?? '',
      rol: info?.rolLabel ?? '',
      dni: u?.dni ?? '',
    };
  }
}
