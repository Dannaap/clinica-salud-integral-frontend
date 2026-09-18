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
  readonly mensaje = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly pacienteEditando = signal<Paciente | null>(null);

  readonly formulario = this.fb.group({
    dni: ['', [Validators.required, soloNumeros]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento: ['', Validators.required],
    sexo: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\+?\d[\d\s-]{8,}$/)]],
    correo: ['', Validators.email],
    tipoSangre: [''],
    direccion: [''],
    alergias: [''],
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
    }
  }

  guardarPaciente(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Completa los campos obligatorios para continuar.');
      return;
    }

    if (this.dniEstado() === 'duplicado') {
      this.error.set('Ya existe un paciente registrado con este DNI.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const datos = this.formulario.getRawValue() as PacienteFormValue;
    const paciente = this.pacienteEditando();

    if (paciente) {
      this.pacienteService.actualizar(paciente.id, datos);
    } else {
      this.pacienteService.crear(datos);
    }

    this.guardando.set(false);
    this.mensaje.set(
      paciente ? 'Los datos del paciente fueron actualizados.' : 'Paciente registrado correctamente.',
    );
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
