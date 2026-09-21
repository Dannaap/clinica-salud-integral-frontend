import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CalendarPlus,
  Eye,
  FilePenLine,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

import { PacientesLayout } from '../components/pacientes-layout/pacientes-layout';
import { Paciente } from '../paciente.model';
import { PacienteService } from '../paciente.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-listado',
  imports: [CommonModule, RouterLink, LucideAngularModule, PacientesLayout],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
})
export class Listado {
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private debounceTimer?: any;

  get rutaDashboard(): string {
    return this.authService.obtenerRutaDashboard();
  }

  readonly iconPlus = Plus;
  readonly iconSearch = Search;
  readonly iconSliders = SlidersHorizontal;
  readonly iconEye = Eye;
  readonly iconEdit = FilePenLine;
  readonly iconTrash = Trash2;
  readonly iconCalendarPlus = CalendarPlus;
  readonly iconUser = UserRound;
  readonly iconX = X;
  readonly iconList = ListFilter;

  readonly pacientes = this.pacienteService.pacientes;
  readonly busqueda = signal('');
  readonly filtroEstado = signal<'Todos' | 'Activo' | 'Inactivo' | 'Nuevo'>('Todos');
  readonly filtroSexo = signal<'Todos' | 'Masculino' | 'Femenino' | 'Otro'>('Todos');
  readonly filtroSangre = signal<string>('Todos');
  readonly paginaActual = signal(1);
  readonly tamanoPagina = 8;
  readonly pacienteSeleccionado = signal<Paciente | null>(null);
  readonly pacienteAEliminar = signal<Paciente | null>(null);
  readonly mensaje = signal<string | null>(null);

  constructor() {
    const dniParam = this.route.snapshot.queryParamMap.get('dni');
    if (dniParam) {
      this.busqueda.set(dniParam);
    }
  }

  readonly pacientesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const estado = this.filtroEstado();
    const sexo = this.filtroSexo();
    const sangre = this.filtroSangre();

    return this.pacientes().filter((paciente) => {
      const coincideBusqueda =
        !termino ||
        `${paciente.nombres} ${paciente.apellidos}`.toLowerCase().includes(termino) ||
        paciente.dni.includes(termino);
      const coincideEstado = estado === 'Todos' || paciente.estado === estado;
      const coincideSexo = sexo === 'Todos' || paciente.sexo === sexo;
      const coincideSangre = sangre === 'Todos' || paciente.tipoSangre === sangre;

      return coincideBusqueda && coincideEstado && coincideSexo && coincideSangre;
    });
  });

  readonly pacientesPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.tamanoPagina;
    return this.pacientesFiltrados().slice(inicio, inicio + this.tamanoPagina);
  });

  readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.pacientesFiltrados().length / this.tamanoPagina)),
  );

  readonly paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, index) => index + 1),
  );

  readonly resumen = computed(() => {
    const lista = this.pacientes();
    return {
      total: lista.length,
      nuevos: lista.filter((p) => p.estado === 'Nuevo').length,
      citasActivas: lista.reduce((acc, p) => acc + (p.citasActivas || 0), 0),
    };
  });

  actualizarBusqueda(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.busqueda.set(valor);
      this.paginaActual.set(1);
    }, 250);
  }

  eliminarPaciente(paciente: Paciente, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.pacienteAEliminar.set(paciente);
  }

  cancelarEliminacion(): void {
    this.pacienteAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const paciente = this.pacienteAEliminar();
    if (!paciente) {
      return;
    }

    const eliminado = this.pacienteService.eliminar(paciente.id);
    if (eliminado) {
      if (this.pacienteSeleccionado()?.id === paciente.id) {
        this.cerrarDetalle();
      }

      this.pacienteAEliminar.set(null);
      this.mensaje.set('Paciente eliminado del padrón clínico con éxito.');
      window.setTimeout(() => this.mensaje.set(null), 3000);
    }
  }

  cambiarEstado(event: Event): void {
    this.filtroEstado.set((event.target as HTMLSelectElement).value as any);
    this.paginaActual.set(1);
  }

  cambiarSexo(event: Event): void {
    this.filtroSexo.set((event.target as HTMLSelectElement).value as any);
    this.paginaActual.set(1);
  }

  cambiarSangre(event: Event): void {
    this.filtroSangre.set((event.target as HTMLSelectElement).value);
    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroEstado.set('Todos');
    this.filtroSexo.set('Todos');
    this.filtroSangre.set('Todos');
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  abrirDetalle(paciente: Paciente): void {
    this.pacienteSeleccionado.set(paciente);
  }

  cerrarDetalle(): void {
    this.pacienteSeleccionado.set(null);
  }

  editarPaciente(paciente: Paciente): void {
    this.router.navigate(['/pacientes/registro'], {
      queryParams: { editar: paciente.id },
    });
  }

  agendarCita(): void {
    this.mensaje.set('La agenda de citas se habilitará en el Sprint 2.');
    window.setTimeout(() => this.mensaje.set(null), 3500);
  }

  nombreCompleto(paciente: Paciente): string {
    return `${paciente.nombres} ${paciente.apellidos}`;
  }

  iniciales(paciente: Paciente): string {
    return `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`;
  }

  edad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleanosPendiente =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (cumpleanosPendiente) {
      edad--;
    }

    return edad;
  }
}
