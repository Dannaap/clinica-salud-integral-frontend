import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../core/models/api-response.model';
import { sinToastDeError } from '../../core/utils/http-context';
import { Paciente, PacienteFormValue } from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pacientes`;

  private readonly pacientesState = signal<Paciente[]>([]);

  readonly pacientes = this.pacientesState.asReadonly();
  readonly cargando = signal(false);

  // GET /pacientes (el backend devuelve el padrón completo; la paginación es local)
  listar(): Observable<Paciente[]> {
    return this.http.get<ApiResponse<Paciente[]>>(this.url).pipe(
      map(({ data }) => data),
      tap((pacientes) => this.pacientesState.set(pacientes)),
    );
  }

  // Recarga el padrón y refleja el estado de carga en `cargando`
  cargar(): void {
    this.cargando.set(true);
    this.listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => {} });
  }

  // GET /pacientes/dni/{dni}. Devuelve null si no hay un paciente con ese DNI.
  buscarPorDni(dni: string): Observable<Paciente | null> {
    return this.http
      .get<ApiResponse<Paciente>>(`${this.url}/dni/${dni.trim()}`, { context: sinToastDeError() })
      .pipe(
        map(({ data }) => data),
        catchError((error: unknown) =>
          error instanceof HttpErrorResponse && error.status === 404
            ? of(null)
            : throwError(() => error),
        ),
      );
  }

  // GET /pacientes/{id}
  obtenerPorId(id: number): Observable<Paciente> {
    return this.http.get<ApiResponse<Paciente>>(`${this.url}/${id}`).pipe(map(({ data }) => data));
  }

  // POST /pacientes
  crear(datos: PacienteFormValue): Observable<Paciente> {
    return this.http.post<ApiResponse<Paciente>>(this.url, datos).pipe(
      map(({ data }) => data),
      tap((nuevo) => this.pacientesState.update((pacientes) => [nuevo, ...pacientes])),
    );
  }

  // PUT /pacientes/{id}
  actualizar(id: number, datos: PacienteFormValue): Observable<Paciente> {
    return this.http.put<ApiResponse<Paciente>>(`${this.url}/${id}`, datos).pipe(
      map(({ data }) => data),
      tap((actualizado) =>
        this.pacientesState.update((pacientes) =>
          pacientes.map((paciente) => (paciente.id === id ? actualizado : paciente)),
        ),
      ),
    );
  }

  // DELETE /pacientes/{id}
  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<null>>(`${this.url}/${id}`).pipe(
      map(() => undefined),
      tap(() =>
        this.pacientesState.update((pacientes) =>
          pacientes.filter((paciente) => paciente.id !== id),
        ),
      ),
    );
  }
}
