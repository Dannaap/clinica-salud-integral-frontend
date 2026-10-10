import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { MedicoService } from './medico.service';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  Usuario,
  UsuarioDTO,
  UsuarioStats,
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;

  private readonly medicoService = inject(MedicoService);

  // Usuarios de la clínica tal como los devuelve el backend
  private readonly _usuarios = signal<Usuario[]>([]);

  // Usuarios con la especialidad de su perfil médico (cuando lo tienen)
  readonly usuarios = computed<Usuario[]>(() =>
    this._usuarios().map((usuario) => ({
      ...usuario,
      especialidad: this.medicoService.buscarPorUsuario(usuario.id)?.especialidad,
    }))
  );

  // Estado de la carga del listado
  readonly cargando = signal<boolean>(false);

  // Filtros reactivos con Signals
  readonly busqueda = signal<string>('');
  readonly filtroRol = signal<string>('TODOS');

  // Estadísticas KPI computadas dinámicamente
  readonly stats = computed<UsuarioStats>(() => {
    const list = this.usuarios();
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
      especialidades: especialidades,
    };
  });

  // Lista filtrada reactivamente
  readonly usuariosFiltrados = computed<Usuario[]>(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();

    return this.usuarios().filter((usuario) => {
      // Filtro por texto (nombre, apellidos, correo o DNI)
      const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`.toLowerCase();
      const email = usuario.email.toLowerCase();
      const coincideTexto =
        !termino ||
        nombreCompleto.includes(termino) ||
        email.includes(termino) ||
        (usuario.dni ?? '').includes(termino) ||
        (usuario.especialidad ?? '').toLowerCase().includes(termino);

      // Filtro por rol
      const coincideRol =
        rol === 'TODOS' ||
        usuario.rol.toUpperCase() === rol.toUpperCase();

      return coincideTexto && coincideRol;
    });
  });

  // ─── Llamadas al backend ──────────────────────────────────

  // GET /usuarios
  listarTodos(): Observable<Usuario[]> {
    return this.http.get<ApiResponse<UsuarioDTO[]>>(this.url).pipe(
      map(({ data }) => data.map((dto) => this.aUsuario(dto))),
      tap((usuarios) => this._usuarios.set(usuarios))
    );
  }

  // Recarga el listado y refleja el estado de carga en `cargando`
  cargar(): void {
    this.medicoService.cargar();
    this.cargando.set(true);
    this.listarTodos()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => {} });
  }

  // POST /usuarios
  crear(usuario: CrearUsuarioRequest): Observable<Usuario> {
    return this.http.post<ApiResponse<UsuarioDTO>>(this.url, usuario).pipe(
      map(({ data }) => this.aUsuario(data)),
      tap((creado) => this._usuarios.update((lista) => [...lista, creado]))
    );
  }

  // PUT /usuarios/{id}
  actualizar(id: number, usuario: ActualizarUsuarioRequest): Observable<Usuario> {
    return this.http.put<ApiResponse<UsuarioDTO>>(`${this.url}/${id}`, usuario).pipe(
      map(({ data }) => this.aUsuario(data)),
      tap((actualizado) =>
        this._usuarios.update((lista) =>
          // Se conservan los datos que no vienen del endpoint (p. ej. la especialidad)
          lista.map((u) => (u.id === id ? { ...u, ...actualizado } : u))
        )
      )
    );
  }

  // DELETE /usuarios/{id}
  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(
      map(() => undefined),
      tap(() => this._usuarios.update((lista) => lista.filter((u) => u.id !== id)))
    );
  }

  // Métodos de mutación de filtros
  setBusqueda(termino: string): void {
    this.busqueda.set(termino);
  }

  setFiltroRol(rol: string): void {
    this.filtroRol.set(rol);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroRol.set('TODOS');
  }

  // Adapta el UsuarioDTO del backend al modelo que usan las vistas
  private aUsuario(dto: UsuarioDTO): Usuario {
    return {
      id: dto.id,
      dni: dto.dni,
      nombre: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      rol: dto.rol,
      activo: true,
      iniciales: `${dto.nombres.charAt(0)}${dto.apellidos.charAt(0)}`.toUpperCase(),
    };
  }
}
