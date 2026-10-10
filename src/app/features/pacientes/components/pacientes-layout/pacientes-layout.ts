import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pacientes-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes-layout.html',
  styleUrl: './pacientes-layout.scss',
})
export class PacientesLayout {
  @Input() pageTitle = '';
  @Input() pageSubtitle = '';
}