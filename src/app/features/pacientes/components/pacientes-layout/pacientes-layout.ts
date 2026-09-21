import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  Bell,
  CalendarDays,
  FileBarChart,
  Home,
  LogOut,
  UserCircle,
  Users,
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pacientes-layout',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './pacientes-layout.html',
  styleUrl: './pacientes-layout.scss',
})
export class PacientesLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Input() pageTitle = 'Pacientes';
  @Input() pageSubtitle = 'Listado y búsqueda de pacientes';

  readonly iconHome = Home;
  readonly iconUsers = Users;
  readonly iconCalendar = CalendarDays;
  readonly iconReports = FileBarChart;
  readonly iconProfile = UserCircle;
  readonly iconBell = Bell;
  readonly iconLogout = LogOut;

  readonly infoSesion = this.authService.usuarioActual();

  readonly nombre = this.infoSesion?.nombreCompleto ?? 'Usuario';
  readonly rol = this.infoSesion?.rolLabel ?? '';
  readonly iniciales = this.infoSesion?.iniciales ?? 'US';
  readonly rutaInicio = this.authService.obtenerRutaDashboard();

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
