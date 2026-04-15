package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "noticias")
public class Noticia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador;

    @Column(name = "contenido", columnDefinition = "TEXT", nullable = false)
    private String contenido;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "enlace", length = 500)
    private String enlace; // Url a la noticia original

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }
}