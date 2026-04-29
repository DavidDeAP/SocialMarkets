package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnalisisRepository extends JpaRepository<Analisis, Long> {
    List<Analisis> findByUsuario(Usuario usuario);
    Page<Analisis> findByUsuario(Usuario usuario, Pageable pageable);
    
    List<Analisis> findByEstado(com.socialmarkets.backend_core.enums.EstadoAnalisis estado);
    Page<Analisis> findByEstado(com.socialmarkets.backend_core.enums.EstadoAnalisis estado, Pageable pageable);

    Page<Analisis> findAll(Pageable pageable);
}