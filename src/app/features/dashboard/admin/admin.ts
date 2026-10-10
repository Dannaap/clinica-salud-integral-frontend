import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CitaService } from '../../../core/services/cita.service';
import { MedicoService } from '../../../core/services/medico.service';
import { PacienteService } from '../../pacientes/paciente.service';
import { ETIQUETAS_ESTADO_CITA, EstadoCita } from '../../../core/models/cita.model';
import { fechaLargaDeHoy, hoyIso, iniciales, saludoDelDia } from '../../../core/utils/fechas';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly citaService = inject(CitaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicoService = inject(MedicoService);

  readonly saludo = saludoDelDia();
  readonly fechaHoy = fechaLargaDeHoy();
  private readonly hoy = hoyIso();

  readonly cargandoCitas = this.citaService.cargando;
  readonly cargandoMedicos = this.medicoService.cargando;

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

  readonly kpis = computed(() => {
    const historico = this.citaService.resumir(this.citaService.citas());
    const concluidas = historico.atendidas + historico.ausentes;

    return {
      citasHoy: this.resumenHoy().total,
      pacientesRegistrados: this.pacienteService.pacientes().length,
      // Citas a las que el paciente no asistió sobre el total de citas ya concluidas
      tasaInasistencias: concluidas ? Math.round((historico.ausentes / concluidas) * 100) : 0,
      inasistencias: historico.ausentes,
      atenciones: historico.atendidas,
    };
  });

  readonly doctores = computed(() =>
    this.medicoService.medicos().map((medico) => {
      const nombre = `${medico.nombres} ${medico.apellidos}`;
      return {
        nombre,
        iniciales: iniciales(nombre),
        especialidad: medico.especialidad,
        disponible: medico.activo,
      };
    })
  );

  ngOnInit(): void {
    this.citaService.cargar();
    this.pacienteService.cargar();
    this.medicoService.cargar();
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
