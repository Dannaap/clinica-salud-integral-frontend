import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar';
import { HeaderComponent } from '../../../shared/components/header/header';
import { AuthService } from '../../../core/services/auth.service';

interface Cita {
  hora: string;
  paciente: string;
  medico: string;
  especialidad: string;
  estado: 'Confirmada' | 'Pendiente' | 'Atendida' | 'No asistió';
}

interface Doctor {
  nombre: string;
  especialidad: string;
  foto: string;
  disponible: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent {
  private readonly authService = inject(AuthService);

  private readonly infoSesion = this.authService.usuarioActual();

  usuario = {
    nombre: this.infoSesion?.nombreCompleto ?? 'Dr. Juan Pérez',
    rol: this.infoSesion?.rolLabel ?? 'Administrador',
    iniciales: this.infoSesion?.iniciales ?? 'JP'
  };

  kpis = {
    citasHoy: 12,
    pacientesRegistrados: 348,
    tasaInasistencias: 8,
    historiasClinicas: 312
  };

  citas: Cita[] = [
    { hora: '09:00', paciente: 'María López', medico: 'Dr. Axel Rojas', especialidad: 'Gastroenterología', estado: 'Confirmada' },
    { hora: '09:30', paciente: 'Carlos Ruiz', medico: 'Dra. Glenda Zambrano', especialidad: 'Cardiología', estado: 'Pendiente' },
    { hora: '10:00', paciente: 'Ana Torres', medico: 'Dr. Pablo Salazar', especialidad: 'Neurología', estado: 'Confirmada' },
    { hora: '10:30', paciente: 'Luis Mendoza', medico: 'Dra. Jackelyn Muñoz', especialidad: 'Pediatría', estado: 'No asistió' },
    { hora: '11:00', paciente: 'Sofía Ramírez', medico: 'Dr. Aldo Landeo', especialidad: 'Gastroenterología', estado: 'Atendida' }
  ];

  doctores: Doctor[] = [
    { 
      nombre: 'Dr. Axel Alonso Rojas', 
      especialidad: 'Gastroenterólogo', 
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2ARzQUm0i6EwgosKDj1PnTbqnADvkR8joxWzLZkCuTAlMVrDTnddgoORqHekRtPGIunGUQseo90Za5CkeL6ZImpuM-KMtZx8d_WFfOgiNwWAQXySAF52zGHOwn3oSL_luXJcRdvv4Kvq84UB9WV-F9QtxWnu1RtAyr8H6Ai39hauKv_yrtwWqARsBcHX4kOFBilLMbIWdng0Jb2U28wel6T1RRmR1zLSNRGKDL4Vdtq3J-oiPuKsWLg', 
      disponible: true 
    },
    { 
      nombre: 'Dra. Glenda Zambrano', 
      especialidad: 'Gastroenteróloga', 
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEHWcO3fAztjhfC-oNvMIv1x0eQSguYoECTy68OtSUU8SiodoJrcM3TBaHzA8UabIQN9gUieqgIlWlp2NptD8oVSvLZWlASm6GTH-HZKpJ38fAU_8bxjNSuEI-BG5jIz4lYRXpxwDqjkCCYUcDJnBBARknyEW3HV7xvs7FHN-WqLQfaL2NX-nLPBNO0wfqUg5qkENhBmLAbk0wA6XQnkhIcqaKrVZYIOZseAQ6T421IicIuJSGZV7y2w', 
      disponible: true 
    },
    { 
      nombre: 'Dr. Pablo Salazar Vilcaluri', 
      especialidad: 'Gastroenterólogo', 
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtJSzDl2-vb4JcOsp8vjChVHumVjyjWVio9OCy-5i2QxVGBAMwAwYKCVAUGqgeYKP2DF3Rvtkx0dXl_M3Y-WCDGTrTg2hiDm2f-nui4ta9aScII9v5H4OGSh_qn6kwe9eygu6sI4kq3Ij3gc7F21E3rajB546TWKul46Q28WA-D6SsStHGmXdzyCHaZMt4M8YgwB6hTN3SKs96y_mu50gwem3h0V4HcXaSbq7nUbToiz4GJN-Gn7DVVQ', 
      disponible: true 
    },
    { 
      nombre: 'Dra. Jackelyn Muñoz Sosa', 
      especialidad: 'Gastroenteróloga Pediátrica', 
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASxcURHkxRleXavcfZGOjyXkUE2Q-0Tl17fvWqAswFQmSu2M80CHUMSZT_r3A11BBG2XgDFPCrKbjbJURmWMlLaLZasnNGHHWccZJTSKsa4c_2vCu5LCgb19XjdcEsVmNDCQpE0yUg-IJM69edeE_RXe0Jqa11Ax2HGwww1cgbq1j8z8MekSsE4qUDqKRNNE0pYs7iiUAy-7LorjYQIrbq9LtDMKuxSiZWDvG-yHnQ39o25pdAL4Wqbw', 
      disponible: false 
    }
  ];

  getEstadoClass(estado: string): string {
    const map: { [key: string]: string } = {
      'Confirmada': 'badge-confirmada',
      'Pendiente': 'badge-pendiente',
      'Atendida': 'badge-atendida',
      'No asistió': 'badge-no-asistio'
    };
    return map[estado] || '';
  }

  sidebarAbierto: boolean = false;

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }
}