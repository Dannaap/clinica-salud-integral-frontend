import { Injectable, computed, signal } from '@angular/core';
import { Cita, EstadoCita, ResumenCitas, TipoConsulta } from '../models/cita.model';

export interface CitaConDetalle extends Cita {
  motivo?: string;
  consultorio?: string;
  historiaClinica?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly citasState = signal<CitaConDetalle[]>([
    {
      id: 1,
      pacienteId: 1,
      pacienteNombre: 'María López',
      pacienteDni: '45678912',
      historiaClinica: 'HC-39281',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '09:00',
      duracion: 30,
      estado: 'CONFIRMADA',
      tipo: 'CONSULTA_GENERAL',
      motivo: 'Dolor torácico agudo al realizar actividad física',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Paciente con antecedentes de hipertensión arterial leve.'
    },
    {
      id: 2,
      pacienteId: 2,
      pacienteNombre: 'Carlos Ruiz',
      pacienteDni: '41234567',
      historiaClinica: 'HC-40102',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '09:30',
      duracion: 30,
      estado: 'PENDIENTE',
      tipo: 'CONTROL',
      motivo: 'Control post-cateterismo y retiro de puntos',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Evolución favorable, traer resultados de perfil lipídico.'
    },
    {
      id: 3,
      pacienteId: 3,
      pacienteNombre: 'Ana Torres',
      pacienteDni: '43987654',
      historiaClinica: 'HC-29810',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '10:00',
      duracion: 30,
      estado: 'PENDIENTE',
      tipo: 'SEGUIMIENTO',
      motivo: 'Episodios recurrentes de arritmia y palpitaciones nocturnas',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Solicitó ecocardiograma Doppler en última cita.'
    },
    {
      id: 4,
      pacienteId: 4,
      pacienteNombre: 'Luis Mendoza',
      pacienteDni: '40123456',
      historiaClinica: 'HC-19402',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '10:30',
      duracion: 30,
      estado: 'ATENDIDA',
      tipo: 'CONSULTA_GENERAL',
      motivo: 'Chequeo cardiovascular anual preventivo',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Presión 120/80 mmHg. Electrocardiograma normal.'
    },
    {
      id: 5,
      pacienteId: 5,
      pacienteNombre: 'Sofía Ramírez',
      pacienteDni: '48765432',
      historiaClinica: 'HC-51092',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '11:00',
      duracion: 30,
      estado: 'ATENDIDA',
      tipo: 'CONTROL',
      motivo: 'Ecocardiograma de control y ajuste de dosis',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Se ajustó dosis de Enalapril a 10mg cada 12 hrs.'
    },
    {
      id: 6,
      pacienteId: 6,
      pacienteNombre: 'Diego Castro',
      pacienteDni: '47654321',
      historiaClinica: 'HC-38421',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-14',
      hora: '11:30',
      duracion: 30,
      estado: 'PENDIENTE',
      tipo: 'SEGUIMIENTO',
      motivo: 'Seguimiento de hipertensión secundaria y mapa 24h',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Pendiente lectura de registro de presión ambulatoria.'
    },
    {
      id: 7,
      pacienteId: 7,
      pacienteNombre: 'Fernando Vega',
      pacienteDni: '46543210',
      historiaClinica: 'HC-61203',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-15',
      hora: '09:00',
      duracion: 30,
      estado: 'CONFIRMADA',
      tipo: 'CONSULTA_GENERAL',
      motivo: 'Evaluación de riesgo quirúrgico preoperatorio',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Cirugía de vesícula programada para la próxima semana.'
    },
    {
      id: 8,
      pacienteId: 8,
      pacienteNombre: 'Carmen Morales',
      pacienteDni: '45432109',
      historiaClinica: 'HC-72411',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-15',
      hora: '10:00',
      duracion: 30,
      estado: 'PENDIENTE',
      tipo: 'CONTROL',
      motivo: 'Revisión e interpretación de resultados de Holter',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Trae informe emitido por centro de diagnóstico.'
    },
    {
      id: 9,
      pacienteId: 9,
      pacienteNombre: 'Roberto Salcedo',
      pacienteDni: '44321098',
      historiaClinica: 'HC-83520',
      medicoId: 3,
      medicoNombre: 'Dr. Axel Rojas',
      especialidad: 'Cardiología',
      fecha: '2026-09-16',
      hora: '10:30',
      duracion: 30,
      estado: 'CONFIRMADA',
      tipo: 'EMERGENCIA',
      motivo: 'Taquicardia en reposo y mareos frecuentes',
      consultorio: 'Consultorio 3 • Piso 2',
      observaciones: 'Derivado de triaje de urgencias médicas.'
    }
  ]);

  public readonly citas = this.citasState.asReadonly();

  obtenerCitasPorMedico(medicoId: number): CitaConDetalle[] {
    return this.citasState().filter((c) => c.medicoId === medicoId);
  }

  obtenerResumenPorMedico(medicoId: number, fecha: string = '2026-09-14'): ResumenCitas {
    const citasDelDia = this.citasState().filter(
      (c) => c.medicoId === medicoId && c.fecha === fecha
    );

    return {
      totalHoy: citasDelDia.length,
      confirmadas: citasDelDia.filter((c) => c.estado === 'CONFIRMADA').length,
      pendientes: citasDelDia.filter((c) => c.estado === 'PENDIENTE').length,
      atendidas: citasDelDia.filter((c) => c.estado === 'ATENDIDA').length,
      canceladas: citasDelDia.filter((c) => c.estado === 'CANCELADA').length,
      inasistencias: 0
    };
  }

  actualizarEstadoCita(id: number, nuevoEstado: EstadoCita, observaciones?: string): boolean {
    let actualizada = false;
    this.citasState.update((prev) =>
      prev.map((cita) => {
        if (cita.id === id) {
          actualizada = true;
          return {
            ...cita,
            estado: nuevoEstado,
            observaciones: observaciones !== undefined ? observaciones : cita.observaciones
          };
        }
        return cita;
      })
    );
    return actualizada;
  }

  reprogramarCita(id: number, nuevaFecha: string, nuevaHora: string): boolean {
    let reprogramada = false;
    this.citasState.update((prev) =>
      prev.map((cita) => {
        if (cita.id === id) {
          reprogramada = true;
          return {
            ...cita,
            fecha: nuevaFecha,
            hora: nuevaHora,
            estado: 'CONFIRMADA'
          };
        }
        return cita;
      })
    );
    return reprogramada;
  }

  cancelarCita(id: number, motivo?: string): boolean {
    return this.actualizarEstadoCita(
      id,
      'CANCELADA',
      motivo ? `Cancelada: ${motivo}` : undefined
    );
  }
}
