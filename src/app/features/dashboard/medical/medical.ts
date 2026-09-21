import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/header/header';
import { AuthService } from '../../../core/services/auth.service';

interface CitaAgenda {
  hora: string;
  paciente: string;
  hc: string;
  motivo: string;
  estado: 'En consulta' | 'Pendiente' | 'Atendida';
}

interface PacienteEspera {
  iniciales: string;
  nombre: string;
  motivo: string;
  hora: string;
}

interface PacienteReciente {
  iniciales: string;
  nombre: string;
  ultima: string;
}

@Component({
  selector: 'app-medical',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './medical.html',
  styleUrl: './medical.scss'
})
export class MedicalComponent {
  private readonly authService = inject(AuthService);

  get usuario() {
    const u = this.authService.obtenerUsuario();
    const nombre = u ? `Dr. ${u.nombre} ${u.apellidos}`.trim() : 'Dr. Axel Rojas';
    const iniciales = u
      ? `${u.nombre.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase()
      : 'AR';
    return {
      nombre,
      especialidad: 'Cardiólogo',
      iniciales,
    };
  }

  kpis = { consultasHoy: 8, enEspera: 2, atencionesMes: 47 };

  agenda: CitaAgenda[] = [
    { hora: '09:00', paciente: 'María López', hc: '#39281', motivo: 'Dolor torácico agudo', estado: 'En consulta' },
    { hora: '09:30', paciente: 'Carlos Ruiz', hc: '#40102', motivo: 'Control post-cateterismo', estado: 'Pendiente' },
    { hora: '10:00', paciente: 'Ana Torres', hc: '#29810', motivo: 'Arritmia y palpitaciones', estado: 'Pendiente' },
    { hora: '10:30', paciente: 'Luis Mendoza', hc: '#19402', motivo: 'Chequeo cardiovascular', estado: 'Atendida' },
    { hora: '11:00', paciente: 'Sofía Ramírez', hc: '#51092', motivo: 'Ecocardiograma de control', estado: 'Atendida' },
    { hora: '11:30', paciente: 'Diego Castro', hc: '#38421', motivo: 'Seguimiento de hipertensión', estado: 'Pendiente' }
  ];

  pacientesEspera: PacienteEspera[] = [
    { iniciales: 'CR', nombre: 'Carlos Ruiz', motivo: 'Control post-cateterismo', hora: '09:30' },
    { iniciales: 'AT', nombre: 'Ana Torres', motivo: 'Arritmia y palpitaciones', hora: '10:00' }
  ];

  pacientesRecientes: PacienteReciente[] = [
    { iniciales: 'ML', nombre: 'María López', ultima: '12/09/2026' },
    { iniciales: 'CR', nombre: 'Carlos Ruiz', ultima: '05/09/2026' },
    { iniciales: 'AT', nombre: 'Ana Torres', ultima: '28/08/2026' },
    { iniciales: 'LM', nombre: 'Luis Mendoza', ultima: '20/08/2026' }
  ];

  sidebarAbierto = false;
  toggleSidebar() { this.sidebarAbierto = !this.sidebarAbierto; }

  getEstadoClass(estado: string): string {
    const map: { [key: string]: string } = {
      'En consulta': 'badge-en-consulta',
      'Pendiente': 'badge-pendiente',
      'Atendida': 'badge-atendida'
    };
    return map[estado] || '';
  }

  mostrarProximamente(modulo: string): void {
    console.log(`${modulo} estará disponible en un próximo sprint`);
    alert(`${modulo} estará disponible en un próximo sprint.`);
  }
}