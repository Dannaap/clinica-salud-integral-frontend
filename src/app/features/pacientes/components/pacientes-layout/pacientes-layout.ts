import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../../shared/components/header/header';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pacientes-layout',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  templateUrl: './pacientes-layout.html',
  styleUrl: './pacientes-layout.scss',
})
export class PacientesLayout {
  private readonly authService = inject(AuthService);

  @Input() pageTitle = 'Pacientes';
  @Input() pageSubtitle = 'Listado y búsqueda de pacientes';

  sidebarAbierto = false;

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  get usuario() {
    const u = this.authService.obtenerUsuario();
    const nombre = u ? `${u.nombre} ${u.apellidos}`.trim() : 'Dr. Juan Pérez';
    const rol =
      u?.rol === 'ADMIN'
        ? 'Administrador'
        : u?.rol === 'RECEPCION'
        ? 'Recepción'
        : u?.rol === 'MEDICO'
        ? 'Médico'
        : 'Personal';
    const iniciales = u
      ? `${u.nombre.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase()
      : 'JP';
    return { nombre, rol, iniciales };
  }

  get esAdmin(): boolean {
    return this.authService.obtenerRol() === 'ADMIN';
  }

  get esMedico(): boolean {
    return this.authService.obtenerRol() === 'MEDICO';
  }
}
