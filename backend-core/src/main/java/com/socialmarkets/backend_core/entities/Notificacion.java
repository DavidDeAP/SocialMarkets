package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Representa una notificación enviada a un usuario (ej: un nuevo seguidor o un like)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador; // ID único de la notificación

    @Column(name = "texto", nullable = false, length = 255)
    private String texto; // El mensaje que verá el usuario

    @Column(name = "enlace")
    private String enlace; // Ruta opcional a la que redirigir al hacer click

    @ManyToOne
    @JoinColumn(name = "id_autor")
    @ToString.Exclude
    private Usuario autor; // De qué usuario viene la notificación

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha; // Cuándo se generó

    @Column(name = "leida", nullable = false)
    private Boolean leida = false; // Indica si el usuario ya la ha visto

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    @ToString.Exclude
    private Usuario usuario; // El destinatario de la notificación

    @PrePersist
    protected void onCreate() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.leida == null) {
            this.leida = false;
        }
    }
}