package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.repositories.NotificacionRepository;

/**
 * Servicio para gestionar el envío y la lectura de notificaciones a los usuarios
 */
@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    // Crea y guarda una nueva notificación en la base de datos
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

    // Obtiene la lista de notificaciones que el usuario aún no ha visto
    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
    }

    @Autowired
    @org.springframework.context.annotation.Lazy
    private UsuarioService usuarioService;

    // Obtiene las 10 notificaciones más recientes para el panel rápido
    public List<Notificacion> obtenerUltimas10(Usuario usuario) {
        List<Notificacion> notis = notificacionRepository.findTop10ByUsuarioOrderByFechaDesc(usuario);
        for (Notificacion n : notis) {
            recuperarAutorSiEsNecesario(n);
        }
        return notis;
    }

    // Obtiene notificaciones con soporte para carga progresiva (paginación)
    public Page<Notificacion> obtenerPaginadas(Usuario usuario, int pagina, int tamano) {
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "fecha"));
        Page<Notificacion> notis = notificacionRepository.findByUsuarioOrderByFechaDesc(usuario, pageable);
        for (Notificacion n : notis) {
            recuperarAutorSiEsNecesario(n);
        }
        return notis;
    }

    // Método auxiliar para intentar identificar al autor si falta en la relación de la BD
    private void recuperarAutorSiEsNecesario(Notificacion n) {
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

    // Marca una notificación específica como leída
    public void marcarComoLeida(Long id) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }

    // Marca todas las notificaciones pendientes de un usuario como leídas de golpe
    public void marcarTodasComoLeidas(Usuario usuario) {
        List<Notificacion> noLeidas = notificacionRepository.findByUsuarioAndLeidaFalse(usuario);
        noLeidas.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(noLeidas);
    }

    // Borra permanentemente una notificación
    public void eliminarNotificacion(Long id) {
        if (!notificacionRepository.existsById(id)) {
            throw new RuntimeException("Notificación no encontrada");
        }
        notificacionRepository.deleteById(id);
    }
}