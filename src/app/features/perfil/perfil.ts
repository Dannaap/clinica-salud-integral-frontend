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
    return {
      nombre: u ? `${u.nombre} ${u.apellidos}` : 'Juan Pérez',
      email: u?.email ?? 'admin@clinica.com',
      rol: 'Administrador',
      telefono: '+51 987 654 321',
    };
  }
}