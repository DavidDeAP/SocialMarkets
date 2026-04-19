package com.socialmarkets.backend_core.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.socialmarkets.backend_core.entities.Noticia;
import com.socialmarkets.backend_core.services.NoticiaService;

@RestController
@RequestMapping("/api/noticias")
@CrossOrigin(origins = "*") // Permitimos todo para pruebas locales
public class NoticiaController {

    @Autowired
    private NoticiaService noticiaService;

    // POST: http://localhost:8080/api/noticias/registrar
    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Noticia noticia) {
        try {
            Noticia nuevaNoticia = noticiaService.registrarNoticia(noticia);
            return ResponseEntity.ok(nuevaNoticia);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET: http://localhost:8080/api/noticias/ultimas
    @GetMapping("/ultimas")
    public ResponseEntity<List<Noticia>> obtenerUltimasNoticias() {
        return ResponseEntity.ok(noticiaService.obtenerUltimasNoticias());
    }
}
