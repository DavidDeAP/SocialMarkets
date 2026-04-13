package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "analisis")
public class Analisis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long identificador;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "precio_entrada")
    private Double precioEntrada;

    @Column(name = "precio_cierre")
    private Double precioCierre;

    @Column(name = "precio_objetivo")
    private Double precioObjetivo;

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento;

    private String tipo; // "Fundamental" o "Técnico"
    private String estado; // "Pendiente", "Acertado", "Fallido"

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_activo")
    private Activo activo;

    @OneToMany(mappedBy = "analisis", cascade = CascadeType.ALL)
    private List<Voto> votos;
}
