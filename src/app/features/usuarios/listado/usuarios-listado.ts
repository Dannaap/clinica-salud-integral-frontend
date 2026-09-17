import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Plus,
  Users,
  Settings,
  Briefcase,
  Stethoscope,
  Search,
  X,
  Eye,
} from 'lucide-angular';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Rol, Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './usuarios-listado.html',
  styleUrl: './usuarios-listado.scss',
})
export class UsuariosListadoComponent {
  readonly usuarioService = inject(UsuarioService);

  // Iconos Lucide
  readonly iconPlus = Plus;
  readonly iconUsers = Users;
  readonly iconSettings = Settings;
  readonly iconBriefcase = Briefcase;
  readonly iconStethoscope = Stethoscope;
  readonly iconSearch = Search;
  readonly iconX = X;
  readonly iconEye = Eye;

  // Acciones de filtros
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuarioService.setBusqueda(input.value);
  }

  onRolChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.usuarioService.setFiltroRol(select.value);
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.usuarioService.setFiltroEstado(select.value);
  }

  limpiarFiltros(): void {
    this.usuarioService.limpiarFiltros();
  }

  // Helper para etiqueta amigable de rol
  obtenerEtiquetaRol(rol: Rol): string {
    switch (rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'RECEPCION':
        return 'Recepción';
      case 'MEDICO':
        return 'Médico';
      default:
        return rol;
    }
  }

  // Helper para dividir fecha y hora
  obtenerFechaYHora(ultimoAcceso?: string): { fecha: string; hora: string } {
    if (!ultimoAcceso) return { fecha: '-', hora: '' };
    const partes = ultimoAcceso.split(' ');
    return {
      fecha: partes[0] || '',
      hora: partes[1] || '',
    };
  }

  verDetalleUsuario(usuario: Usuario): void {
    console.log('Ver detalle del usuario:', usuario);
  }
}
