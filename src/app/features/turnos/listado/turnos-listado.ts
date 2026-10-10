import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  CalendarClock,
  CalendarCheck2,
  Stethoscope,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Eye,
  List,
  CalendarDays,
} from 'lucide-angular';
import { TurnoService } from '../../../core/services/turno.service';
import { DiaSemana, EstadoTurno, FranjaTurno, Turno } from '../../../core/models/turno.model';

@Component({
  selector: 'app-turnos-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './turnos-listado.html',
  styleUrl: './turnos-listado.scss',
})
export class TurnosListadoComponent implements OnInit {
  readonly turnoService = inject(TurnoService);

  // Iconos Lucide
  readonly iconCalendarClock = CalendarClock;
  readonly iconCalendarCheck = CalendarCheck2;
  readonly iconStethoscope = Stethoscope;
  readonly iconCalendarX = CalendarX2;
  readonly iconChevronLeft = ChevronLeft;
  readonly iconChevronRight = ChevronRight;
  readonly iconSearch = Search;
  readonly iconX = X;
  readonly iconEye = Eye;
  readonly iconList = List;
  readonly iconCalendarDays = CalendarDays;

  // Vista activa: tabla de turnos o tablero semanal
  vista = signal<'LISTA' | 'SEMANA'>('LISTA');

  // Modal de horario semanal de un médico
  medicoSeleccionadoId = signal<number | null>(null);
  modalHorarioAbierto = signal<boolean>(false);

  turnosDelMedicoSeleccionado = computed<Turno[]>(() => {
    const id = this.medicoSeleccionadoId();
    if (id === null) return [];
    return this.turnoService.obtenerTurnosPorMedico(id);
  });

  ngOnInit(): void {
    this.turnoService.cargar();
  }

  // Rango de fechas de la semana visible, formato dd/mm – dd/mm/aaaa
  rangoSemana(): string {
    const lunes = this.fechaDia('LUNES');
    const domingo = this.fechaDia('DOMINGO');
    return `${lunes.slice(0, 5)} – ${domingo}`;
  }

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

  onEspecialidadChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.turnoService.setFiltroEspecialidad(select.value);
  }

  onFranjaChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.turnoService.setFiltroFranja(select.value as FranjaTurno | 'TODAS');
  }

  limpiarFiltros(): void {
    this.turnoService.limpiarFiltros();
  }

  // Fecha exacta del día en la semana actual, formato dd/mm/aaaa
  fechaDia(dia: DiaSemana): string {
    const fecha = this.turnoService.obtenerFecha(dia);
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${fecha.getFullYear()}`;
  }

  esHoy(dia: DiaSemana): boolean {
    return this.turnoService.esHoy(dia);
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
