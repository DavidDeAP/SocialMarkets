package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Activo;
import com.socialmarkets.backend_core.services.ActivoService;

/**
 * Este controlador maneja todo lo relacionado con los activos financieros (acciones, criptos, etc.)
 */
@RestController
@RequestMapping("/api/activos")
@CrossOrigin(origins = "*")
public class ActivoController {

    @Autowired
    private ActivoService activoService;

    // Guarda un nuevo activo o actualiza uno existente si ya existe
    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Activo activo) {
        try {
            Activo activoGuardado = activoService.guardarOActualizar(activo);
            return ResponseEntity.ok(activoGuardado);
        } catch (RuntimeException e) {
            // Si algo sale mal, avisamos del error
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Devuelve la lista completa de activos que tenemos en la base de datos
    @GetMapping
    public ResponseEntity<List<Activo>> listarActivos() {
        return ResponseEntity.ok(activoService.obtenerTodos());
    }

    // Busca un activo específico por su nombre (ej: "Bitcoin" o "Apple")
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> obtenerActivoPorNombre(@PathVariable String nombre) {
        try {
            Activo activo = activoService.obtenerPorNombre(nombre);
            return ResponseEntity.ok(activo);
        } catch (RuntimeException e) {
            // Si no lo encontramos, devolvemos un error 404
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
