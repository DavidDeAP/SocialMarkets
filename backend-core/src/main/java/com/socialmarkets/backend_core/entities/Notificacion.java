package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador;

    @Column(name = "texto", nullable = false, length = 255)
    private String texto;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "leida", nullable = false)
    private Boolean leida = false;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }
}