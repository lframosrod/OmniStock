# 📦 OmniStock - Sistema de Gestión de Inventarios

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Podman](https://img.shields.io/badge/Podman-892CA0?style=for-the-badge&logo=podman&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

OmniStock es una plataforma web de nivel empresarial diseñada para la gestión eficiente de inventarios. Desarrollada bajo una arquitectura limpia y contenerizada, ofrece un control de acceso basado en roles (RBAC), métricas analíticas en tiempo real y trazabilidad completa de movimientos.

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Despliegue](#-instalación-y-despliegue)
- [Variables de Entorno](#-variables-de-entorno)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Guía de Contribución](#-guía-de-contribución)
- [Licencia](#-licencia)

---

## ✨ Características Principales

- **Dashboard Analítico:** Visualización en tiempo real de KPIs y productos con mayor movimiento usando `Recharts`.
- **Alertas de Stock:** Monitoreo automatizado de productos con existencias críticas (≤ 5 unidades).
- **Seguridad RBAC:** Control de acceso mediante JWT y middlewares de rutas protegidas (Administrador vs Usuario Estándar).
- **Reportes Globales:** Exportación de Kardex y movimientos a formato CSV.
- **Entorno Aislado:** Orquestación completa mediante Podman Compose (API, Web, DB, Proxy, pgAdmin).

---

## 🏗️ Arquitectura del Sistema

El proyecto utiliza un proxy inverso Nginx para enrutar el tráfico de forma transparente, evitando conflictos de CORS y unificando el ecosistema bajo un solo puerto externo.

```mermaid
graph TD
    Client[Cliente Web / Navegador] -->|HTTP 8080| Proxy[Nginx Proxy]
    Proxy -->|/api/*| API[Backend - Express.js]
    Proxy -->|/*| Web[Frontend - React]
    API -->|Port 5432| DB[(PostgreSQL)]
    Admin[Admin DB] -->|Port 5050| pgAdmin[pgAdmin4]
    pgAdmin -.->|Manage| DB
```

---

## 💻 Tecnologías

**Frontend:**
- React.js (Vite)
- React Router DOM v7
- Recharts (Data Visualization)
- Axios

**Backend:**
- Node.js & Express.js
- JSON Web Tokens (JWT) para autenticación
- pg (PostgreSQL Client para Node)

**Infraestructura:**
- Base de datos: PostgreSQL 15
- Orquestación: Podman / Docker Compose
- Proxy Inverso: Nginx

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado el siguiente software en tu máquina local:
- [Node.js](https://nodejs.org/) (v18 o superior) - *Solo para desarrollo local sin contenedores*
- [Podman](https://podman.io/) o [Docker](https://www.docker.com/) con su respectivo plugin de `compose`.
- Git

---

## 🚀 Instalación y Despliegue

1. **Clonar el repositorio:**

   ```bash
   git clone [https://github.com/tu-usuario/omnistock.git](https://github.com/tu-usuario/omnistock.git)
   cd omnistock
   ```

2. **Configurar las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto (backend) basándote en el archivo de ejemplo (ver sección de Variables de Entorno).

3. **Levantar los contenedores:**
   Ejecuta el siguiente comando para construir y levantar toda la infraestructura:

   ```bash
   podman-compose up -d --build
   ```

   *(Si utilizas Docker, reemplaza `podman-compose` por `docker compose`)*

4. **Acceder a la aplicación:**
   - **Plataforma Web:** `http://localhost:8080`
   - **pgAdmin (Gestor de BD):** `http://localhost:5050`

---

## 🔐 Variables de Entorno

Debes crear un archivo `.env` en la carpeta `backend-express/` con las siguientes variables:

```env
PORT=3000
DB_HOST=db
DB_USER=admin
DB_PASSWORD=adminpassword
DB_NAME=omnistock
DB_PORT=5432
JWT_SECRET=tu_super_secreto_aqui
```

---

## 📁 Estructura del Proyecto

```text
omnistock/
├── backend-express/       # Código fuente de la API REST
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── routes/        # Definición de endpoints
│   │   └── middleware/    # Validaciones y JWT Auth
│   ├── Dockerfile
│   └── package.json
├── frontend-react/        # Código fuente de la interfaz Web
│   ├── src/
│   │   ├── pages/         # Vistas (Dashboard, Inventario, Usuarios)
│   │   ├── api/           # Configuración de Axios
│   │   └── App.jsx        # Enrutamiento principal
│   ├── Dockerfile
│   └── package.json
├── nginx/                 # Configuración del proxy inverso
│   └── default.conf
└── compose.yml            # Orquestación de servicios (Podman/Docker)
```

---

## 🤝 Guía de Contribución

Nos guiamos por los estándares de la industria para mantener el código limpio y rastreable:

1. Realiza un Fork del proyecto.
2. Crea una rama para tu feature o corrección:
   `git checkout -b feature/nueva-caracteristica` o `git checkout -b fix/correccion-bug`
3. Sigue el estándar de **Conventional Commits** al registrar tus cambios:
   - `feat: añade reporte por fechas`
   - `fix: corrige validación de token en Dashboard`
   - `refactor: optimiza consulta a la base de datos`
4. Sube los cambios a tu rama:
   `git push origin feature/nueva-caracteristica`
5. Abre un **Pull Request** (PR) detallando tus cambios.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---
*Desarrollado con pasión para la gestión eficiente de recursos.* 🚀
