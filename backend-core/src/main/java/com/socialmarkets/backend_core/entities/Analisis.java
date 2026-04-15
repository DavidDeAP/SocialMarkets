package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.socialmarkets.backend_core.enums.EstadoAnalisis;
import com.socialmarkets.backend_core.enums.TipoAnalisis;

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
    private Double precioEntrada; // El precio en tiempo real que se asigna al hacer el post

    @Column(name = "precio_cierre")
    private Double precioCierre; // El precio del activo en el momento en el que se caduca el post

    @Column(name = "precio_objetivo")
    private Double precioObjetivo; // El precio que pone el usuario como meta por lo que cree que sucederá

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento; // Fecha que pone el usuario para que se cumpla o no su análisis

    @Enumerated(EnumType.STRING)
    private TipoAnalisis tipo;

    @Enumerated(EnumType.STRING)
    private EstadoAnalisis estado;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_activo")
    private Activo activo;

    @OneToMany(mappedBy = "analisis", cascade = CascadeType.ALL)
    private List<Voto> votos;
}
