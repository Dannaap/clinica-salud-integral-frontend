// ═══════════════════════════════════════════════════════════
// COMPONENTE: Login
// Clínica Salud Integral S.A.C.
// ═══════════════════════════════════════════════════════════

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  HeartPulse,
  Stethoscope,
  CalendarCheck,
  ClipboardList,
} from 'lucide-angular';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  // ─── Inyecciones ──────────────────────────────────────────
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // ─── Iconos de Lucide ─────────────────────────────────────
  readonly iconUser = User;
  readonly iconLock = Lock;
  readonly iconEye = Eye;
  readonly iconEyeOff = EyeOff;
  readonly iconAlertCircle = AlertCircle;
  readonly iconHeartPulse = HeartPulse;
  readonly iconStethoscope = Stethoscope;
  readonly iconCalendarCheck = CalendarCheck;
  readonly iconClipboardList = ClipboardList;

  // ─── Estado ───────────────────────────────────────────────
  cargando = signal(false);
  errorMensaje = signal<string | null>(null);
  mostrarPassword = signal(false);

  // ─── Formulario ───────────────────────────────────────────
  formLogin: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recordarme: [false],
  });

  // ─── Getters ──────────────────────────────────────────────
  get email() {
    return this.formLogin.get('email')!;
  }

  get password() {
    return this.formLogin.get('password')!;
  }

  // ─── Métodos ──────────────────────────────────────────────
  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set(null);

    const credenciales: LoginRequest = {
      email: this.formLogin.value.email,
      password: this.formLogin.value.password,
    };

    this.authService.login(credenciales).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.cargando.set(false);
        this.redirigirPorRol(response.usuario.rol);
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.cargando.set(false);
        this.errorMensaje.set(
          error.message || 'Error al iniciar sesión. Intenta de nuevo.'
        );
      },
    });
  }

  private redirigirPorRol(rol: string): void {
    switch (rol) {
      case 'ADMIN':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'RECEPCION':
        this.router.navigate(['/dashboard/recepcion']);
        break;
      case 'MEDICO':
        this.router.navigate(['/dashboard/medico']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}