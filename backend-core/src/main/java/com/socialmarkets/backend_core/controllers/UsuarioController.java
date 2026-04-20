package com.socialmarkets.backend_core.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.security.JwtUtils;
import com.socialmarkets.backend_core.services.S3Service;
import com.socialmarkets.backend_core.services.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private S3Service s3Service; // Servicio de AWS S3

 // POST para recibir Imagen + Datos
    @PostMapping(value = "/registrar", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registrar(
            @RequestPart("usuario") Usuario usuario, // Spring lo convierte de JSON a Objeto automáticamente
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        try {
            // 1. Ya no necesitas el ObjectMapper, 'usuario' ya viene relleno

            // 2. Si hay foto, la subimos
            if (foto != null && !foto.isEmpty()) {
                String urlImagen = s3Service.subirArchivo(foto);
                usuario.setImagen(urlImagen);
            }

            // 3. Guardamos en la DB
            Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam("usuario") String user, @RequestParam("password") String pass) {
        try {
            String token = usuarioService.autenticar(user, pass, jwtUtils);
            return ResponseEntity.ok(token); // Enviamos el "carnet" al frontend
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }
    }

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodos());
    }
    
    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil(java.security.Principal principal) {
        try {
            // principal.getName() devuelve el usuario que el JwtFilter guardó en la memoria
            Usuario usuario = usuarioService.obtenerPorNombre(principal.getName());
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Usuario no encontrado");
        }
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