package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Voto;
import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VotoRepository extends JpaRepository<Voto, Long> {
    // Para saber si un usuario ya ha votado un análisis concreto
    Optional<Voto> findByUsuarioAndAnalisis(Usuario usuario, Analisis analisis);
}