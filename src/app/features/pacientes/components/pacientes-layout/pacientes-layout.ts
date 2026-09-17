import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  @Input() pageTitle = 'Pacientes';
  @Input() pageSubtitle = 'Listado y búsqueda de pacientes';

  readonly iconHome = Home;
  readonly iconUsers = Users;
  readonly iconCalendar = CalendarDays;
  readonly iconReports = FileBarChart;
  readonly iconProfile = UserCircle;
  readonly iconBell = Bell;
  readonly iconLogout = LogOut;
}
