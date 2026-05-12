package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.services.NotificacionService;
import com.socialmarkets.backend_core.services.UsuarioService;

/**
 * Este controlador gestiona las notificaciones que reciben los usuarios
 * (likes, seguidores, cambios en predicciones, etc.)
 */
@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*") 
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsuarioService usuarioService;

    // Crea manualmente una notificación para un usuario
    @PostMapping("/crear")
    public ResponseEntity<?> crearNotificacion(
            @RequestParam Long usuarioId, 
            @RequestParam String texto, 
            @RequestParam(required = false) String enlace,
            @RequestParam(required = false) Long autorId) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            Usuario autor = null;
            if (autorId != null) {
                autor = usuarioService.obtenerPorId(autorId);
            }
            Notificacion nuevaNotificacion = notificacionService.crearNotificacion(usuario, texto, enlace, autor);
            return ResponseEntity.ok(nuevaNotificacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Obtiene las últimas notificaciones de un usuario de forma paginada
    @GetMapping("/ultimas10/{usuarioId}")
    public ResponseEntity<?> obtenerUltimas10(
            @PathVariable Long usuarioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            return ResponseEntity.ok(notificacionService.obtenerPaginadas(usuario, page, size));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Devuelve solo las notificaciones que el usuario aún no ha visto
    @GetMapping("/noleidas/{usuarioId}")
    public ResponseEntity<?> obtenerNoLeidas(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            List<Notificacion> noLeidas = notificacionService.obtenerNoLeidas(usuario);
            return ResponseEntity.ok(noLeidas);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Marca una notificación específica como vista (leída)
    @PutMapping("/{id}/leida")
    public ResponseEntity<?> marcarComoLeida(@PathVariable Long id) {
        try {
            notificacionService.marcarComoLeida(id);
            return ResponseEntity.ok("Notificación marcada como leída");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Marca todas las notificaciones de un usuario como leídas de golpe
    @PutMapping("/leertodas/{usuarioId}")
    public ResponseEntity<?> marcarTodasComoLeidas(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            notificacionService.marcarTodasComoLeidas(usuario);
            return ResponseEntity.ok("Todas las notificaciones marcadas como leídas");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Borra definitivamente una notificación
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarNotificacion(@PathVariable Long id) {
        try {
            notificacionService.eliminarNotificacion(id);
            return ResponseEntity.ok("Notificación eliminada");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
