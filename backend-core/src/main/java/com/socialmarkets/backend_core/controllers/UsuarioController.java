package com.socialmarkets.backend_core.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.security.JwtUtils;
import com.socialmarkets.backend_core.services.S3Service;
import com.socialmarkets.backend_core.services.UsuarioService;

/**
 * Controlador principal para la gestión de usuarios: registro, login, perfil y comunidad
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private S3Service s3Service; // Servicio para manejar imágenes en la nube (AWS S3)

    // Registra un nuevo usuario en la plataforma, permitiendo subir una foto de perfil
    @PostMapping(value = "/registrar", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registrar(
            @RequestPart("usuario") Usuario usuario,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        try {
            if (foto != null && !foto.isEmpty()) {
                String urlImagen = s3Service.subirArchivo(foto);
                usuario.setImagen(urlImagen);
            }
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Permite al usuario actualizar su biografía y su foto de perfil
    @PutMapping(value = "/actualizar", consumes = {"multipart/form-data"})
    public ResponseEntity<?> actualizarPerfil(
            Principal principal,
            @RequestPart(value = "biografia", required = false) String biografia,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            @RequestPart(value = "eliminarFoto", required = false) String eliminarFotoStr) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");

            boolean eliminarFoto = Boolean.parseBoolean(eliminarFotoStr);
            String urlImagen = null;
            if (foto != null && !foto.isEmpty()) {
                urlImagen = s3Service.subirArchivo(foto);
            }

            Usuario usuarioActualizado = usuarioService.actualizarPerfil(
                principal.getName(), 
                biografia, 
                urlImagen, 
                eliminarFoto
            );
            return ResponseEntity.ok(usuarioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Configura qué tipo de notificaciones quiere recibir el usuario
    @PutMapping("/preferencias-notificaciones")
    public ResponseEntity<?> actualizarPreferencias(
            Principal principal,
            @RequestParam("seguidores") boolean seguidores,
            @RequestParam("publicaciones") boolean publicaciones) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            Usuario u = usuarioService.actualizarPreferenciasNotificaciones(principal.getName(), seguidores, publicaciones);
            return ResponseEntity.ok(u);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Ajusta las opciones de privacidad del perfil (qué información es pública)
    @PutMapping("/privacidad")
    public ResponseEntity<?> actualizarPrivacidad(
            Principal principal,
            @RequestParam("privacidad") String privacidad,
            @RequestParam("ocultarSeguidores") boolean ocultarSeguidores,
            @RequestParam("ocultarPredicciones") boolean ocultarPredicciones,
            @RequestParam("ocultarIndice") boolean ocultarIndice,
            @RequestParam("ocultarPublicaciones") boolean ocultarPublicaciones) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            Usuario u = usuarioService.actualizarPrivacidad(
                principal.getName(), 
                privacidad, 
                ocultarSeguidores, 
                ocultarPredicciones, 
                ocultarIndice, 
                ocultarPublicaciones
            );
            return ResponseEntity.ok(u);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Autowired
    private JwtUtils jwtUtils;

    // Autentica al usuario y le devuelve un token JWT (su "llave" de acceso)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam("usuario") String user, @RequestParam("password") String pass) {
        try {
            String token = usuarioService.autenticar(user, pass, jwtUtils);
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
    }

    // Devuelve la lista de todos los usuarios (útil para administración o depuración)
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }
    
    // Obtiene los datos del usuario que tiene la sesión iniciada actualmente
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil(java.security.Principal principal) {
        try {
            Usuario usuario = usuarioService.obtenerPorNombre(principal.getName());
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Usuario no encontrado");
        }
    }
    
    // Obtiene la información pública de otro usuario para mostrar su perfil
    @GetMapping("/publico/{nombreUsuario}")
    public ResponseEntity<?> obtenerPerfilPublico(@PathVariable String nombreUsuario) {
        try {
            Usuario usuario = usuarioService.obtenerPorNombre(nombreUsuario);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Usuario no encontrado");
        }
    }
    
    // Permite seguir o dejar de seguir a otro usuario
    @PostMapping("/{username}/follow")
    public ResponseEntity<?> seguirUsuario(Principal principal, @PathVariable String username) {
        if (principal == null) return ResponseEntity.status(401).body("No autorizado");
        try {
            boolean siguiendo = usuarioService.toggleSeguimiento(principal.getName(), username);
            return ResponseEntity.ok(siguiendo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Comprueba si el usuario actual sigue a otro usuario concreto
    @GetMapping("/{username}/siguiendo")
    public ResponseEntity<Boolean> comprobarSeguimiento(Principal principal, @PathVariable String username) {
        if (principal == null) return ResponseEntity.ok(false);
        boolean sigue = usuarioService.esSeguidor(principal.getName(), username);
        return ResponseEntity.ok(sigue);
    }
    
    // Busca un usuario por su identificador numérico
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Busca usuarios que coincidan con un texto (para el buscador de la barra superior)
    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarUsuarios(@RequestParam("q") String query) {
        return ResponseEntity.ok(usuarioService.buscarPorNombre(query));
    }

    // Obtiene el ranking de mejores analistas (por índice de acierto o volumen)
    @GetMapping("/ranking")
    public ResponseEntity<List<Usuario>> obtenerRanking(@RequestParam(value = "filtro", defaultValue = "indice") String filtro) {
        return ResponseEntity.ok(usuarioService.obtenerRanking(filtro));
    }

    // Elimina permanentemente la cuenta del usuario autenticado
    @PostMapping("/eliminar")
    public ResponseEntity<?> eliminarCuenta(Principal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            usuarioService.eliminarUsuario(principal.getName());
            return ResponseEntity.ok("Cuenta eliminada con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la cuenta: " + e.getMessage());
        }
    }

    // Cambia la contraseña del usuario tras verificar la contraseña actual
    @PutMapping("/cambiar-password")
    public ResponseEntity<?> cambiarPassword(
            Principal principal,
            @RequestParam("actual") String actual,
            @RequestParam("nueva") String nueva) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            usuarioService.cambiarPassword(principal.getName(), actual, nueva);
            return ResponseEntity.ok("Contraseña actualizada con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

   }
