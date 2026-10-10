import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  LucideAngularModule,
  Plus,
  Users,
  Settings,
  Briefcase,
  Stethoscope,
  Search,
  X,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Rol, Usuario } from '../../../core/models/usuario.model';

// Misma política de contraseña que exige el formulario de login
const PASSWORD_SEGURA =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

@Component({
  selector: 'app-usuarios-listado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './usuarios-listado.html',
  styleUrl: './usuarios-listado.scss',
})
export class UsuariosListadoComponent implements OnInit {
  readonly usuarioService = inject(UsuarioService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // Iconos Lucide
  readonly iconPlus = Plus;
  readonly iconUsers = Users;
  readonly iconSettings = Settings;
  readonly iconBriefcase = Briefcase;
  readonly iconStethoscope = Stethoscope;
  readonly iconSearch = Search;
  readonly iconX = X;
  readonly iconPencil = Pencil;
  readonly iconTrash = Trash2;

  // Modal de alta/edición
  readonly modalFormularioAbierto = signal<boolean>(false);
  readonly usuarioEditando = signal<Usuario | null>(null);
  readonly guardando = signal<boolean>(false);

  // Modal de confirmación de borrado
  readonly usuarioAEliminar = signal<Usuario | null>(null);
  readonly eliminando = signal<boolean>(false);

  readonly formulario = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(PASSWORD_SEGURA)]],
    rol: ['RECEPCION' as Rol, [Validators.required]],
  });

  ngOnInit(): void {
    this.usuarioService.cargar();
  }

  // Acciones de filtros
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuarioService.setBusqueda(input.value);
  }

  onRolChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.usuarioService.setFiltroRol(select.value);
  }

  limpiarFiltros(): void {
    this.usuarioService.limpiarFiltros();
  }

  // Helper para etiqueta amigable de rol
  obtenerEtiquetaRol(rol: Rol): string {
    switch (rol) {
      case 'ADMIN':
        return 'Administrador';
      case 'RECEPCION':
        return 'Recepción';
      case 'MEDICO':
        return 'Médico';
      default:
        return rol;
    }
  }

  esUsuarioActual(usuario: Usuario): boolean {
    return this.authService.obtenerUsuario()?.id === usuario.id;
  }

  tieneError(control: keyof typeof this.formulario.controls): boolean {
    const campo = this.formulario.controls[control];
    return campo.invalid && campo.touched;
  }

  // ─── Alta y edición ───────────────────────────────────────

  abrirCrear(): void {
    this.usuarioEditando.set(null);
    this.formulario.enable();
    this.formulario.reset();
    this.modalFormularioAbierto.set(true);
  }

  abrirEditar(usuario: Usuario): void {
    this.usuarioEditando.set(usuario);
    this.formulario.enable();
    this.formulario.reset({
      dni: usuario.dni ?? '',
      nombres: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
    });
    // El backend no permite cambiar DNI, correo ni contraseña desde este endpoint
    this.formulario.controls.dni.disable();
    this.formulario.controls.email.disable();
    this.formulario.controls.password.disable();
    this.modalFormularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    if (this.guardando()) return;
    this.modalFormularioAbierto.set(false);
    this.usuarioEditando.set(null);
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();
    const editando = this.usuarioEditando();

    const peticion = editando
      ? this.usuarioService.actualizar(editando.id, {
          nombres: datos.nombres.trim(),
          apellidos: datos.apellidos.trim(),
          rol: datos.rol,
        })
      : this.usuarioService.crear({
          ...datos,
          nombres: datos.nombres.trim(),
          apellidos: datos.apellidos.trim(),
          email: datos.email.trim(),
        });

    this.guardando.set(true);
    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (usuario) => {
        this.toast.exito(
          editando
            ? `Los datos de ${usuario.nombre} ${usuario.apellidos} fueron actualizados.`
            : `Usuario ${usuario.nombre} ${usuario.apellidos} creado correctamente.`
        );
        this.modalFormularioAbierto.set(false);
        this.usuarioEditando.set(null);
      },
      // El mensaje de error lo muestra el interceptor global
      error: () => {},
    });
  }

  // ─── Eliminación ──────────────────────────────────────────

  pedirEliminar(usuario: Usuario): void {
    this.usuarioAEliminar.set(usuario);
  }

  cancelarEliminar(): void {
    if (this.eliminando()) return;
    this.usuarioAEliminar.set(null);
  }

  confirmarEliminar(): void {
    const usuario = this.usuarioAEliminar();
    if (!usuario) return;

    this.eliminando.set(true);
    this.usuarioService
      .eliminar(usuario.id)
      .pipe(finalize(() => this.eliminando.set(false)))
      .subscribe({
        next: () => {
          this.toast.exito(`Usuario ${usuario.nombre} ${usuario.apellidos} eliminado.`);
          this.usuarioAEliminar.set(null);
        },
        error: () => {},
      });
  }
}
