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

/**
 * Servicio encargado de gestionar toda la lógica relacionada con los usuarios (perfil, seguidores, ranking)
 */
@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Lazy
    private AnalisisService analisisService;

    // Verifica las credenciales de un usuario y devuelve un token JWT si son correctas
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

    // Registra a un nuevo usuario cifrando su contraseña
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

    public Usuario actualizarPreferenciasNotificaciones(String username, boolean seguidores, boolean publicaciones) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNotificarSeguidores(seguidores);
        usuario.setNotificarPublicaciones(publicaciones);

        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarPrivacidad(String username, String privacidad, boolean ocultarSeguidores, boolean ocultarPredicciones, boolean ocultarIndice, boolean ocultarPublicaciones) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setPrivacidadPerfil(privacidad);
        usuario.setOcultarSeguidores(ocultarSeguidores);
        usuario.setOcultarPredicciones(ocultarPredicciones);
        usuario.setOcultarIndiceAcierto(ocultarIndice);
        usuario.setOcultarPublicaciones(ocultarPublicaciones);

        return usuarioRepository.save(usuario);
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El usuario con ID " + id + " no existe"));
    }
    
    // Busca un usuario por su nombre y actualiza sus estadísticas antes de devolverlo
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

    // Permite a un usuario seguir o dejar de seguir a otro
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
            return false; // Indica que se ha dejado de seguir
        } else {
            objetivo.getSeguidores().add(seguidor);
            usuarioRepository.save(objetivo);
            
            // Notificar al usuario objetivo
            if (objetivo.getNotificarSeguidores() != null && objetivo.getNotificarSeguidores()) {
                notificacionService.crearNotificacion(
                    objetivo, 
                    "@" + nombreSeguidor + " te ha comenzado a seguir", 
                    "/perfil/" + nombreSeguidor,
                    seguidor
                );
            }
            
            return true; // Indica que se ha empezado a seguir
        }
    }

    public List<Usuario> buscarPorNombre(String query) {
        List<Usuario> usuarios = usuarioRepository.findByUsuarioContainingIgnoreCase(query);
        // Actualizamos estadísticas para que los datos mostrados sean reales
        usuarios.forEach(u -> analisisService.actualizarEstadisticasUsuario(u));
        return usuarios;
    }

    // Obtiene el top 10 de usuarios basado en el criterio elegido (acierto, predicciones, etc.)
    public List<Usuario> obtenerRanking(String filtro) {
        List<Usuario> ranking;
        switch (filtro) {
            case "predicciones":
                ranking = usuarioRepository.findTop10ByOrderByNumeroPrediccionesDesc(org.springframework.data.domain.PageRequest.of(0, 10));
                break;
            case "acertadas":
                ranking = usuarioRepository.findTop10ByOrderByProyeccionesAcertadasDesc();
                break;
            case "indice":
            default:
                ranking = usuarioRepository.findTop10ByOrderByIndiceAciertoDesc();
                break;
        }
        // Aseguramos que las estadísticas estén al día para el ranking
        ranking.forEach(u -> analisisService.actualizarEstadisticasUsuario(u));
        return ranking;
    }

    @Transactional
    public void eliminarUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // El CascadeType.ALL en Usuario.java se encarga de Analisis y Notificaciones
        usuarioRepository.delete(usuario);
    }

    @Transactional
    public void cambiarPassword(String username, String passActual, String passNueva) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (passwordEncoder.matches(passActual, usuario.getHashClave())) {
            usuario.setHashClave(passwordEncoder.encode(passNueva));
            usuarioRepository.save(usuario);
        } else {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }
    }
}