package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Para el Login y para ver perfiles
	boolean existsByUsuario(String usuario);
	Optional<Usuario> findByUsuario(String usuario);
    java.util.List<Usuario> findByUsuarioContainingIgnoreCase(String query);

    // Ranking
    java.util.List<Usuario> findTop10ByOrderByIndiceAciertoDesc();
    java.util.List<Usuario> findTop10ByOrderByProyeccionesAcertadasDesc();
    
    @org.springframework.data.jpa.repository.Query("SELECT u FROM Usuario u ORDER BY size(u.analisis) DESC")
    java.util.List<Usuario> findTop10ByOrderByNumeroPrediccionesDesc(org.springframework.data.domain.Pageable pageable);
}