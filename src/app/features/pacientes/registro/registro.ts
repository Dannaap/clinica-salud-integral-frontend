import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, CheckCircle2, Search, ShieldCheck, UserRound, X } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

import { PacientesLayout } from '../components/pacientes-layout/pacientes-layout';
import { Paciente, PacienteFormValue } from '../paciente.model';
import { PacienteService } from '../paciente.service';

function soloNumeros(control: AbstractControl): ValidationErrors | null {
  return /^\d{8}$/.test(control.value ?? '') ? null : { dniFormato: true };
}

function soloLetras(control: AbstractControl): ValidationErrors | null {
  const val = control.value?.trim();
  if (!val) return null;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val) ? null : { soloLetras: true };
}

function fechaNacimientoValida(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const fecha = new Date(`${control.value}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(fecha.getTime())) return { fechaInvalida: true };
  if (fecha > hoy) return { fechaFutura: true };
  const anioMinimo = hoy.getFullYear() - 130;
  if (fecha.getFullYear() < anioMinimo) return { fechaAntigua: true };
  return null;
}

function telefonoValido(control: AbstractControl): ValidationErrors | null {
  const val = control.value?.trim();
  if (!val) return null;
  const limpio = val.replace(/[\s+-]/g, '');
  const sinPais = limpio.startsWith('51') && limpio.length === 11 ? limpio.substring(2) : limpio;
  return /^9\d{8}$/.test(sinPais) ? null : { telefonoInvalido: true };
}

function correoOpcional(control: AbstractControl): ValidationErrors | null {
  const val = control.value?.trim();
  if (!val) return null;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val) ? null : { emailInvalido: true };
}

@Component({
  selector: 'app-registro',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, PacientesLayout],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly pacienteService = inject(PacienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly iconArrowLeft = ArrowLeft;
  readonly iconSearch = Search;
  readonly iconCheck = CheckCircle2;
  readonly iconShield = ShieldCheck;
  readonly iconUser = UserRound;
  readonly iconX = X;

  readonly dniEstado = signal<'neutral' | 'disponible' | 'duplicado'>('neutral');
  readonly pacienteEncontrado = signal<Paciente | null>(null);
  readonly guardando = signal(false);
  readonly redirigiendo = signal(false);
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly pacienteEditando = signal<Paciente | null>(null);
  readonly hoy = new Date().toISOString().split('T')[0];

  readonly formulario = this.fb.group({
    dni: ['', [Validators.required, soloNumeros]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), soloLetras]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), soloLetras]],
    fechaNacimiento: ['', [Validators.required, fechaNacimientoValida]],
    sexo: ['', Validators.required],
    telefono: ['', [Validators.required, telefonoValido]],
    correo: ['', [correoOpcional]],
    tipoSangre: [''],
    direccion: ['', [Validators.maxLength(200)]],
    alergias: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    const id = Number(this.route.snapshot.queryParamMap.get('editar'));
    const paciente = id ? this.pacienteService.obtenerPorId(id) : undefined;

    if (paciente) {
      this.pacienteEditando.set(paciente);
      this.formulario.patchValue({
        dni: paciente.dni,
        nombres: paciente.nombres,
        apellidos: paciente.apellidos,
        fechaNacimiento: paciente.fechaNacimiento,
        sexo: paciente.sexo,
        telefono: paciente.telefono,
        correo: paciente.correo ?? '',
        tipoSangre: paciente.tipoSangre ?? '',
        direccion: paciente.direccion ?? '',
        alergias: paciente.alergias ?? '',
      });
      this.dniEstado.set('disponible');
    }
  }

  get editando(): boolean {
    return this.pacienteEditando() !== null;
  }

  get dni() {
    return this.formulario.controls.dni;
  }

  get fechaNacimiento() {
    return this.formulario.controls.fechaNacimiento;
  }

  buscarDni(): void {
    this.dni.markAsTouched();

    if (this.dni.invalid) {
      this.dniEstado.set('neutral');
      return;
    }

    const paciente = this.pacienteService.buscarPorDni(this.dni.value ?? '');
    const pacienteEditando = this.pacienteEditando();

    if (paciente && paciente.id !== pacienteEditando?.id) {
      this.pacienteEncontrado.set(paciente);
      this.dniEstado.set('duplicado');
      return;
    }

    this.pacienteEncontrado.set(null);
    this.dniEstado.set('disponible');
  }

  limpiarResultadoDni(): void {
    if (!this.editando) {
      this.dniEstado.set('neutral');
      this.pacienteEncontrado.set(null);
      return;
    }

    const dniActual = (this.dni.value ?? '').trim();
    const pacienteOriginal = this.pacienteEditando();
    if (pacienteOriginal && dniActual !== pacienteOriginal.dni) {
      this.dniEstado.set('neutral');
      this.pacienteEncontrado.set(null);
    } else if (pacienteOriginal && dniActual === pacienteOriginal.dni) {
      this.dniEstado.set('disponible');
      this.pacienteEncontrado.set(null);
    }
  }

  guardarPaciente(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa los campos obligatorios para continuar.');
      return;
    }

    const dniValor = (this.dni.value ?? '').trim();
    const pacienteExistente = this.pacienteService.buscarPorDni(dniValor);
    const pacienteEditando = this.pacienteEditando();

    if (pacienteExistente && pacienteExistente.id !== pacienteEditando?.id) {
      this.dniEstado.set('duplicado');
      this.pacienteEncontrado.set(pacienteExistente);
      this.error.set('Ya existe un paciente registrado con este DNI.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const datos = this.formulario.getRawValue() as PacienteFormValue;

    if (pacienteEditando) {
      this.pacienteService.actualizar(pacienteEditando.id, datos);
    } else {
      this.pacienteService.crear(datos);
    }

    this.guardando.set(false);
    this.redirigiendo.set(true);
    this.mensaje.set(
      pacienteEditando ? 'Los datos del paciente fueron actualizados.' : 'Paciente registrado correctamente.',
    );

    setTimeout(() => {
      this.router.navigate(['/pacientes/listado']);
    }, 1200);
  }

  cancelar(): void {
    this.router.navigate(['/pacientes/listado']);
  }

  edad(): number | null {
    const fecha = this.fechaNacimiento.value;
    if (!fecha) {
      return null;
    }

    const hoy = new Date();
    const nacimiento = new Date(`${fecha}T00:00:00`);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumpleanosPendiente =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());

    if (cumpleanosPendiente) {
      edad--;
    }

    return edad >= 0 ? edad : null;
  }

  tieneError(control: keyof typeof this.formulario.controls): boolean {
    const campo = this.formulario.controls[control];
    return campo.invalid && campo.touched;
  }
}
