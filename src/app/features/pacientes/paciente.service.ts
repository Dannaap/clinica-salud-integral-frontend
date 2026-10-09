import { Injectable, signal } from '@angular/core';

import { Paciente, PacienteFormValue } from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly pacientesState = signal<Paciente[]>([
    {
      id: 1,
      dni: '45678912',
      nombres: 'María López',
      apellidos: 'Gutiérrez',
      fechaNacimiento: '1992-03-14',
      sexo: 'Femenino',
      telefono: '+51 987 654 321',
      correo: 'maria.lopez@email.com',
      tipoSangre: 'O+',
      direccion: 'Av. Guardia Civil 450, San Borja, Lima',
      alergias: 'Ninguna registrada',
      ultimaAtencion: '12/09/2026',
      citasActivas: 2,
      estado: 'Activo',
    },
    {
      id: 2,
      dni: '41234567',
      nombres: 'Carlos Ruiz',
      apellidos: 'Mendoza',
      fechaNacimiento: '1981-07-22',
      sexo: 'Masculino',
      telefono: '+51 912 345 678',
      correo: 'carlos.ruiz@email.com',
      tipoSangre: 'A+',
      ultimaAtencion: '05/09/2026',
      citasActivas: 1,
      estado: 'Activo',
    },
    {
      id: 3,
      dni: '43987654',
      nombres: 'Ana Torres',
      apellidos: 'Vega',
      fechaNacimiento: '1998-11-02',
      sexo: 'Femenino',
      telefono: '+51 998 765 432',
      correo: 'ana.torres@email.com',
      tipoSangre: 'B+',
      ultimaAtencion: '28/08/2026',
      citasActivas: 0,
      estado: 'Activo',
    },
    {
      id: 4,
      dni: '40123456',
      nombres: 'Luis Mendoza',
      apellidos: 'Ríos',
      fechaNacimiento: '1974-05-09',
      sexo: 'Masculino',
      telefono: '+51 956 789 123',
      correo: 'luis.mendoza@email.com',
      tipoSangre: 'O-',
      ultimaAtencion: '20/08/2026',
      citasActivas: 1,
      estado: 'Inactivo',
    },
    {
      id: 5,
      dni: '47891234',
      nombres: 'Sofía Ramírez',
      apellidos: 'Cruz',
      fechaNacimiento: '1996-01-30',
      sexo: 'Femenino',
      telefono: '+51 934 567 890',
      correo: 'sofia.ramirez@email.com',
      tipoSangre: 'AB+',
      ultimaAtencion: '15/09/2026',
      citasActivas: 3,
      estado: 'Activo',
    },
    {
      id: 6,
      dni: '42567891',
      nombres: 'Diego Castro',
      apellidos: 'Núñez',
      fechaNacimiento: '1985-09-18',
      sexo: 'Masculino',
      telefono: '+51 921 456 789',
      correo: 'diego.castro@email.com',
      tipoSangre: 'A-',
      ultimaAtencion: '10/09/2026',
      citasActivas: 1,
      estado: 'Activo',
    },
    {
      id: 7,
      dni: '48765432',
      nombres: 'Patricia Vega',
      apellidos: 'Salas',
      fechaNacimiento: '2001-04-27',
      sexo: 'Femenino',
      telefono: '+51 989 234 567',
      correo: 'patricia.vega@email.com',
      tipoSangre: 'B-',
      ultimaAtencion: undefined,
      citasActivas: 0,
      estado: 'Nuevo',
    },
    {
      id: 8,
      dni: '44321098',
      nombres: 'Jorge Rivas',
      apellidos: 'Paredes',
      fechaNacimiento: '1988-12-05',
      sexo: 'Masculino',
      telefono: '+51 977 345 678',
      correo: 'jorge.rivas@email.com',
      tipoSangre: 'O+',
      ultimaAtencion: '02/09/2026',
      citasActivas: 2,
      estado: 'Activo',
    },
  ]);

  readonly pacientes = this.pacientesState.asReadonly();

  buscarPorDni(dni: string): Paciente | undefined {
    return this.pacientesState().find((paciente) => paciente.dni === dni.trim());
  }

  obtenerPorId(id: number): Paciente | undefined {
    return this.pacientesState().find((paciente) => paciente.id === id);
  }

  crear(datos: PacienteFormValue): Paciente {
    const nuevoPaciente: Paciente = {
      ...datos,
      id: Math.max(...this.pacientesState().map((paciente) => paciente.id), 0) + 1,
      citasActivas: 0,
      estado: 'Nuevo',
      ultimaAtencion: undefined,
    };

    this.pacientesState.update((pacientes) => [nuevoPaciente, ...pacientes]);
    return nuevoPaciente;
  }

  actualizar(id: number, datos: PacienteFormValue): Paciente | undefined {
    const pacienteActualizado = this.obtenerPorId(id);

    if (!pacienteActualizado) {
      return undefined;
    }

    const actualizado: Paciente = {
      ...pacienteActualizado,
      ...datos,
    };

    this.pacientesState.update((pacientes) =>
      pacientes.map((paciente) => (paciente.id === id ? actualizado : paciente)),
    );

    return actualizado;
  }

  eliminar(id: number): boolean {
    const existe = this.pacientesState().some((paciente) => paciente.id === id);
    if (!existe) {
      return false;
    }

    this.pacientesState.update((pacientes) =>
      pacientes.filter((paciente) => paciente.id !== id),
    );
    return true;
  }
}
