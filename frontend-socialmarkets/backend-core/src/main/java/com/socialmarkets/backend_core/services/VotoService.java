package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Voto;
import com.socialmarkets.backend_core.repositories.VotoRepository;

@Service
public class VotoService {

    @Autowired
    private VotoRepository votoRepository;

    public Voto emitirVoto(Voto voto) {
        // Validación para evitar que un usuario vote dos veces lo mismo
        votoRepository.findByUsuarioAndAnalisis(voto.getUsuario(), voto.getAnalisis())
                .ifPresent(v -> { throw new RuntimeException("Ya has votado este análisis"); });

        voto.setFechaVoto(LocalDateTime.now());
        return votoRepository.save(voto);
    }
}