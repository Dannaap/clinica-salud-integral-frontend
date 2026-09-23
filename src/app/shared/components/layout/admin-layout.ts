import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar';
import { HeaderComponent } from '../header/header';

// Textos del header que cada ruta hija puede definir en `data.header`
export interface HeaderConfig {
  titulo: string;
  subtitulo: string;
  placeholder: string;
}

const HEADER_POR_DEFECTO: HeaderConfig = {
  titulo: 'Usuarios',
  subtitulo: 'Gestión de cuentas del personal',
  placeholder: 'Buscar usuario por nombre o correo...',
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  sidebarAbierto = false;

  // Configuración del header según la ruta hija activa
  readonly header = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.obtenerHeaderDeRuta())
    ),
    { initialValue: HEADER_POR_DEFECTO }
  );

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  private obtenerHeaderDeRuta(): HeaderConfig {
    let actual = this.route;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    const config = actual.snapshot.data['header'] as Partial<HeaderConfig> | undefined;
    return { ...HEADER_POR_DEFECTO, ...config };
  }
}
