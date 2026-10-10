import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  Cita,
  CitaDTO,
  CrearCitaRequest,
  RegistrarAtencionRequest,
  ResumenCitas,
} from '../models/cita.model';
import { desdeFechaHoraIso, parteFecha, parteHora } from '../utils/fechas';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/citas`;

  private readonly citasState = signal<Cita[]>([]);

  public readonly citas = this.citasState.asReadonly();
  public readonly cargando = signal<boolean>(false);

  // ─── Llamadas al backend ──────────────────────────────────

  // GET /citas. Para un usuario con rol MEDICO el backend devuelve solo sus citas.
  listar(): Observable<Cita[]> {
    return this.http.get<ApiResponse<CitaDTO[]>>(this.url).pipe(
      map(({ data }) =>
        data.map((dto) => this.aCita(dto)).sort((a, b) => a.inicio.localeCompare(b.inicio))
      ),
      tap((citas) => this.citasState.set(citas))
    );
  }

  // Recarga las citas y refleja el estado de carga en `cargando`
  cargar(): void {
    this.cargando.set(true);
    this.listar()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => {} });
  }

  // El backend no filtra por médico ni paciente: se filtra sobre el listado completo
  listarPorMedico(medicoId: number): Observable<Cita[]> {
    return this.listar().pipe(map((citas) => citas.filter((c) => c.medicoId === medicoId)));
  }

  listarPorPaciente(pacienteId: number): Observable<Cita[]> {
    return this.listar().pipe(map((citas) => citas.filter((c) => c.pacienteId === pacienteId)));
  }

  // POST /citas
  reservar(request: CrearCitaRequest): Observable<Cita> {
    return this.http.post<ApiResponse<CitaDTO>>(this.url, request).pipe(
      map(({ data }) => this.aCita(data)),
      tap((cita) =>
        this.citasState.update((prev) =>
          [...prev, cita].sort((a, b) => a.inicio.localeCompare(b.inicio))
        )
      )
    );
  }

  // PUT /citas/{id}/reprogramar: mueve la cita a otro turno disponible
  reprogramar(id: number, turnoId: number): Observable<Cita> {
    return this.http
      .put<ApiResponse<CitaDTO>>(`${this.url}/${id}/reprogramar`, { turnoId })
      .pipe(
        map(({ data }) => this.aCita(data)),
        tap((cita) => this.reemplazar(cita))
      );
  }

  // DELETE /citas/{id}: la cita no se borra, queda en estado CANCELADA
  cancelar(id: number): Observable<Cita> {
    return this.http.delete<ApiResponse<CitaDTO>>(`${this.url}/${id}`).pipe(
      map(({ data }) => this.aCita(data)),
      tap((cita) => this.reemplazar(cita))
    );
  }

  // POST /atenciones: registra la atención médica y deja la cita como ATENDIDA
  registrarAtencion(request: RegistrarAtencionRequest): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.apiUrl}/atenciones`, request)
      .pipe(
        map(() => undefined),
        tap(() =>
          this.citasState.update((prev) =>
            prev.map((c) => (c.id === request.citaId ? { ...c, estado: 'ATENDIDA' as const } : c))
          )
        )
      );
  }

  // ─── Consultas sobre las citas ya cargadas ────────────────

  // Citas de una fecha ('2026-09-16'), ordenadas por hora
  obtenerCitasDelDia(fecha: string): Cita[] {
    return this.citasState().filter((c) => c.fecha === fecha);
  }

  obtenerResumenDelDia(fecha: string): ResumenCitas {
    return this.resumir(this.obtenerCitasDelDia(fecha));
  }

  resumir(citas: Cita[]): ResumenCitas {
    return {
      total: citas.length,
      reservadas: citas.filter((c) => c.estado === 'RESERVADA').length,
      atendidas: citas.filter((c) => c.estado === 'ATENDIDA').length,
      canceladas: citas.filter((c) => c.estado === 'CANCELADA').length,
      ausentes: citas.filter((c) => c.estado === 'AUSENTE').length,
    };
  }

  private reemplazar(cita: Cita): void {
    this.citasState.update((prev) =>
      prev
        .map((c) => (c.id === cita.id ? cita : c))
        .sort((a, b) => a.inicio.localeCompare(b.inicio))
    );
  }

  // Adapta el CitaResponse del backend al modelo que usan las vistas
  private aCita(dto: CitaDTO): Cita {
    const duracionMs =
      desdeFechaHoraIso(dto.fin).getTime() - desdeFechaHoraIso(dto.inicio).getTime();

    return {
      id: dto.id,
      pacienteId: dto.pacienteId,
      pacienteNombre: dto.paciente,
      pacienteDni: dto.dniPaciente,
      medicoId: dto.medicoId,
      medicoNombre: dto.medico,
      especialidad: dto.especialidad,
      fecha: parteFecha(dto.inicio),
      hora: parteHora(dto.inicio),
      horaFin: parteHora(dto.fin),
      duracion: Math.round(duracionMs / 60000),
      inicio: dto.inicio,
      estado: dto.estado,
      motivo: dto.motivo ?? undefined,
    };
  }
}
