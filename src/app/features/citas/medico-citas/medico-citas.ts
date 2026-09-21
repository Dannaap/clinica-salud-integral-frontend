import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/header/header';
import { AuthService } from '../../../core/services/auth.service';
import { CitaConDetalle, CitaService } from '../../../core/services/cita.service';
import { EstadoCita, TipoConsulta } from '../../../core/models/cita.model';

export type PestanaTiempo = 'hoy' | 'proximas' | 'todas';

@Component({
  selector: 'app-medico-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './medico-citas.html',
  styleUrl: './medico-citas.scss'
})
export class MedicoCitasComponent {
  private readonly authService = inject(AuthService);
  private readonly citaService = inject(CitaService);

  sidebarAbierto = false;
  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  get usuario() {
    const info = this.authService.usuarioActual();
    if (info) {
      return {
        nombre: info.nombreCompleto,
        especialidad: info.especialidad ?? 'Cardiólogo',
        iniciales: info.iniciales,
      };
    }
    const u = this.authService.obtenerUsuario();
    return {
      nombre: u ? `Dr. ${u.nombre} ${u.apellidos}`.trim() : 'Dr. Axel Rojas',
      especialidad: u?.especialidad ?? 'Cardiólogo',
      iniciales: u ? `${u.nombre.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase() : 'AR',
    };
  }

  readonly fechaHoy = '2026-09-14';

  // Filtros reactivos
  pestanaActiva = signal<PestanaTiempo>('hoy');
  estadoFiltro = signal<EstadoCita | 'TODOS'>('TODOS');
  tipoFiltro = signal<TipoConsulta | 'TODOS'>('TODOS');
  busqueda = signal<string>('');

  // Modales
  citaSeleccionada = signal<CitaConDetalle | null>(null);
  get cita(): CitaConDetalle | null {
    return this.citaSeleccionada();
  }
  modalDetalleAbierto = signal<boolean>(false);
  modalAccionAbierto = signal<boolean>(false);
  accionTipo = signal<'atender' | 'cancelar' | 'reprogramar'>('atender');

  // Formulario en modales
  nuevaFechaReprogramar = signal<string>('2026-09-15');
  nuevaHoraReprogramar = signal<string>('09:00');
  motivoCancelacion = signal<string>('');
  observacionesAtencion = signal<string>('');
  mensajeFeedback = signal<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // KPIs
  kpis = computed(() => {
    return this.citaService.obtenerResumenPorMedico(3, this.fechaHoy);
  });

  // Lista filtrada
  citasFiltradas = computed(() => {
    const todasDelMedico = this.citaService.obtenerCitasPorMedico(3);
    const pestana = this.pestanaActiva();
    const estado = this.estadoFiltro();
    const tipo = this.tipoFiltro();
    const query = this.busqueda().trim().toLowerCase();

    return todasDelMedico.filter((c) => {
      // Filtro por pestaña de tiempo
      if (pestana === 'hoy' && c.fecha !== this.fechaHoy) return false;
      if (pestana === 'proximas' && c.fecha <= this.fechaHoy) return false;

      // Filtro por estado
      if (estado !== 'TODOS' && c.estado !== estado) return false;

      // Filtro por tipo
      if (tipo !== 'TODOS' && c.tipo !== tipo) return false;

      // Filtro por búsqueda
      if (query) {
        const matchNombre = c.pacienteNombre.toLowerCase().includes(query);
        const matchDni = c.pacienteDni.includes(query);
        const matchHc = c.historiaClinica?.toLowerCase().includes(query) ?? false;
        const matchMotivo = c.motivo?.toLowerCase().includes(query) ?? false;
        if (!matchNombre && !matchDni && !matchHc && !matchMotivo) return false;
      }

      return true;
    });
  });

  cambiarPestana(pestana: PestanaTiempo): void {
    this.pestanaActiva.set(pestana);
  }

  setEstadoFiltro(estado: EstadoCita | 'TODOS'): void {
    this.estadoFiltro.set(estado);
  }

  onBuscar(valor: string): void {
    this.busqueda.set(valor);
  }

  abrirDetalle(cita: CitaConDetalle): void {
    this.citaSeleccionada.set(cita);
    this.modalDetalleAbierto.set(true);
  }

  iniciarConsulta(cita: CitaConDetalle): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('atender');
    this.observacionesAtencion.set(cita.observaciones ?? '');
    this.modalAccionAbierto.set(true);
  }

  abrirReprogramar(cita: CitaConDetalle): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('reprogramar');
    this.nuevaFechaReprogramar.set('2026-09-15');
    this.nuevaHoraReprogramar.set('09:00');
    this.modalAccionAbierto.set(true);
  }

  abrirCancelar(cita: CitaConDetalle): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('cancelar');
    this.motivoCancelacion.set('');
    this.modalAccionAbierto.set(true);
  }

  cerrarModales(): void {
    this.modalDetalleAbierto.set(false);
    this.modalAccionAbierto.set(false);
    this.citaSeleccionada.set(null);
  }

  ejecutarAccion(): void {
    const cita = this.citaSeleccionada();
    if (!cita) return;

    if (this.accionTipo() === 'atender') {
      this.citaService.actualizarEstadoCita(
        cita.id,
        'ATENDIDA',
        this.observacionesAtencion()
      );
      this.mostrarNotificacion('success', `La consulta con ${cita.pacienteNombre} fue registrada como atendida.`);
    } else if (this.accionTipo() === 'reprogramar') {
      this.citaService.reprogramarCita(
        cita.id,
        this.nuevaFechaReprogramar(),
        this.nuevaHoraReprogramar()
      );
      this.mostrarNotificacion('success', `Cita reprogramada con éxito para el ${this.nuevaFechaReprogramar()} a las ${this.nuevaHoraReprogramar()}.`);
    } else if (this.accionTipo() === 'cancelar') {
      this.citaService.cancelarCita(cita.id, this.motivoCancelacion());
      this.mostrarNotificacion('success', `La cita con ${cita.pacienteNombre} ha sido cancelada.`);
    }

    this.cerrarModales();
  }

  private mostrarNotificacion(tipo: 'success' | 'error', texto: string): void {
    this.mensajeFeedback.set({ tipo, texto });
    setTimeout(() => {
      this.mensajeFeedback.set(null);
    }, 4500);
  }

  getEstadoClass(estado: EstadoCita): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'badge-confirmada';
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'ATENDIDA':
        return 'badge-atendida';
      case 'CANCELADA':
        return 'badge-cancelada';
      default:
        return '';
    }
  }

  getTipoLabel(tipo: TipoConsulta): string {
    switch (tipo) {
      case 'CONSULTA_GENERAL':
        return 'Consulta General';
      case 'CONTROL':
        return 'Control';
      case 'EMERGENCIA':
        return 'Emergencia';
      case 'SEGUIMIENTO':
        return 'Seguimiento';
      default:
        return tipo;
    }
  }
}
