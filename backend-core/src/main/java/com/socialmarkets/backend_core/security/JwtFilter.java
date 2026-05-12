package com.socialmarkets.backend_core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;

/**
 * Filtro que se ejecuta en cada petición para verificar si el usuario tiene un token válido
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Buscamos el encabezado "Authorization" en la petición HTTP
        String authHeader = request.getHeader("Authorization");

        // Si el encabezado existe y empieza por "Bearer ", extraemos el token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Si el token es válido, identificamos al usuario y lo "logueamos" en el contexto de Spring
            if (jwtUtils.validarToken(token)) {
                String usuario = jwtUtils.getUsuarioDesdeToken(token);
                
                // Creamos un objeto de autenticación para que Spring sepa quién es el usuario
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(usuario, null, new ArrayList<>());
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Dejamos que la petición siga su camino hacia el controlador correspondiente
        filterChain.doFilter(request, response);
    }
}