package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Activo;
import com.socialmarkets.backend_core.services.ActivoService;

@RestController
@RequestMapping("/api/activos")
@CrossOrigin(origins = "*") // Permitimos todo para pruebas locales
public class ActivoController {

    @Autowired
    private ActivoService activoService;

    // POST: http://localhost:8080/api/activos/guardar
    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Activo activo) {
        try {
            Activo activoGuardado = activoService.guardarOActualizar(activo);
            return ResponseEntity.ok(activoGuardado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET: http://localhost:8080/api/activos
    @GetMapping
    public ResponseEntity<List<Activo>> listarActivos() {
        return ResponseEntity.ok(activoService.obtenerTodos());
    }

    // GET: http://localhost:8080/api/activos/nombre/{nombre}
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> obtenerActivoPorNombre(@PathVariable String nombre) {
        try {
            Activo activo = activoService.obtenerPorNombre(nombre);
            return ResponseEntity.ok(activo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
