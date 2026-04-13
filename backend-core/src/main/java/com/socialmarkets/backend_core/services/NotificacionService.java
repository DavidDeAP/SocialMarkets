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

    public Notificacion crearNotificacion(Usuario usuario, String texto) {
        Notificacion noti = new Notificacion();
        noti.setUsuario(usuario);
        noti.setTexto(texto);
        noti.setFecha(LocalDateTime.now());
        noti.setLeida(false);
        return notificacionRepository.save(noti);
    }

    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
    }

    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }
}