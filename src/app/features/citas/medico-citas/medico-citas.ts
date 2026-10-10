import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { TurnoService } from '../../../core/services/turno.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cita, ETIQUETAS_ESTADO_CITA, EstadoCita } from '../../../core/models/cita.model';
import { Turno } from '../../../core/models/turno.model';
import { formatearFecha, hoyIso } from '../../../core/utils/fechas';

export type PestanaTiempo = 'hoy' | 'proximas' | 'todas';

// Código CIE-10 que valida el backend: letra + 2 dígitos y subcategoría opcional (p. ej. K29.7)
const PATRON_CIE10 = /^[A-Za-z][0-9]{2}(\.[A-Za-z0-9]{1,4})?$/;

@Component({
  selector: 'app-medico-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './medico-citas.html',
  styleUrl: './medico-citas.scss'
})
export class MedicoCitasComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly citaService = inject(CitaService);
  private readonly turnoService = inject(TurnoService);
  private readonly toast = inject(ToastService);

  readonly usuario = this.authService.usuarioActual;
  readonly cargando = this.citaService.cargando;

  // Permisos según el rol (los mismos que aplica el backend)
  readonly puedeAtender = computed(() => !!this.usuario()?.esMedico || !!this.usuario()?.esAdmin);
  readonly puedeGestionar = computed(
    () => !!this.usuario()?.esAdmin || !!this.usuario()?.esRecepcion
  );

  readonly fechaHoy = hoyIso();

  pestanaActiva = signal<PestanaTiempo>('hoy');
  estadoFiltro = signal<EstadoCita | 'TODOS'>('TODOS');
  busqueda = signal<string>('');

  citaSeleccionada = signal<Cita | null>(null);
  get cita(): Cita | null {
    return this.citaSeleccionada();
  }
  modalDetalleAbierto = signal<boolean>(false);
  modalAccionAbierto = signal<boolean>(false);
  accionTipo = signal<'atender' | 'cancelar' | 'reprogramar'>('atender');
  procesando = signal<boolean>(false);

  // Formulario de atención
  motivoConsulta = signal<string>('');
  diagnostico = signal<string>('');
  codigoCie10 = signal<string>('');
  notasAtencion = signal<string>('');

  // Reprogramación: turnos libres del mismo médico
  turnosDisponibles = signal<Turno[]>([]);
  cargandoTurnos = signal<boolean>(false);
  turnoSeleccionadoId = signal<number | null>(null);

  // El backend ya entrega solo las citas del médico cuando el rol es MEDICO
  kpis = computed(() => this.citaService.obtenerResumenDelDia(this.fechaHoy));

  citasFiltradas = computed(() => {
    const pestana = this.pestanaActiva();
    const estado = this.estadoFiltro();
    const query = this.busqueda().trim().toLowerCase();

    return this.citaService.citas().filter((c) => {
      if (pestana === 'hoy' && c.fecha !== this.fechaHoy) return false;
      if (pestana === 'proximas' && c.fecha <= this.fechaHoy) return false;
      if (estado !== 'TODOS' && c.estado !== estado) return false;

      if (query) {
        const matchNombre = c.pacienteNombre.toLowerCase().includes(query);
        const matchDni = c.pacienteDni.includes(query);
        const matchMedico = c.medicoNombre.toLowerCase().includes(query);
        const matchMotivo = c.motivo?.toLowerCase().includes(query) ?? false;
        if (!matchNombre && !matchDni && !matchMedico && !matchMotivo) return false;
      }

      return true;
    });
  });

  // El formulario activo está completo y puede enviarse
  accionValida = computed(() => {
    switch (this.accionTipo()) {
      case 'atender':
        return (
          !!this.motivoConsulta().trim() &&
          !!this.diagnostico().trim() &&
          PATRON_CIE10.test(this.codigoCie10().trim())
        );
      case 'reprogramar':
        return this.turnoSeleccionadoId() !== null;
      default:
        return true;
    }
  });

  ngOnInit(): void {
    this.citaService.cargar();
  }

  cambiarPestana(pestana: PestanaTiempo): void {
    this.pestanaActiva.set(pestana);
  }

  setEstadoFiltro(estado: EstadoCita | 'TODOS'): void {
    this.estadoFiltro.set(estado);
  }

  onBuscar(valor: string): void {
    this.busqueda.set(valor);
  }

  abrirDetalle(cita: Cita): void {
    this.citaSeleccionada.set(cita);
    this.modalDetalleAbierto.set(true);
  }

  iniciarConsulta(cita: Cita): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('atender');
    this.motivoConsulta.set(cita.motivo ?? '');
    this.diagnostico.set('');
    this.codigoCie10.set('');
    this.notasAtencion.set('');
    this.modalAccionAbierto.set(true);
  }

  abrirReprogramar(cita: Cita): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('reprogramar');
    this.turnoSeleccionadoId.set(null);
    this.turnosDisponibles.set([]);
    this.modalAccionAbierto.set(true);

    this.cargandoTurnos.set(true);
    this.turnoService
      .listarDisponibles(cita.medicoId)
      .pipe(finalize(() => this.cargandoTurnos.set(false)))
      .subscribe({
        next: (turnos) => this.turnosDisponibles.set(turnos),
        error: () => {},
      });
  }

  abrirCancelar(cita: Cita): void {
    this.citaSeleccionada.set(cita);
    this.accionTipo.set('cancelar');
    this.modalAccionAbierto.set(true);
  }

  cerrarModales(): void {
    if (this.procesando()) return;
    this.modalDetalleAbierto.set(false);
    this.modalAccionAbierto.set(false);
    this.citaSeleccionada.set(null);
  }

  ejecutarAccion(): void {
    const cita = this.citaSeleccionada();
    if (!cita || !this.accionValida() || this.procesando()) return;

    let peticion: Observable<unknown>;
    let mensajeExito: string;

    if (this.accionTipo() === 'atender') {
      peticion = this.citaService.registrarAtencion({
        citaId: cita.id,
        motivoConsulta: this.motivoConsulta().trim(),
        diagnostico: this.diagnostico().trim(),
        codigoCie10: this.codigoCie10().trim().toUpperCase(),
        notas: this.notasAtencion().trim() || undefined,
      });
      mensajeExito = `La consulta con ${cita.pacienteNombre} fue registrada como atendida.`;
    } else if (this.accionTipo() === 'reprogramar') {
      const turno = this.turnosDisponibles().find((t) => t.id === this.turnoSeleccionadoId())!;
      peticion = this.citaService.reprogramar(cita.id, turno.id);
      mensajeExito = `Cita reprogramada con éxito para el ${this.fecha(turno.fecha)} a las ${turno.horaInicio}.`;
    } else {
      peticion = this.citaService.cancelar(cita.id);
      mensajeExito = `La cita con ${cita.pacienteNombre} ha sido cancelada.`;
    }

    this.procesando.set(true);
    peticion.pipe(finalize(() => this.procesando.set(false))).subscribe({
      next: () => {
        this.toast.exito(mensajeExito);
        this.procesando.set(false);
        this.cerrarModales();
      },
      // El mensaje de error lo muestra el interceptor global
      error: () => {},
    });
  }

  fecha(fechaIso: string): string {
    return formatearFecha(fechaIso);
  }

  getEstadoLabel(estado: EstadoCita): string {
    return ETIQUETAS_ESTADO_CITA[estado] ?? estado;
  }

  getEstadoClass(estado: EstadoCita): string {
    switch (estado) {
      case 'RESERVADA': return 'badge-pendiente';
      case 'ATENDIDA': return 'badge-atendida';
      case 'CANCELADA': return 'badge-cancelada';
      case 'AUSENTE': return 'badge-ausente';
      default: return '';
    }
  }
}
