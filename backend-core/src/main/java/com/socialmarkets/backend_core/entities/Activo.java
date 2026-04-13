package com.socialmarkets.backend_core.entities;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activos")
public class Activo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long identificador;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre; // Ej: "BTC/USDT" o "AAPL"

    @Column(name = "valor")
    private Double valor; // Precio actual de mercado

    @Column(name = "tipo", length = 50)
    private String tipo; // "Cripto", "Acción", "Divisa"
}