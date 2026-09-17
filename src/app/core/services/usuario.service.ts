import { Injectable, computed, signal } from '@angular/core';
import { Rol, Usuario, UsuarioStats } from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Lista base de usuarios de la clínica
  private readonly _usuarios = signal<Usuario[]>([
    {
      id: 1,
      nombre: 'Dr. Juan',
      apellidos: 'Pérez',
      cargo: 'Director Médico / Administrador',
      email: 'jperez@saludintegral.pe',
      rol: 'ADMIN',
      ultimoAcceso: '15/09/2026 08:12',
      activo: true,
      iniciales: 'JP',
    },
    {
      id: 2,
      nombre: 'Lucía',
      apellidos: 'Fernández',
      cargo: 'Jefa de Recepción',
      email: 'lfernandez@saludintegral.pe',
      rol: 'RECEPCION',
      ultimoAcceso: '15/09/2026 07:45',
      activo: true,
      iniciales: 'LF',
    },
    {
      id: 3,
      nombre: 'Dr. Axel Alonso',
      apellidos: 'Rojas',
      especialidad: 'Gastroenterología',
      email: 'arojas@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '14/09/2026 18:30',
      activo: true,
      iniciales: 'AR',
    },
    {
      id: 4,
      nombre: 'Dra. Glenda',
      apellidos: 'Zambrano',
      especialidad: 'Cardiología',
      email: 'gzambrano@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '14/09/2026 17:15',
      activo: true,
      iniciales: 'GZ',
    },
    {
      id: 5,
      nombre: 'Dr. Pablo',
      apellidos: 'Salazar Vilcaluri',
      especialidad: 'Neurología',
      email: 'psalazar@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '13/09/2026 19:00',
      activo: true,
      iniciales: 'PS',
    },
    {
      id: 6,
      nombre: 'Dra. Jackelyn',
      apellidos: 'Muñoz Sosa',
      especialidad: 'Pediatría',
      email: 'jmunoz@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '12/09/2026 16:20',
      activo: true,
      iniciales: 'JM',
    },
    {
      id: 7,
      nombre: 'Carlos',
      apellidos: 'Mendoza',
      cargo: 'Administrador de Sistemas',
      email: 'cmendoza@saludintegral.pe',
      rol: 'ADMIN',
      ultimoAcceso: '12/09/2026 11:30',
      activo: true,
      iniciales: 'CM',
    },
    {
      id: 8,
      nombre: 'Mariana',
      apellidos: 'Vargas Torres',
      cargo: 'Recepcionista Turno Mañana',
      email: 'mvargas@saludintegral.pe',
      rol: 'RECEPCION',
      ultimoAcceso: '11/09/2026 08:00',
      activo: true,
      iniciales: 'MV',
    },
    {
      id: 9,
      nombre: 'Jorge',
      apellidos: 'Quispe Huamán',
      cargo: 'Recepcionista Turno Tarde',
      email: 'jquispe@saludintegral.pe',
      rol: 'RECEPCION',
      ultimoAcceso: '10/09/2026 14:10',
      activo: true,
      iniciales: 'JQ',
    },
    {
      id: 10,
      nombre: 'Andrea',
      apellidos: 'Salas Ríos',
      cargo: 'Recepción Central',
      email: 'asalas@saludintegral.pe',
      rol: 'RECEPCION',
      ultimoAcceso: '09/09/2026 09:15',
      activo: true,
      iniciales: 'AS',
    },
    {
      id: 11,
      nombre: 'Dr. Roberto',
      apellidos: 'Castillo',
      especialidad: 'Traumatología',
      email: 'rcastillo@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '08/09/2026 15:40',
      activo: true,
      iniciales: 'RC',
    },
    {
      id: 12,
      nombre: 'Dra. Patricia',
      apellidos: 'Navarro',
      especialidad: 'Dermatología',
      email: 'pnavarro@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '08/09/2026 12:00',
      activo: true,
      iniciales: 'PN',
    },
    {
      id: 13,
      nombre: 'Dr. Fernando',
      apellidos: 'García',
      especialidad: 'Oftalmología',
      email: 'fgarcia@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '07/09/2026 17:30',
      activo: true,
      iniciales: 'FG',
    },
    {
      id: 14,
      nombre: 'Dra. Diana',
      apellidos: 'Flores',
      especialidad: 'Ginecología',
      email: 'dflores@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '07/09/2026 10:20',
      activo: true,
      iniciales: 'DF',
    },
    {
      id: 15,
      nombre: 'Dr. Manuel',
      apellidos: 'Romero',
      especialidad: 'Urología',
      email: 'mromero@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '06/09/2026 16:50',
      activo: true,
      iniciales: 'MR',
    },
    {
      id: 16,
      nombre: 'Dra. Sofía',
      apellidos: 'Gutiérrez',
      especialidad: 'Otorrinolaringología',
      email: 'sgutierrez@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '05/09/2026 14:00',
      activo: true,
      iniciales: 'SG',
    },
    {
      id: 17,
      nombre: 'Dr. Hugo',
      apellidos: 'Bustamante',
      especialidad: 'Medicina Interna',
      email: 'hbustamante@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '04/09/2026 18:15',
      activo: true,
      iniciales: 'HB',
    },
    {
      id: 18,
      nombre: 'Dr. Víctor',
      apellidos: 'Cárdenas',
      especialidad: 'Endocrinología',
      email: 'vcardenas@saludintegral.pe',
      rol: 'MEDICO',
      ultimoAcceso: '03/09/2026 11:45',
      activo: true,
      iniciales: 'VC',
    },
  ]);

  // Filtros reactivos con Signals
  readonly busqueda = signal<string>('');
  readonly filtroRol = signal<string>('TODOS');
  readonly filtroEstado = signal<string>('TODOS');

  // Estadísticas KPI computadas dinámicamente
  readonly stats = computed<UsuarioStats>(() => {
    const list = this._usuarios();
    const admins = list.filter((u) => u.rol === 'ADMIN').length;
    const recepcion = list.filter((u) => u.rol === 'RECEPCION').length;
    const medicos = list.filter((u) => u.rol === 'MEDICO').length;

    // Calcular especialidades únicas
    const especialidades = new Set(
      list.filter((u) => u.especialidad).map((u) => u.especialidad)
    ).size;

    return {
      totalUsuarios: list.length,
      administradores: admins,
      recepcion: recepcion,
      medicos: medicos,
      especialidades: especialidades || 8,
    };
  });

  // Lista filtrada reactivamente
  readonly usuariosFiltrados = computed<Usuario[]>(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    const estado = this.filtroEstado();

    return this._usuarios().filter((usuario) => {
      // Filtro por texto (nombre, apellidos o correo)
      const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.toLowerCase();
      const email = usuario.email.toLowerCase();
      const cargo = (usuario.cargo || usuario.especialidad || '').toLowerCase();
      const coincideTexto =
        !termino ||
        nombreCompleto.includes(termino) ||
        email.includes(termino) ||
        cargo.includes(termino);

      // Filtro por rol
      const coincideRol =
        rol === 'TODOS' ||
        usuario.rol.toUpperCase() === rol.toUpperCase();

      // Filtro por estado
      const coincideEstado =
        estado === 'TODOS' ||
        (estado === 'ACTIVO' && usuario.activo) ||
        (estado === 'INACTIVO' && !usuario.activo);

      return coincideTexto && coincideRol && coincideEstado;
    });
  });

  // Métodos de mutación de filtros
  setBusqueda(termino: string): void {
    this.busqueda.set(termino);
  }

  setFiltroRol(rol: string): void {
    this.filtroRol.set(rol);
  }

  setFiltroEstado(estado: string): void {
    this.filtroEstado.set(estado);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroRol.set('TODOS');
    this.filtroEstado.set('TODOS');
  }
}
