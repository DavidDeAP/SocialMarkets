package com.socialmarkets.backend_core.repositories;

import com.socialmarkets.backend_core.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Para el Login y para ver perfiles
	boolean existsByUsuario(String usuario);
	Optional<Usuario> findByUsuario(String usuario);
}