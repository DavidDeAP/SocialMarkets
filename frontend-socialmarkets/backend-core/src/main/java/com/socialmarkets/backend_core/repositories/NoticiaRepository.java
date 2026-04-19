package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    // Para mostrar las noticias más recientes primero
    List<Noticia> findAllByOrderByFechaDesc();
}