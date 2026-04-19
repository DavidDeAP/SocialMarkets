package com.socialmarkets.backend_core.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.services.S3Service;
import com.socialmarkets.backend_core.services.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private S3Service s3Service; // Servicio de AWS S3

    // POST para recibir Imagen + Datos
    @PostMapping(value = "/registrar", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registrar(
            @RequestParam("usuario") String usuarioJson, // Lo recibimos como String
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        try {
            // 1. Convertimos el texto JSON a un objeto Usuario manualmente (si lo hacía directamente no me lo detectaba como JSON)
            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            // Esto es necesario para que entienda las fechas como LocalDateTime
            objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            
            Usuario usuario = objectMapper.readValue(usuarioJson, Usuario.class);

            // 2. Si hay foto, la subimos
            if (foto != null && !foto.isEmpty()) {
                String urlImagen = s3Service.subirArchivo(foto);
                usuario.setImagen(urlImagen);
            }

            // 3. Guardamos en la DB
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
            
        } catch (Exception e) {
            e.printStackTrace(); // Esto imprimirá el error en la consola si algo falla
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuarioPorId(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(id);
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}