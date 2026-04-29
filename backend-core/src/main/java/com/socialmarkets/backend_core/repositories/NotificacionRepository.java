package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Notificacion;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioAndLeidaFalse(Usuario usuario);
    
    // Para el panel con scroll infinito/paginado
    Page<Notificacion> findByUsuarioOrderByFechaDesc(Usuario usuario, Pageable pageable);
    
    List<Notificacion> findTop10ByUsuarioOrderByFechaDesc(Usuario usuario);
}