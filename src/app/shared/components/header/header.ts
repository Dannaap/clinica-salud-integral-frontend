import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  readonly usuarioService = inject(UsuarioService, { optional: true });

  @Input() titulo: string = 'Inicio';
  @Input() subtitulo: string = 'Resumen general del día';
  @Input() placeholder: string = 'Buscar paciente por DNI, nombre o cita...';
  @Input() notificaciones: number = 3;
  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = '';
  @Input() iniciales: string = 'JP';
  @Output() menuToggle = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
    if (this.usuarioService) {
      this.usuarioService.setBusqueda(input.value);
    }
  }
}
