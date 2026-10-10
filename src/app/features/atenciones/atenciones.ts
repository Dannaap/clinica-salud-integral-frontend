import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Atencion {
  id: number;
  paciente: string;
  medico: string;
  fecha: string;
  diagnostico: string;
  estado: 'Registrada' | 'En revisión';
}

@Component({
  selector: 'app-atenciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atenciones.html',
  styleUrl: './atenciones.scss',
})
export class AtencionesComponent {
  atenciones: Atencion[] = [
    { id: 1, paciente: 'María López', medico: 'Dr. Axel Rojas', fecha: '14/09/2026 09:30', diagnostico: 'Gastritis aguda', estado: 'Registrada' },
    { id: 2, paciente: 'Carlos Ruiz', medico: 'Dra. Glenda Zambrano', fecha: '14/09/2026 10:00', diagnostico: 'Control cardiológico', estado: 'Registrada' },
    { id: 3, paciente: 'Ana Torres', medico: 'Dr. Pablo Salazar', fecha: '13/09/2026 15:00', diagnostico: 'Migraña crónica', estado: 'En revisión' },
  ];
}