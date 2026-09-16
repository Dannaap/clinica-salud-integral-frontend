import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Stethoscope,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
  Circle,
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

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly iconMail = Mail;
  readonly iconLock = Lock;
  readonly iconEye = Eye;
  readonly iconEyeOff = EyeOff;
  readonly iconAlertCircle = AlertCircle;
  readonly iconStethoscope = Stethoscope;
  readonly iconCalendarCheck = CalendarCheck;
  readonly iconClipboardList = ClipboardList;
  readonly iconCheckCircle = CheckCircle2;
  readonly iconCircle = Circle;

  cargando = signal(false);
  errorMensaje = signal<string | null>(null);
  mostrarPassword = signal(false);
  mostrarRequisitos = signal(false);

  formLogin: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    recordarme: [false],
  });

  private passwordValue = toSignal(
    this.formLogin.get('password')!.valueChanges,
    { initialValue: '' }
  );

  passwordChecks = computed(() => {
    const pwd = this.passwordValue() || '';
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
  });

  get email() {
    return this.formLogin.get('email')!;
  }

  get password() {
    return this.formLogin.get('password')!;
  }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  onBlurPassword(): void {
    setTimeout(() => {
      const checks = this.passwordChecks();
      const todosCumplen =
        checks.minLength &&
        checks.hasUppercase &&
        checks.hasLowercase &&
        checks.hasNumber &&
        checks.hasSpecial;

      if (todosCumplen) {
        this.mostrarRequisitos.set(false);
      }
    }, 200);
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