package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repositorio para gestionar las operaciones de base de datos de los Usuarios
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Comprueba si ya existe un usuario con ese nombre en el sistema
	boolean existsByUsuario(String usuario);

    // Busca un usuario por su nombre exacto (utilizado para el login)
	Optional<Usuario> findByUsuario(String usuario);

    // Busca usuarios cuyo nombre contenga el texto indicado (para el buscador global)
    java.util.List<Usuario> findByUsuarioContainingIgnoreCase(String query);

    // Ranking: Obtiene los 10 mejores usuarios por su porcentaje de acierto
    java.util.List<Usuario> findTop10ByOrderByIndiceAciertoDesc();

    // Ranking: Obtiene los 10 usuarios con más predicciones acertadas
    java.util.List<Usuario> findTop10ByOrderByProyeccionesAcertadasDesc();
    
    // Ranking: Obtiene los 10 usuarios con más predicciones
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u ORDER BY size(u.analisis) DESC")
    java.util.List<Usuario> findTop10ByOrderByNumeroPrediccionesDesc(org.springframework.data.domain.Pageable pageable);
}