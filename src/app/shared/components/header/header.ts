import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private readonly router = inject(Router);

  @Input() titulo: string = 'Inicio';
  @Input() subtitulo: string = 'Resumen general del día';
  @Input() placeholder: string = 'Buscar paciente por DNI, nombre o cita...';
  @Input() notificaciones: number = 3;
  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = '';
  @Input() iniciales: string = 'JP';
  @Output() menuToggle = new EventEmitter<void>();
  @Output() busqueda = new EventEmitter<string>();

  buscar(termino: string): void {
    const valor = termino.trim();
    if (!valor) return;
    this.busqueda.emit(valor);
    this.router.navigate(['/pacientes/listado'], {
      queryParams: { dni: valor }
    });
  }
}