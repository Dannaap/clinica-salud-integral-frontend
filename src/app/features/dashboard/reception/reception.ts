import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { TurnoService } from '../../../core/services/turno.service';
import { ToastService } from '../../../core/services/toast.service';
import { Cita, ETIQUETAS_ESTADO_CITA, EstadoCita } from '../../../core/models/cita.model';
import { Turno } from '../../../core/models/turno.model';
import { fechaLargaDeHoy, hoyIso, iniciales, saludoDelDia } from '../../../core/utils/fechas';

interface MedicoDisponible {
  nombre: string;
  iniciales: string;
  especialidad: string;
  horario: string;
}

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reception.html',
  styleUrl: './reception.scss'
})
export class ReceptionComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly citaService = inject(CitaService);
  private readonly turnoService = inject(TurnoService);
  private readonly toast = inject(ToastService);

  readonly saludo = saludoDelDia();
  readonly fechaHoy = fechaLargaDeHoy();
  private readonly hoy = hoyIso();

  readonly cargandoCitas = this.citaService.cargando;
  readonly cargandoTurnos = signal<boolean>(false);
  // Cita que se está cancelando (para deshabilitar su botón)
  readonly cancelandoId = signal<number | null>(null);

  // Turnos de hoy de todos los médicos
  private readonly turnosHoy = signal<Turno[]>([]);

  get usuario() {
    const info = this.authService.usuarioActual();
    return {
      nombre: info?.nombreCompleto ?? '',
      rol: info?.rolLabel ?? '',
      iniciales: info?.iniciales ?? '',
    };
  }

  // Citas del día, ordenadas por hora
  readonly citas = computed(() => this.citaService.obtenerCitasDelDia(this.hoy));
  readonly resumenHoy = computed(() => this.citaService.resumir(this.citas()));

  // Pacientes con cita reservada hoy que aún no han sido atendidos
  readonly pacientesEspera = computed(() =>
    this.citas()
      .filter((cita) => cita.estado === 'RESERVADA')
      .map((cita) => ({
        iniciales: iniciales(cita.pacienteNombre),
        nombre: cita.pacienteNombre,
        medico: cita.medicoNombre,
        hora: cita.hora,
      }))
  );

  readonly kpis = computed(() => ({
    citasHoy: this.resumenHoy().total,
    pacientesEspera: this.pacientesEspera().length,
    proximaCita: this.pacientesEspera()[0]?.hora ?? null,
    turnosDisponibles: this.turnosHoy().filter((t) => t.estado === 'DISPONIBLE').length,
  }));

  // Médicos con al menos un turno libre hoy y el rango horario que cubren
  readonly medicos = computed<MedicoDisponible[]>(() => {
    const porMedico = new Map<number, Turno[]>();
    for (const turno of this.turnosHoy()) {
      if (turno.estado !== 'DISPONIBLE') continue;
      porMedico.set(turno.medicoId, [...(porMedico.get(turno.medicoId) ?? []), turno]);
    }

    return [...porMedico.values()].map((turnos) => {
      const desde = turnos.map((t) => t.horaInicio).sort()[0];
      const hasta = turnos.map((t) => t.horaFin).sort().at(-1);
      return {
        nombre: turnos[0].medicoNombre,
        iniciales: turnos[0].iniciales,
        especialidad: turnos[0].especialidad,
        horario: `Disponible ${desde} - ${hasta}`,
      };
    });
  });

  ngOnInit(): void {
    this.citaService.cargar();
    this.cargarTurnosDeHoy();
  }

  private cargarTurnosDeHoy(): void {
    const ahora = new Date();
    const desde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const hasta = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

    this.cargandoTurnos.set(true);
    this.turnoService
      .listar({ desde, hasta })
      .pipe(finalize(() => this.cargandoTurnos.set(false)))
      .subscribe({
        next: (turnos) => this.turnosHoy.set(turnos),
        error: () => {},
      });
  }

  cancelarCita(cita: Cita): void {
    if (this.cancelandoId() !== null) return;
    if (!confirm(`¿Cancelar la cita de ${cita.pacienteNombre} de las ${cita.hora}?`)) return;

    this.cancelandoId.set(cita.id);
    this.citaService
      .cancelar(cita.id)
      .pipe(finalize(() => this.cancelandoId.set(null)))
      .subscribe({
        next: () => {
          this.toast.exito(`La cita de ${cita.pacienteNombre} ha sido cancelada.`);
          // El turno queda libre otra vez
          this.cargarTurnosDeHoy();
        },
        error: () => {},
      });
  }

  getEstadoLabel(estado: EstadoCita): string {
    return ETIQUETAS_ESTADO_CITA[estado] ?? estado;
  }

  getEstadoClass(estado: EstadoCita): string {
    const map: Record<EstadoCita, string> = {
      RESERVADA: 'badge-pendiente',
      ATENDIDA: 'badge-atendida',
      CANCELADA: 'badge-cancelada',
      AUSENTE: 'badge-no-asistio',
    };
    return map[estado] || '';
  }

  mostrarProximamente(modulo: string): void {
    console.log(`${modulo} estará disponible en un próximo sprint`);
    alert(`${modulo} estará disponible en un próximo sprint.`);
  }
}
