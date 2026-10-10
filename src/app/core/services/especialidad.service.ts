import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Especialidad } from '../models/especialidad.model';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/especialidades`;

  private readonly _especialidades = signal<Especialidad[]>([]);
  readonly especialidades = this._especialidades.asReadonly();
  readonly cargando = signal<boolean>(false);

  // GET /especialidades
  listar(): Observable<Especialidad[]> {
    return this.http.get<ApiResponse<Especialidad[]>>(this.url).pipe(
      map(({ data }) => [...data].sort((a, b) => a.nombre.localeCompare(b.nombre))),
      tap((especialidades) => this._especialidades.set(especialidades))
    );
  }

  cargar(): void {
    this.cargando.set(true);
    this.listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => {} });
  }
}
