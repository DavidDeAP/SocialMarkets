package com.socialmarkets.backend_core.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Voto;
import com.socialmarkets.backend_core.services.VotoService;

@RestController
@RequestMapping("/api/votos")
@CrossOrigin(origins = "*") // Permitimos todo para pruebas locales
public class VotoController {

    @Autowired
    private VotoService votoService;

    // POST: http://localhost:8080/api/votos/emitir
    @PostMapping("/emitir")
    public ResponseEntity<?> emitirVoto(@RequestBody Voto voto) {
        try {
            Voto votoEmitido = votoService.emitirVoto(voto);
            return ResponseEntity.ok(votoEmitido);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
