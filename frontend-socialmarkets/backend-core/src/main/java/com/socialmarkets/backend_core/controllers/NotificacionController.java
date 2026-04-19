package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.services.NotificacionService;
import com.socialmarkets.backend_core.services.UsuarioService;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*") // Permitimos todo para pruebas locales
public class NotificacionController {

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private UsuarioService usuarioService;

    // POST: http://localhost:8080/api/notificaciones/crear
    @PostMapping("/crear")
    public ResponseEntity<?> crearNotificacion(@RequestParam Long usuarioId, @RequestParam String texto) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            Notificacion nuevaNotificacion = notificacionService.crearNotificacion(usuario, texto);
            return ResponseEntity.ok(nuevaNotificacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET: http://localhost:8080/api/notificaciones/noleidas/{usuarioId}
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

    // PUT: http://localhost:8080/api/notificaciones/{id}/leida
    @PutMapping("/{id}/leida")
    public ResponseEntity<?> marcarComoLeida(@PathVariable Long id) {
        try {
            notificacionService.marcarComoLeida(id);
            return ResponseEntity.ok("Notificación marcada como leída");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
