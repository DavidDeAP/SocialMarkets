package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Activo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repositorio para gestionar las operaciones de base de datos de los Activos
 */
public interface ActivoRepository extends JpaRepository<Activo, Long> {
    
    // Busca un activo específico filtrando por su nombre exacto
    Optional<Activo> findByNombre(String nombre);
}