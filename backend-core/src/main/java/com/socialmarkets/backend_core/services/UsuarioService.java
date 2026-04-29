package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.repositories.UsuarioRepository;
import com.socialmarkets.backend_core.security.JwtUtils;
import org.springframework.context.annotation.Lazy;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Lazy
    private AnalisisService analisisService;

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
        return usuarioRepository.save(usuario);
    }
    
    public Usuario actualizarPerfil(String username, String biografia, String urlImagen, boolean eliminarFoto) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (biografia != null) {
            usuario.setBiografia(biografia);
        }
        
        if (eliminarFoto) {
            usuario.setImagen(null);
        } else if (urlImagen != null) {
            usuario.setImagen(urlImagen);
        }

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
        Usuario usuario = usuarioRepository.findByUsuario(nombre)
               .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        analisisService.actualizarEstadisticasUsuario(usuario);
        return usuario;
    }
    
    public boolean esSeguidor(String nombreSeguidor, String nombreObjetivo) {
        Usuario objetivo = obtenerPorNombre(nombreObjetivo);
        Usuario seguidor = obtenerPorNombre(nombreSeguidor);
        return objetivo.getSeguidores().contains(seguidor);
    }
    
    @Autowired
    private NotificacionService notificacionService;

    @Transactional
    public boolean toggleSeguimiento(String nombreSeguidor, String nombreObjetivo) {
        if (nombreSeguidor.equals(nombreObjetivo)) {
            throw new RuntimeException("No puedes seguirte a ti mismo");
        }

        Usuario seguidor = obtenerPorNombre(nombreSeguidor);
        Usuario objetivo = obtenerPorNombre(nombreObjetivo);

        if (objetivo.getSeguidores().contains(seguidor)) {
            objetivo.getSeguidores().remove(seguidor);
            usuarioRepository.save(objetivo);
            return false;
        } else {
            objetivo.getSeguidores().add(seguidor);
            usuarioRepository.save(objetivo);
            
            // Notificar al usuario objetivo
            notificacionService.crearNotificacion(
                objetivo, 
                "@" + nombreSeguidor + " te ha comenzado a seguir", 
                "/perfil/" + nombreSeguidor,
                seguidor.getImagen()
            );
            
            return true;
        }
    }

    public List<Usuario> buscarPorNombre(String query) {
        List<Usuario> usuarios = usuarioRepository.findByUsuarioContainingIgnoreCase(query);
        // Actualizamos estadísticas para que los datos mostrados sean reales
        usuarios.forEach(u -> analisisService.actualizarEstadisticasUsuario(u));
        return usuarios;
    }
}