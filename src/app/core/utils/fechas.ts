// Utilidades para las fechas del backend, que viajan como LocalDate / LocalDateTime
// (sin zona horaria): '2026-09-14' y '2026-09-14T09:00:00'.

function dosDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

// Date -> '2026-09-14' en hora local
export function aFechaIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

// Date -> '2026-09-14T09:00:00' en hora local (formato que espera LocalDateTime)
export function aFechaHoraIso(fecha: Date): string {
  return `${aFechaIso(fecha)}T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`;
}

// '2026-09-14T09:00:00' -> Date en hora local
export function desdeFechaHoraIso(valor: string): Date {
  const [fecha, hora = '00:00:00'] = valor.split('T');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutos, segundos = 0] = hora.split(':').map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos, Math.floor(segundos));
}

// '2026-09-14T09:00:00' -> '2026-09-14'
export function parteFecha(valor: string): string {
  return valor.slice(0, 10);
}

// '2026-09-14T09:00:00' -> '09:00'
export function parteHora(valor: string): string {
  return valor.slice(11, 16);
}

// '2026-09-14' -> '14/09/2026'
export function formatearFecha(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

// Fecha de hoy como '2026-09-14'
export function hoyIso(): string {
  return aFechaIso(new Date());
}

// Fecha de hoy en texto: 'lunes, 14 de septiembre de 2026'
export function fechaLargaDeHoy(): string {
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

// Saludo según la hora del día
export function saludoDelDia(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// Iniciales a partir de un nombre completo: 'Axel Rojas' -> 'AR'
export function iniciales(nombreCompleto: string): string {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  const primera = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return `${primera}${ultima}`.toUpperCase();
}
