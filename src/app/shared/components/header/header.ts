import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { TurnoService } from '../../../core/services/turno.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  readonly usuarioService = inject(UsuarioService, { optional: true });
  private readonly turnoService = inject(TurnoService, { optional: true });
  private readonly router = inject(Router, { optional: true });

  @Input() titulo: string = 'Inicio';
  @Input() subtitulo: string = 'Resumen general del día';
  @Input() placeholder: string = 'Buscar paciente por DNI, nombre o cita...';
  @Input() notificaciones: number = 3;
  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = '';
  @Input() iniciales: string = 'JP';
  @Output() menuToggle = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() busqueda = new EventEmitter<string>();

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
    if (this.enTurnos && this.turnoService) {
      this.turnoService.setBusqueda(input.value);
      return;
    }
    if (this.usuarioService) {
      this.usuarioService.setBusqueda(input.value);
    }
  }

  // En /turnos el buscador del header filtra el listado de turnos
  get enTurnos(): boolean {
    return !!this.router?.url.startsWith('/turnos');
  }

  get valorBusqueda(): string {
    if (this.enTurnos && this.turnoService) {
      return this.turnoService.busqueda();
    }
    return this.usuarioService?.busqueda() || '';
  }

  buscar(termino: string): void {
    const valor = termino.trim();
    if (!valor) return;
    this.busqueda.emit(valor);
    if (this.router && !this.router.url.startsWith('/usuarios') && !this.enTurnos) {
      this.router.navigate(['/pacientes/listado'], {
        queryParams: { dni: valor }
      });
    }
  }

  mostrarNotificaciones(): void {
    alert('El módulo de notificaciones estará disponible en un próximo sprint.');
  }
}
