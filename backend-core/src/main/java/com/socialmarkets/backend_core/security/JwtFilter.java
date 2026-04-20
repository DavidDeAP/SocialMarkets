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

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Valida el token
            if (jwtUtils.validarToken(token)) {
                String usuario = jwtUtils.getUsuarioDesdeToken(token);
                
                // Loguea al usuario
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(usuario, null, new ArrayList<>());
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Continua con la petición
        filterChain.doFilter(request, response);
    }
}