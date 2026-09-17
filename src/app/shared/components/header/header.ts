import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Search,
  Bell,
  ChevronDown,
} from 'lucide-angular';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly usuarioService = inject(UsuarioService);

  readonly iconSearch = Search;
  readonly iconBell = Bell;
  readonly iconChevronDown = ChevronDown;

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usuarioService.setBusqueda(input.value);
  }
}
