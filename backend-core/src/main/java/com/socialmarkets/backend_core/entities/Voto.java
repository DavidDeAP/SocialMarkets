package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Representa un voto que un usuario da a un análisis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "votos")
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador; // ID único del voto

    @Column(name = "fecha_voto", nullable = false)
    private LocalDateTime fechaVoto; // Cuándo se emitió el voto

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario; // El usuario que da el voto

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "id_analisis", nullable = false)
    private Analisis analisis; // El análisis que recibe el voto

    @PrePersist
    protected void onCreate() {
        this.fechaVoto = LocalDateTime.now();
    }
}