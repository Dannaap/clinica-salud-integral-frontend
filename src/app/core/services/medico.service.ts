import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Medico } from '../models/medico.model';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/medicos`;

  private readonly _medicos = signal<Medico[]>([]);
  readonly medicos = this._medicos.asReadonly();
  readonly cargando = signal<boolean>(false);

  // Médicos que pueden recibir citas
  readonly medicosActivos = computed<Medico[]>(() => this._medicos().filter((m) => m.activo));

  // GET /medicos
  listar(): Observable<Medico[]> {
    return this.http.get<ApiResponse<Medico[]>>(this.url).pipe(
      map(({ data }) => data),
      tap((medicos) => this._medicos.set(medicos))
    );
  }

  cargar(): void {
    this.cargando.set(true);
    this.listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => {} });
  }

  // El backend no filtra por especialidad: se filtra sobre el catálogo ya cargado
  filtrarPorEspecialidad(especialidadId: number | null): Medico[] {
    return especialidadId === null
      ? this.medicosActivos()
      : this.medicosActivos().filter((m) => m.especialidadId === especialidadId);
  }

  // Perfil médico asociado a una cuenta de usuario (si lo tiene)
  buscarPorUsuario(usuarioId: number): Medico | undefined {
    return this._medicos().find((m) => m.usuarioId === usuarioId);
  }
}
