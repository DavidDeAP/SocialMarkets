package com.socialmarkets.backend_core.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long identificador;

    @Column(unique = true, nullable = false)
    private String usuario;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "hash_clave", nullable = false)
    private String hashClave;

    @Column(name = "indice_acierto")
    private Double indiceAcierto = 0.0;

    @Column(name = "rendimiento_mes")
    private Double rendimientoMes = 0.0;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    private String imagen;

    // Cambiamos el nombre en el JSON para que el frontend lo lea como 'fechaCreacion'
    @JsonProperty("fechaCreacion")
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Analisis> analisis;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Notificacion> notificaciones;

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "usuario_seguidores",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "seguidor_id")
    )
    @ToString.Exclude // Evita bucles infinitos al imprimir
    private Set<Usuario> seguidores;

    @JsonProperty("seguidores")
    public int getNumeroSeguidores() {
        return (seguidores != null) ? seguidores.size() : 0;
    }
    
    @JsonProperty("numeroPredicciones")
    public int getNumeroPredicciones() {
        return (analisis != null) ? analisis.size() : 0;
    }

    @JsonProperty("nivel")
    public String getNivel() {
        int preds = getNumeroPredicciones();
        if (preds < 10) return "Analista Novato";
        if (this.indiceAcierto > 75) return "Analista Senior";
        return "Analista Pro";
    }

    @Column(name = "proyecciones_activas")
    private Integer proyeccionesActivas = 0;

    @Column(name = "proyecciones_acertadas")
    private Integer proyeccionesAcertadas = 0;

    @Column(name = "proyecciones_fallidas")
    private Integer proyeccionesFallidas = 0;

    @Column(name = "proyecciones_ganando")
    private Integer proyeccionesGanando = 0;

    @Column(name = "proyecciones_perdiendo")
    private Integer proyeccionesPerdiendo = 0;

    @JsonProperty("resumenProyecciones")
    public Map<String, Integer> getResumenProyecciones() {
        return Map.of(
            "activas", proyeccionesActivas != null ? proyeccionesActivas : 0,
            "acertadas", proyeccionesAcertadas != null ? proyeccionesAcertadas : 0,
            "fallidas", proyeccionesFallidas != null ? proyeccionesFallidas : 0,
            "ganando", proyeccionesGanando != null ? proyeccionesGanando : 0,
            "perdiendo", proyeccionesPerdiendo != null ? proyeccionesPerdiendo : 0
        );
    }

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
}