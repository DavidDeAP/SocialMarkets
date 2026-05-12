package com.socialmarkets.backend_core.security;

import java.security.Key;
import java.util.Date;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * Herramienta para generar, leer y validar tokens JWT
 */
@Component
public class JwtUtils {
	
	@Value("${app.jwt.secret}")
    private String JWT_SECRET; // Secreto guardado en la configuración
    private final long JWT_EXPIRATION = 86400000L; // El token dura 24 horas
    private Key key;

    // Inicializa la llave de cifrado al arrancar la aplicación
    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes());
    }

    // Crea un nuevo token que contiene el nombre del usuario
    public String generarToken(String usuario) {
        return Jwts.builder()
                .setSubject(usuario)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extrae el nombre del usuario guardado dentro de un token
    public String getUsuarioDesdeToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // Verifica que el token no haya sido manipulado y que no haya caducado
    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Si hay cualquier error, devolvemos falso
            return false;
        }
    }
}