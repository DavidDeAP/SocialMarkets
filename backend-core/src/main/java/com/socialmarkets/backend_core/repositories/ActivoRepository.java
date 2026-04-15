package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Activo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ActivoRepository extends JpaRepository<Activo, Long> {
    // Para buscar un activo por su nombre
    Optional<Activo> findByNombre(String nombre);
}