import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  CalendarClock,
  CalendarCheck2,
  Stethoscope,
  DoorOpen,
  Search,
  X,
  Eye,
} from 'lucide-angular';
import { TurnoService } from '../../../core/services/turno.service';
import { DiaSemana, EstadoTurno, Turno } from '../../../core/models/turno.model';

const ETIQUETAS_DIA: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

@Component({
  selector: 'app-turnos-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './turnos-listado.html',
  styleUrl: './turnos-listado.scss',
})
export class TurnosListadoComponent {
  readonly turnoService = inject(TurnoService);

  // Iconos Lucide
  readonly iconCalendarClock = CalendarClock;
  readonly iconCalendarCheck = CalendarCheck2;
  readonly iconStethoscope = Stethoscope;
  readonly iconDoorOpen = DoorOpen;
  readonly iconSearch = Search;
  readonly iconX = X;
  readonly iconEye = Eye;

  // Modal de horario semanal de un médico
  medicoSeleccionadoId = signal<number | null>(null);
  modalHorarioAbierto = signal<boolean>(false);

  turnosDelMedicoSeleccionado = computed<Turno[]>(() => {
    const id = this.medicoSeleccionadoId();
    if (id === null) return [];
    return this.turnoService.obtenerTurnosPorMedico(id);
  });

  // Acciones de filtros
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.turnoService.setBusqueda(input.value);
  }

  onDiaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.turnoService.setFiltroDia(select.value as DiaSemana | 'TODOS');
  }

  onEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.turnoService.setFiltroEstado(select.value as EstadoTurno | 'TODOS');
  }

  limpiarFiltros(): void {
    this.turnoService.limpiarFiltros();
  }

  etiquetaDia(dia: DiaSemana): string {
    return ETIQUETAS_DIA[dia] ?? dia;
  }

  porcentajeOcupacion(turno: Turno): number {
    if (turno.cupoMaximo <= 0) return 0;
    return Math.round((turno.citasAgendadas / turno.cupoMaximo) * 100);
  }

  verHorarioSemanal(turno: Turno): void {
    this.medicoSeleccionadoId.set(turno.medicoId);
    this.modalHorarioAbierto.set(true);
  }

  cerrarModal(): void {
    this.modalHorarioAbierto.set(false);
    this.medicoSeleccionadoId.set(null);
  }
}
