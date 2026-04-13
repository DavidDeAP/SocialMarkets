package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.repositories.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Método para el Login (Simplificado sin JWT por ahora para que no te dé error)
    public Usuario autenticar(String nombreUsuario, String password) {
        return usuarioRepository.findByUsuario(nombreUsuario)
                .filter(u -> u.getHashClave().equals(password))
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));
    }

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByUsuario(usuario.getUsuario())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        usuario.setFechaRegistro(LocalDateTime.now());
        usuario.setIndiceAcierto(0.0);
        usuario.setNumeroPredicciones(0);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El usuario con ID " + id + " no existe"));
    }
}