import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
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

  // Lee `data.header` de la ruta más profunda del estado actual del router.
  // Se usa el snapshot del router (no el ActivatedRoute) porque durante la
  // construcción del layout el snapshot del ActivatedRoute aún no existe.
  private obtenerHeaderDeRuta(): HeaderConfig {
    let actual = this.router.routerState.snapshot.root;
    while (actual.firstChild) {
      actual = actual.firstChild;
    }
    const config = actual.data?.['header'] as Partial<HeaderConfig> | undefined;
    return { ...HEADER_POR_DEFECTO, ...config };
  }
}
