package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.entities.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VotoRepository extends JpaRepository<Voto, Long> {
    Optional<Voto> findByUsuarioAndAnalisis(Usuario usuario, Analisis analisis);
}