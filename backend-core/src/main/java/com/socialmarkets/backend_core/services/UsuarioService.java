package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.repositories.UsuarioRepository;
import com.socialmarkets.backend_core.security.JwtUtils;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public String autenticar(String nombreUsuario, String password, JwtUtils jwtUtils) {
        Usuario usuario = usuarioRepository.findByUsuario(nombreUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (passwordEncoder.matches(password, usuario.getHashClave())) {
            return jwtUtils.generarToken(usuario.getUsuario());
        } else {
            throw new RuntimeException("Contraseña incorrecta");
        }
    }
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByUsuario(usuario.getUsuario())) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        usuario.setHashClave(passwordEncoder.encode(usuario.getHashClave()));
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
    
    public Usuario obtenerPorNombre(String nombre) {
        return usuarioRepository.findByUsuario(nombre)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}