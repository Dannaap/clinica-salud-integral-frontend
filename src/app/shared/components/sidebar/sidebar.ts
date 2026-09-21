import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService, { optional: true });
  private router = inject(Router, { optional: true });

  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = 'Administrador';
  @Input() iniciales: string = 'JP';
  @Input() esAdmin: boolean = true;
  @Input() esMedico: boolean = false;
  @Input() abierto: boolean = false;

  logout(): void {
    if (this.authService) {
      this.authService.logout();
    }
    if (this.router) {
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion(): void {
    this.logout();
  }
}
