package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnalisisRepository extends JpaRepository<Analisis, Long> {
    // Para ver los análisis de un usuario concreto
    List<Analisis> findByUsuario(Usuario usuario);
    
    // Para filtrar por estado (Pendiente, Acertado o Fallido)
    List<Analisis> findByEstado(String estado);
}