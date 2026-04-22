package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long identificador;

    @Column(unique = true, nullable = false)
    private String usuario;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "hash_clave", nullable = false)
    private String hashClave;

    @Column(name = "indice_acierto")
    private Double indiceAcierto = 0.0;

    @Column(name = "numero_predicciones")
    private Integer numeroPredicciones = 0;

    @Column(columnDefinition = "TEXT")
    private String biografia;

    private String imagen;

    // Cambiamos el nombre en el JSON para que el frontend lo lea como 'fechaCreacion'
    @JsonProperty("fechaCreacion")
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Analisis> analisis;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Notificacion> notificaciones;

    @ManyToMany
    @JoinTable(
        name = "usuario_seguidores",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "seguidor_id")
    )
    private Set<Usuario> seguidores;

    // --- CAMPO VIRTUAL PARA EL FRONTEND ---
    // Esto hace que el JSON incluya "seguidores: 15" en lugar de toda la lista de personas
    @JsonProperty("seguidores")
    public int getNumeroSeguidores() {
        return (seguidores != null) ? seguidores.size() : 0;
    }

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }
}