import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = 'Administrador';
  @Input() iniciales: string = 'JP';
  @Input() esAdmin: boolean = true;
  @Input() esMedico: boolean = false;
  @Input() abierto: boolean = false;

  mostrarProximamente(modulo: string): void {
    console.log(`${modulo} estará disponible en un próximo sprint`);
    alert(`${modulo} estará disponible en un próximo sprint.`);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}