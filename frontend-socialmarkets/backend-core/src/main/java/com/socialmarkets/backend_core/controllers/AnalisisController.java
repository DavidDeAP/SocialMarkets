package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.services.AnalisisService;

@RestController
@RequestMapping("/api/analisis")
@CrossOrigin(origins = "*") // Permitimos todo para pruebas locales
public class AnalisisController {

    @Autowired
    private AnalisisService analisisService;

    // POST: http://localhost:8080/api/analisis/crear
    @PostMapping("/crear")
    public ResponseEntity<?> crear(@RequestBody Analisis analisis) {
        try {
            Analisis nuevoAnalisis = analisisService.crearAnalisis(analisis);
            return ResponseEntity.ok(nuevoAnalisis);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET: http://localhost:8080/api/analisis
    @GetMapping
    public ResponseEntity<List<Analisis>> listarAnalisis() {
        return ResponseEntity.ok(analisisService.obtenerTodos());
    }

    // GET: http://localhost:8080/api/analisis/estado/{estado}
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Analisis>> obtenerAnalisisPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(analisisService.obtenerPorEstado(estado));
    }

    // GET: http://localhost:8080/api/analisis/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerAnalisisPorId(@PathVariable Long id) {
        try {
            Analisis analisis = analisisService.obtenerPorId(id);
            return ResponseEntity.ok(analisis);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
