package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    // Para mostrar las notificaciones no leídas de un usuario
    List<Notificacion> findByUsuarioAndLeidaFalse(Usuario usuario);
    
    // Obtener las últimas 10 notificaciones ordenadas por fecha descendente
    List<Notificacion> findTop10ByUsuarioOrderByFechaDesc(Usuario usuario);
}