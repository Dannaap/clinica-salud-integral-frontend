import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
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

@Component({
  selector: 'app-pacientes-layout',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './pacientes-layout.html',
  styleUrl: './pacientes-layout.scss',
})
export class PacientesLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() pageTitle = 'Pacientes';
  @Input() pageSubtitle = 'Listado y búsqueda de pacientes';

  readonly iconHome = Home;
  readonly iconUsers = Users;
  readonly iconCalendar = CalendarDays;
  readonly iconReports = FileBarChart;
  readonly iconProfile = UserCircle;
  readonly iconBell = Bell;
  readonly iconLogout = LogOut;

  get usuario() {
    const u = this.authService.obtenerUsuario();
    const nombre = u ? `${u.nombre} ${u.apellidos}`.trim() : 'Personal de Clínica';
    const rol = u?.rol === 'ADMIN' ? 'Administrador' : (u?.rol === 'RECEPCION' ? 'Recepción' : (u?.rol === 'MEDICO' ? 'Médico' : 'Personal'));
    const iniciales = u
      ? `${u.nombre.charAt(0)}${u.apellidos.charAt(0)}`.toUpperCase()
      : 'PC';
    return { nombre, rol, iniciales };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
