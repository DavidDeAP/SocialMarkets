package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

/**
 * Repositorio para gestionar las operaciones de base de datos de los Análisis
 */
public interface AnalisisRepository extends JpaRepository<Analisis, Long> {
    
    // Obtiene todos los análisis publicados por un usuario concreto
    List<Analisis> findByUsuario(Usuario usuario);
    
    // Obtiene los análisis de un usuario con soporte para paginación
    Page<Analisis> findByUsuario(Usuario usuario, Pageable pageable);
    
    // Filtra los análisis según su estado (PENDIENTE, EXITO, FALLO)
    List<Analisis> findByEstado(com.socialmarkets.backend_core.enums.EstadoAnalisis estado);
    
    // Filtra por estado con soporte para paginación
    Page<Analisis> findByEstado(com.socialmarkets.backend_core.enums.EstadoAnalisis estado, Pageable pageable);

    // Obtiene los análisis ordenados por popularidad
    @Query("SELECT a FROM Analisis a ORDER BY size(a.votos) DESC, a.fechaCreacion DESC")
    Page<Analisis> findAllOrderByPopularity(Pageable pageable);

    // Obtiene todos los análisis de la plataforma con paginación
    Page<Analisis> findAll(Pageable pageable);
}