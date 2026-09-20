import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  @Input() titulo: string = 'Inicio';
  @Input() subtitulo: string = 'Resumen general del día';
  @Input() placeholder: string = 'Buscar paciente por DNI, nombre o cita...';
  @Input() notificaciones: number = 3;
  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = '';
  @Input() iniciales: string = 'JP';
  @Output() menuToggle = new EventEmitter<void>();
}