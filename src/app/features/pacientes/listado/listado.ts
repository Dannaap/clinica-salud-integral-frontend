import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
import { finalize } from 'rxjs';

import { Paciente } from '../paciente.model';
import { PacienteService } from '../paciente.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-listado',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
})
export class Listado implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
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
  readonly cargando = this.pacienteService.cargando;
  readonly busqueda = signal('');
  readonly paginaActual = signal(1);
  readonly tamanoPagina = 8;
  readonly pacienteSeleccionado = signal<Paciente | null>(null);
  readonly pacienteAEliminar = signal<Paciente | null>(null);
  readonly eliminando = signal(false);

  constructor() {
    const dniParam = this.route.snapshot.queryParamMap.get('dni');
    if (dniParam) {
      this.busqueda.set(dniParam);
    }
  }

  ngOnInit(): void {
    this.pacienteService.cargar();
  }

  readonly pacientesFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();

    return this.pacientes().filter(
      (paciente) =>
        !termino ||
        `${paciente.nombres} ${paciente.apellidos}`.toLowerCase().includes(termino) ||
        paciente.dni.includes(termino),
    );
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
      filtrados: this.pacientesFiltrados().length,
      conCorreo: lista.filter((p) => !!p.email).length,
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
    if (this.eliminando()) {
      return;
    }
    this.pacienteAEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const paciente = this.pacienteAEliminar();
    if (!paciente) {
      return;
    }

    this.eliminando.set(true);
    this.pacienteService
      .eliminar(paciente.id)
      .pipe(finalize(() => this.eliminando.set(false)))
      .subscribe({
        next: () => {
          if (this.pacienteSeleccionado()?.id === paciente.id) {
            this.cerrarDetalle();
          }

          this.pacienteAEliminar.set(null);
          // Si la página actual quedó vacía se retrocede a la última con datos
          this.paginaActual.update((pagina) => Math.min(pagina, this.totalPaginas()));
          this.toast.exito('Paciente eliminado del padrón clínico con éxito.');
        },
        // El mensaje de error lo muestra el interceptor global
        error: () => {},
      });
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
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

  nombreCompleto(paciente: Paciente): string {
    return `${paciente.nombres} ${paciente.apellidos}`;
  }

  iniciales(paciente: Paciente): string {
    return `${paciente.nombres.charAt(0)}${paciente.apellidos.charAt(0)}`;
  }

  edad(fechaNacimiento?: string | null): string {
    if (!fechaNacimiento) {
      return '—';
    }

    const hoy = new Date();
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleanosPendiente =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (cumpleanosPendiente) {
      edad--;
    }

    return `${edad} años`;
  }
}