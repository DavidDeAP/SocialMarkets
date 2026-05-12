package com.socialmarkets.backend_core.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.services.AnalisisService;

/**
 * Controlador para gestionar las publicaciones de análisis de los usuarios
 */
@RestController
@RequestMapping("/api/analisis")
@CrossOrigin(origins = "*") 
public class AnalisisController {

    @Autowired
    private AnalisisService analisisService;

    // Crea un nuevo análisis, permitiendo adjuntar imágenes de gráficos
    @PostMapping(value = "/crear", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crear(
            Principal principal,
            @RequestPart("analisis") Analisis analisis,
            @RequestPart(value = "imagenes", required = false) MultipartFile[] imagenes) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            
            Analisis nuevoAnalisis = analisisService.crearAnalisis(analisis, principal.getName(), imagenes);
            return ResponseEntity.ok(nuevoAnalisis);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lista todos los análisis de la comunidad
    @GetMapping
    public ResponseEntity<?> listarAnalisis(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String orden) {
        return ResponseEntity.ok(analisisService.obtenerTodosPaginados(page, size, orden));
    }

    // Filtra análisis por su estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Analisis>> obtenerAnalisisPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(analisisService.obtenerPorEstado(estado));
    }

    // Obtiene los análisis publicados por un usuario concreto
    @GetMapping("/usuario/{username}")
    public ResponseEntity<?> obtenerAnalisisPorUsuario(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(analisisService.obtenerPorUsuarioPaginado(username, page, size));
    }

    // Proporciona datos resumidos para el panel principal del usuario
    @GetMapping("/resumen")
    public ResponseEntity<java.util.Map<String, Object>> obtenerResumen(java.security.Principal principal) {
        return ResponseEntity.ok(analisisService.obtenerResumenDashboard(principal.getName()));
    }

    // Busca un análisis específico por su ID único
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerAnalisisPorId(@PathVariable Long id) {
        try {
            Analisis analisis = analisisService.obtenerPorId(id);
            return ResponseEntity.ok(analisis);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Permite a los usuarios dar o quitar un voto a un análisis
    @PostMapping("/{id}/votar")
    public ResponseEntity<?> votarAnalisis(@PathVariable Long id, Principal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("No autorizado");
            analisisService.alternarVoto(id, principal.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
