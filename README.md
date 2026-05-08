# 📊 SocialMarkets - Terminal Financiera Colaborativa

![Java](https://img.shields.io/badge/Java-25-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)

**SocialMarkets** es una plataforma colaborativa de análisis financiero diseñada para inversores y analistas. Permite compartir proyecciones de mercado, validar ideas mediante un sistema de votación y seguir el rendimiento de la comunidad a través de un ranking de éxito. La aplicación integra una terminal financiera avanzada con datos en tiempo real y gestión de perfiles profesionales.

---

## 🛠️ Tecnologías y Arquitectura

El proyecto sigue una arquitectura de cliente-servidor con un backend robusto en Java y un frontend moderno basado en componentes reactivos.

### 🖥️ Backend (Core API)
Ubicado en la carpeta `backend-core/`.

- **Lenguaje:** Java 25
- **Framework:** Spring Boot 4.0.5
- **Seguridad:** Spring Security con **JWT (JSON Web Tokens)** para autenticación segura.
- **Persistencia:** Spring Data JPA con **PostgreSQL**.
- **Almacenamiento:** Integración con **AWS S3** para el almacenamiento de imágenes de perfil y archivos.
- **Notificaciones:** Sistema de notificaciones internas para interacciones entre usuarios (seguidores, publicaciones).
- **Productividad:** Project Lombok para un código más limpio.

### 🌐 Frontend (Interfaz de Usuario)
Ubicado en la carpeta `frontend-socialmarkets/`.

- **Framework:** React 19.2 (Vite 8.0)
- **Navegación:** React Router 7
- **Estilos:** Vanilla CSS con un enfoque en **Glassmorphism** para una interfaz premium y moderna.
- **Animaciones:** `framer-motion` para una experiencia de usuario fluida.
- **Iconografía:** `lucide-react` y `react-icons`.
- **Comunicación:** Axios para el consumo eficiente de la API REST.

---

## ✨ Características Principales

| Módulo | Funcionalidad |
| :--- | :--- |
| **🛡️ Seguridad** | Registro, inicio de sesión y protección de rutas mediante JWT. |
| **📈 Terminal** | Visualización de activos financieros en tiempo real con integración de TradingView. |
| **💬 Comunidad** | Feed interactivo donde los analistas publican análisis con precios objetivo y stop-loss. |
| **🏆 Ranking** | Clasificación de analistas basada en su índice de éxito y rendimiento. |
| **🔔 Notificaciones** | Alertas en tiempo real sobre nuevos seguidores y actividad en publicaciones. |
| **👤 Perfiles** | Gestión de perfil, biografía, imágenes (vía S3) y métricas de analista. |

---

## 🚀 Guía de Instalación y Ejecución

### 1. Requisitos Previos
- **JDK 25** instalado.
- **Node.js 20+** y **npm**.
- **PostgreSQL 16** (u otra versión compatible) en ejecución.
- **Maven 3.x**.

### 2. Configuración del Backend
1. Navega a `backend-core/`.
2. Configura el archivo `src/main/resources/application.properties` con tus credenciales:
   - Base de datos (URL, usuario, contraseña).
   - AWS S3 (Access Key, Secret Key, Bucket).
   - Secreto para JWT.
3. Ejecuta el servidor:
   ```bash
   mvn spring-boot:run
   ```
   *La API correrá en `http://localhost:8080`*

### 3. Configuración del Frontend
1. Navega a `frontend-socialmarkets/`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el modo desarrollo:
   ```bash
   npm run dev
   ```
   *Accede desde `http://localhost:5173`*

---

## 👤 Autores

- **David de Antonio Palomar** — *Desarrollador*
- **Ramiro Martín Morro** — *Tutor*

---

## 📄 Licencia

Este proyecto ha sido desarrollado como **Trabajo de Fin de Grado (TFG)**. Licencia MIT. Todos los derechos reservados para fines académicos y de desarrollo profesional.
