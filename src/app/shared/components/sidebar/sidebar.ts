import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent {
  @Input() nombre: string = 'Dr. Juan Pérez';
  @Input() rol: string = 'Administrador';
  @Input() iniciales: string = 'JP';
  @Input() esAdmin: boolean = true;
  @Input() esMedico: boolean = false;
  @Input() abierto: boolean = false;

  logout() {
    console.log('Cerrar sesión');
  }
}