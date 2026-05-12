package com.socialmarkets.backend_core.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.socialmarkets.backend_core.enums.EstadoAnalisis;
import com.socialmarkets.backend_core.enums.TipoAnalisis;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Representa una publicación de análisis o predicción financiera realizada por un usuario
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "analisis")
public class Analisis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long identificador; // ID único del análisis

    @Column(columnDefinition = "TEXT")
    private String contenido; // El texto explicativo de la tesis de inversión

    @Column(name = "precio_entrada")
    private Double precioEntrada; // El precio en tiempo real que se asigna al hacer el post

    @Column(name = "precio_cierre")
    private Double precioCierre; // El precio del activo en el momento en el que se caduca el post

    @Column(name = "precio_objetivo")
    private Double precioObjetivo; // El precio que pone el usuario como meta por lo que cree que sucederá

    @Column(name = "fecha_vencimiento")
    private LocalDateTime fechaVencimiento; // Fecha que pone el usuario para que se cumpla o no su análisis
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion; // Cuándo se publicó el análisis

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre; // Cuándo se determinó el resultado final

    @ElementCollection
    @CollectionTable(name = "analisis_imagenes", joinColumns = @JoinColumn(name = "id_analisis"))
    @Column(name = "url_imagen")
    @Size(max = 4, message = "No puedes subir más de 4 imágenes")
    private List<String> imagenes; // Capturas de pantalla de los gráficos

    @Enumerated(EnumType.STRING)
    private TipoAnalisis tipo; // Compra o Venta

    @Enumerated(EnumType.STRING)
    private EstadoAnalisis estado; // Pendiente, Éxito o Fallo

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_activo")
    private Activo activo;

    @OneToMany(mappedBy = "analisis", cascade = CascadeType.ALL)
    private List<Voto> votos;
}
