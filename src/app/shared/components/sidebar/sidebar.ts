import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  House,
  Users,
  Calendar,
  Clock,
  ClipboardList,
  ChartColumn,
  Settings,
  User,
  LogOut,
  Plus,
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: any;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly iconPlus = Plus;
  readonly iconLogOut = LogOut;

  readonly navItems: NavItem[] = [
    { label: 'Inicio', route: '/dashboard', icon: House },
    { label: 'Pacientes', route: '/pacientes', icon: Users },
    { label: 'Citas', route: '/citas', icon: Calendar },
    { label: 'Turnos médicos', route: '/turnos', icon: Clock },
    { label: 'Atenciones', route: '/atenciones', icon: ClipboardList },
    { label: 'Reportes', route: '/reportes', icon: ChartColumn },
    { label: 'Usuarios', route: '/usuarios', icon: Settings },
    { label: 'Perfil', route: '/perfil', icon: User },
  ];

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
