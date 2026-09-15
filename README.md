# 🎨 Frontend — Clínica Salud Integral S.A.C.

Aplicación web SPA construida con **Angular 17 + SASS** para la intranet de la **Clínica Salud Integral S.A.C.**

Interfaz de usuario para el personal de la clínica que consume la API REST del backend.

---

## 🏥 ¿Qué es esta intranet?

Este proyecto es la **capa de presentación (frontend)** de la intranet de la clínica, compuesta por dos repositorios:

| Repositorio | Rol | Deploy |
|---|---|---|
| clinica-salud-integral-backend | API REST (Spring Boot) | Railway |
| clinica-salud-integral-frontend | Interfaz SPA (Angular) | Vercel |

**Intranet** significa que es un sistema **privado, solo para el personal de la clínica**. Los pacientes NO acceden a este sistema.

---

## 🎯 Objetivo

Proporcionar una interfaz ágil, intuitiva y responsive para que el personal de la clínica pueda gestionar citas, pacientes y atenciones médicas de forma centralizada, eliminando los siguientes problemas:

- ⏱️ Elevados tiempos de espera en recepción.
- 🔔 Alta tasa de inasistencias por falta de recordatorios.
- 🗂️ Errores y duplicidad en historias clínicas.

---

## 👥 Roles y vistas por rol

| Rol | Vistas principales |
|---|---|
| Administrador | Dashboard admin, Usuarios, Pacientes, Turnos, Reportes |
| Recepción | Dashboard recepción, Pacientes, Citas |
| Médico | Dashboard médico, Mi agenda, Atenciones |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 17 |
| Lenguaje | TypeScript |
| Estilos | SASS (SCSS) |
| Estado | RxJS |
| Rutas | Angular Router + Guards |
| Formularios | Reactive Forms |
| Tests | Jasmine + Karma |
| Deploy | Vercel |

---

## 📂 Estructura del proyecto
```
clinica-salud-integral-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── jwt.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── paciente.service.ts
│   │   │   │   └── usuario.service.ts
│   │   │   └── models/
│   │   │       ├── usuario.model.ts
│   │   │       ├── paciente.model.ts
│   │   │       └── cita.model.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── header/
│   │   │   │   └── modal/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   ├── recepcion/
│   │   │   │   ├── medico/
│   │   │   │   └── dashboard.routes.ts
│   │   │   ├── pacientes/
│   │   │   │   ├── registro/
│   │   │   │   ├── listado/
│   │   │   │   └── pacientes.routes.ts
│   │   │   └── usuarios/
│   │   │       ├── listado/
│   │   │       ├── formulario/
│   │   │       └── usuarios.routes.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   ├── _buttons.scss
│   │   ├── _inputs.scss
│   │   ├── _cards.scss
│   │   ├── _tables.scss
│   │   ├── _badges.scss
│   │   └── styles.scss
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.js (opcional)
├── .gitignore
└── README.md
```
---

## 🎨 Sistema de diseño (SASS)

El sistema de diseño sigue los wireframes creados en Stitch para la Clínica Salud Integral S.A.C.

### Paleta de colores

| Variable | Valor | Uso |
|---|---|---|
| $primary | #0B5ED7 | Azul clínico principal |
| $primary-dark | #084298 | Hover / activo |
| $primary-light | #E7F1FF | Fondos suaves |
| $secondary | #198754 | Éxito, confirmaciones |
| $warning | #FFC107 | Pendientes |
| $danger | #DC3545 | Errores, cancelaciones |
| $neutral-900 | #1A1D21 | Texto principal |
| $neutral-700 | #495057 | Texto secundario |
| $neutral-400 | #CED4DA | Bordes |
| $neutral-100 | #F8F9FA | Fondos de cards |

### Tipografía

- Fuente principal: **Poppins**
- Títulos: Poppins Bold
- Subtítulos: Poppins SemiBold
- Botones: Poppins Medium
- Cuerpo: Poppins Regular

---

## 📅 Sprints y HU (según backlog priorizado)

| Sprint | Duración | HU | Prioridad | Días |
|---|---|---|---|---|
| Sprint 1 | 5 días | H.U.1 — Acceso al sistema | M | 2 |
| Sprint 1 | 5 días | H.U.2 — Administrar pacientes | M | 3 |
| Sprint 2 | 11 días | H.U.3 — Administrar turnos médicos | M | 3 |
| Sprint 2 | 11 días | H.U.4 — Reservar citas médicas | M | 5 |
| Sprint 2 | 11 días | H.U.5 — Reprogramar / cancelar citas | M | 3 |
| Sprint 3 | 5 días | H.U.6 — Registrar atención médica | S | 5 |
| Sprint 4 | 7 días | H.U.7 — Enviar notificaciones automáticas | S | 3 |
| Sprint 4 | 7 días | H.U.8 — Generar reportes operativos | C | 3 |
| Sprint 4 | 7 días | H.U.9 — Administrar cuenta | C | 1 |

---

## 🚀 Plan de Lanzamientos (Release Plan)

| Release | Sprints incluidos | Contenido |
|---|---|---|
| Release 1 | Sprint 1 + Sprint 2 | Núcleo funcional: autenticación, pacientes, turnos y citas |
| Release 2 | Sprint 3 | Módulo clínico: consultas e historia clínica electrónica |
| Release 3 | Sprint 4 | Notificaciones, reportes PDF/Excel y cierre del proyecto |

---

## 🚀 Cómo levantar el frontend localmente

### Requisitos previos

- Node.js 18+
- Angular CLI (npm install -g @angular/cli)
- Backend corriendo en http://localhost:8080

### Instalar dependencias

npm install

### Ejecutar en desarrollo

ng serve

La aplicación corre en http://localhost:4200.

---

## 🔐 Autenticación y Guards

- Interceptor HTTP para agregar el token JWT en cada petición
- AuthGuard para proteger rutas privadas
- RoleGuard para filtrar vistas según el rol (Admin, Recepción, Médico)

---

## 📦 Módulos principales

| Módulo | Descripción |
|---|---|
| Auth | Login con JWT y almacenamiento seguro del token |
| Dashboard | Vistas diferenciadas por rol |
| Pacientes | Registro, listado y búsqueda por DNI |
| Usuarios | CRUD de usuarios (solo Admin) |

---

## 🧪 Ejecutar tests

ng test

---

## ☁️ Despliegue en Vercel

### Requisitos

- Cuenta en Vercel (vercel.com)
- Repositorio en GitHub conectado

### Pasos generales

1. Crear un nuevo proyecto en Vercel
2. Conectar el repositorio de GitHub
3. Configurar el framework como Angular
4. Configurar la URL del backend como variable de entorno
5. Vercel despliega automáticamente en cada push

### Plan gratuito

Vercel ofrece hosting gratuito para proyectos personales y académicos.

---

## 🔗 Repositorios relacionados

- **Backend:** clinica-salud-integral-backend
- **Frontend (este repo):** clinica-salud-integral-frontend

---

## 📄 Licencia

Proyecto académico — **Clínica Salud Integral S.A.C.**

MIT License © 2026
