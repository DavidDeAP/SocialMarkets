# 📊 SocialMarkets - Aplicación Web Financiera Colaborativa

![Java](https://img.shields.io/badge/Java-25-007396?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazonaws&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)

**SocialMarkets** es una plataforma web colaborativa de análisis financiero diseñada para inversores y analistas. Permite compartir proyecciones de mercado, validar ideas mediante un sistema de votación y seguir el rendimiento de la comunidad a través de un ranking de éxito. La app integra una terminal financiera avanzada con datos en tiempo real y gestión de perfiles profesionales.

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

Pasos detallados para poner en marcha el proyecto en tu entorno local.

### 1️⃣ Requisitos Previos
Antes de empezar, asegúrate de tener instalado lo siguiente:
- **Java JDK 25**: Necesario para el backend de Spring Boot.
- **Node.js (v20 o superior)** y **npm**: Para gestionar y ejecutar el frontend.
- **PostgreSQL (v16)**: Base de datos relacional en ejecución.
- **Git**: Para clonar el repositorio.
- **IDE Recomendado**: IntelliJ IDEA para el backend y VS Code para el frontend.

---

### 2️⃣ Clonar el Proyecto
Abre una terminal y clona el repositorio completo:
```bash
git clone https://github.com/DavidDeAP/SocialMarkets.git
cd SocialMarkets
```

---

### 3️⃣ Configuración del Backend (Java/Spring)
1. **Preparar la Base de Datos**:
   - Accede a tu cliente de PostgreSQL (pgAdmin, DBeaver o psql).
   - Crea una nueva base de datos llamada `socialmarkets`.
2. **Configurar Propiedades**:
   - Navega a `backend-core/src/main/resources/`.
   - Abre `application.properties` y ajusta los siguientes valores:
     ```properties
     # Conexión a DB
     spring.datasource.url=jdbc:postgresql://localhost:5432/socialmarkets
     spring.datasource.username=tu_usuario
     spring.datasource.password=tu_contraseña

     # Configuración de AWS S3 (Para imágenes)
     aws.s3.accessKey=TU_ACCESS_KEY
     aws.s3.secretKey=TU_SECRET_KEY
     aws.s3.bucketName=TU_BUCKET_NAME

     # Seguridad JWT
     jwt.secret=tu_clave_secreta_muy_larga_y_segura
     ```
3. **Ejecutar el Servidor**:
   Desde la carpeta `backend-core/`, ejecuta:
   ```bash
   mvn spring-boot:run
   ```
   > El servidor estará disponible en `http://localhost:8080`. Puedes verificar la conexión accediendo a `http://localhost:8080/api/usuarios/publico/admin` (si ya tienes datos iniciales).

---

### 4️⃣ Configuración del Frontend (React/Vite)
1. **Entrar en la carpeta del frontend**:
   ```bash
   cd frontend-socialmarkets
   ```
2. **Instalar Dependencias**:
   ```bash
   npm install
   ```
3. **Lanzar la Aplicación**:
   ```bash
   npm run dev
   ```
4. **Acceso Web**:
   Abre tu navegador y entra en: `http://localhost:5173`

---

### 💡 Notas Adicionales
- **Cuentas de Prueba**: Una vez arrancado, puedes registrarte como nuevo usuario desde la pantalla de registro para empezar a publicar tus primeros análisis.
- **TradingView**: Los gráficos cargan automáticamente vía CDN, por lo que no requieren configuración adicional, pero sí conexión a internet.
- **Seguridad**: Asegúrate de que el backend esté corriendo antes de intentar iniciar sesión en el frontend, ya que las peticiones a la API fallarán en caso contrario.

---

## 👤 Autores

- **David de Antonio Palomar** — **Desarrollador**
- **Ramiro Martín Morro** — **Tutor**

---

## 📄 Licencia

Este proyecto ha sido desarrollado como **Trabajo de Fin de Grado (TFG)**. Licencia MIT. Todos los derechos reservados para fines académicos y de desarrollo profesional.
