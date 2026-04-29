package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.repositories.NotificacionRepository;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion crearNotificacion(Usuario usuario, String texto, String enlace, Usuario autor) {
        Notificacion noti = Notificacion.builder()
                .usuario(usuario)
                .texto(texto)
                .enlace(enlace)
                .autor(autor)
                .fecha(LocalDateTime.now())
                .leida(false)
                .build();
        return notificacionRepository.save(noti);
    }

    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
    }

    @Autowired
    @org.springframework.context.annotation.Lazy
    private UsuarioService usuarioService;

    public List<Notificacion> obtenerUltimas10(Usuario usuario) {
        List<Notificacion> notis = notificacionRepository.findTop10ByUsuarioOrderByFechaDesc(usuario);
        // Recuperación de autor para notificaciones antiguas o sin relación directa
        for (Notificacion n : notis) {
            if (n.getAutor() == null && n.getTexto() != null && n.getTexto().startsWith("@")) {
                try {
                    String username = n.getTexto().split(" ")[0].substring(1);
                    Usuario autor = usuarioService.obtenerPorNombre(username);
                    n.setAutor(autor);
                } catch (Exception e) {
                    // Si no se encuentra el usuario, se queda como null
                }
            }
        }
        return notis;
    }

    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }

    public void marcarTodasComoLeidas(Usuario usuario) {
        List<Notificacion> noLeidas = notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
        noLeidas.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(noLeidas);
    }
}