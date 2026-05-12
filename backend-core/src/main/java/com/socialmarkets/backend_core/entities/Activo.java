package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * Representa un activo financiero en el sistema
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activos")
public class Activo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador; // ID único en nuestra base de datos

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre; // Símbolo o nombre del activo

    @Column(name = "valor")
    private Double valor; // Último precio conocido

    @Column(name = "tipo", length = 50)
    private String tipo; // Categoría: "Cripto", "Acción", "Divisa", etc.
}