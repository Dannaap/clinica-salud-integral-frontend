import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class ReportesComponent {
  reportes = [
    { id: 1, nombre: 'Reporte de citas del mes', fecha: '01/09/2026', tipo: 'Citas', estado: 'Disponible' },
    { id: 2, nombre: 'Pacientes nuevos - Septiembre', fecha: '14/09/2026', tipo: 'Pacientes', estado: 'Disponible' },
    { id: 3, nombre: 'Inasistencias - Agosto', fecha: '31/08/2026', tipo: 'Citas', estado: 'Disponible' },
    { id: 4, nombre: 'Ingresos por especialidad', fecha: '14/09/2026', tipo: 'Financiero', estado: 'En proceso' },
  ];

  generarReporte(): void {
    alert('La generación de reportes estará disponible en el próximo sprint.');
  }
}