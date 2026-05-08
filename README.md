# 📊 SocialMarkets - Terminal Financiera Colaborativa

![Java](https://img.shields.io/badge/Java-25-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)

**SocialMarkets** es una plataforma colaborativa de análisis financiero diseñada para inversores y analistas, donde pueden compartir proyecciones de mercado, validar ideas y seguir el rendimiento de la comunidad. El sistema ofrece una experiencia profesional con una terminal financiera avanzada, gestión de perfiles de analistas y almacenamiento seguro en la nube.

---

## 🛠️ Tecnologías y Guía Técnica

Este proyecto está estructurado en un backend robusto basado en microservicios (Spring Boot) y un frontend moderno y reactivo (React + Vite).

### 🖥️ Backend (Core API)
Ubicado en la carpeta `backend-core/`.

- **Lenguaje:** Java 25
- **Framework:** Spring Boot 4.0.5
- **Seguridad:** Spring Security con **JWT (JSON Web Tokens)** para autenticación Stateless.
- **Persistencia:** Spring Data JPA con **PostgreSQL**.
- **Almacenamiento:** Integración con **AWS S3** para el manejo de archivos y documentos.
- **Serialización:** Jackson (JSON) con soporte para Java Time.
- **Productividad:** Project Lombok para reducción de boilerplate.

### 🌐 Frontend (Interfaz de Usuario)
Ubicado en la carpeta `frontend-socialmarkets/`.

- **Framework:** React 19.2 (Vite 6.0)
- **Lenguaje:** JavaScript / React Router 7
- **Estilos:** Vanilla CSS con **Glassmorphism** (Diseño Premium y Responsive).
- **Animaciones:** `framer-motion` para transiciones fluidas.
- **Iconografía:** `lucide-react` y `react-icons`.
- **Comunicación:** Axios para el consumo de la API REST.

### 🏗️ Infraestructura y DevOps
- **Contenedores:** Soporte para Docker para despliegue consistente.
- **CI/CD:** Pipelines configurados para automatización de builds.
- **Cloud:** Despliegue orientado a infraestructura de AWS (EC2/S3).

---

## ✨ Características Principales

| Módulo | Funcionalidad |
| :--- | :--- |
| **🛡️ Seguridad** | Control de acceso, autenticación JWT y encriptación de datos. |
| **📈 Terminal** | Visualización de mercados financieros en tiempo real mediante integración con TradingView. |
| **💬 Comunidad** | Feed social de análisis donde los analistas comparten sus predicciones y proyecciones. |
| **👤 Perfiles** | Gestión avanzada de perfiles de usuario con métricas de éxito y rendimiento. |
| **📁 Archivos** | Gestión de archivos multimedia y documentos mediante AWS S3. |

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **JDK 25** o superior.
- **Node.js 20+** y **npm**.
- **PostgreSQL** en ejecución.
- **Maven 3.x**.

### 2. Configuración del Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend-core
   ```
2. Configura las variables de entorno o el archivo `src/main/resources/application.properties` con tus credenciales (DB, AWS, JWT).
3. Compila y ejecuta:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   *La API estará disponible en `http://localhost:8080`*

### 3. Configuración del Frontend
1. Navega a la carpeta del frontend:
   ```bash
   cd frontend-socialmarkets
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *La aplicación estará disponible en `http://localhost:5173` (o el puerto configurado por Vite)*

---

## 🧪 Ejecución de Pruebas

- **Backend:** `mvn test`
- **Frontend:** `npm test` (si se configuran suites de vitest)

---

## 👤 Autor

- **David de Antonio Palomar** — *Desarrollador*
- **Ramiro Martín Morro** — *Tutor*

---

## 📄 Licencia
Proyecto académico desarrollado como Trabajo de Fin de Grado (TFG). Licencia MIT. Todos los derechos reservados para fines educativos.
