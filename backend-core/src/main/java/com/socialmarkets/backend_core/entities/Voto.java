package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "votos")
public class Voto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador;

    @Column(name = "fecha_voto", nullable = false)
    private LocalDateTime fechaVoto;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_analisis", nullable = false)
    private Analisis analisis;

    @PrePersist
    protected void onCreate() {
        this.fechaVoto = LocalDateTime.now();
    }
}