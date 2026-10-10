import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { ETIQUETAS_ESTADO_CITA, EstadoCita } from '../../../core/models/cita.model';
import {
  aFechaHoraIso,
  fechaLargaDeHoy,
  formatearFecha,
  hoyIso,
  iniciales,
  saludoDelDia,
} from '../../../core/utils/fechas';

@Component({
  selector: 'app-medical',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medical.html',
  styleUrl: './medical.scss'
})
export class MedicalComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly citaService = inject(CitaService);

  readonly saludo = saludoDelDia();
  readonly fechaHoy = fechaLargaDeHoy();
  readonly fechaCorta = formatearFecha(hoyIso());
  private readonly hoy = hoyIso();

  readonly cargando = this.citaService.cargando;

  get usuario() {
    const info = this.authService.usuarioActual();
    return {
      nombre: info?.nombreCompleto ?? '',
      especialidad: info?.especialidad ?? 'Médico general',
      iniciales: info?.iniciales ?? '',
    };
  }

  // GET /citas ya devuelve solo las citas del médico en sesión
  readonly agenda = computed(() => this.citaService.obtenerCitasDelDia(this.hoy));
  readonly resumenHoy = computed(() => this.citaService.resumir(this.agenda()));

  // Cita reservada más próxima (de hoy en adelante)
  readonly proximaConsulta = computed(() => {
    const ahora = aFechaHoraIso(new Date());
    const cita = this.citaService
      .citas()
      .find((c) => c.estado === 'RESERVADA' && c.inicio >= ahora);

    return cita
      ? {
          paciente: cita.pacienteNombre,
          dni: `••${cita.pacienteDni.slice(-4)}`,
          especialidad: cita.especialidad,
          hora: cita.hora,
          fecha: cita.fecha === this.hoy ? 'Hoy' : formatearFecha(cita.fecha),
        }
      : null;
  });

  readonly pacientesEspera = computed(() =>
    this.agenda()
      .filter((cita) => cita.estado === 'RESERVADA')
      .map((cita) => ({
        iniciales: iniciales(cita.pacienteNombre),
        nombre: cita.pacienteNombre,
        motivo: cita.motivo || 'Consulta médica programada',
        hora: cita.hora,
      }))
  );

  readonly kpis = computed(() => {
    const mesActual = this.hoy.slice(0, 7);
    return {
      consultasHoy: this.resumenHoy().total,
      enEspera: this.pacientesEspera().length,
      atencionesMes: this.citaService
        .citas()
        .filter((c) => c.estado === 'ATENDIDA' && c.fecha.startsWith(mesActual)).length,
    };
  });

  // Últimos pacientes atendidos (uno por paciente, del más reciente al más antiguo)
  readonly pacientesRecientes = computed(() => {
    const vistos = new Set<number>();
    return this.citaService
      .citas()
      .filter((c) => c.estado === 'ATENDIDA')
      .sort((a, b) => b.inicio.localeCompare(a.inicio))
      .filter((c) => !vistos.has(c.pacienteId) && vistos.add(c.pacienteId))
      .slice(0, 4)
      .map((c) => ({
        iniciales: iniciales(c.pacienteNombre),
        nombre: c.pacienteNombre,
        ultima: formatearFecha(c.fecha),
      }));
  });

  ngOnInit(): void {
    this.citaService.cargar();
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
