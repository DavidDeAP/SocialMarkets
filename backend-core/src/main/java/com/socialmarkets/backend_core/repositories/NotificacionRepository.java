package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repositorio para gestionar las notificaciones de los usuarios
 */
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    // Recupera la lista de notificaciones pendientes de leer para un usuario
    List<Notificacion> findByUsuarioAndLeidaFalse(Usuario usuario);
    
    // Obtiene las notificaciones de un usuario ordenadas por las más recientes (paginado)
    Page<Notificacion> findByUsuarioOrderByFechaDesc(Usuario usuario, Pageable pageable);
    
    // Recupera rápidamente las 10 notificaciones más recientes de un usuario
    List<Notificacion> findTop10ByUsuarioOrderByFechaDesc(Usuario usuario);
}