package com.socialmarkets.backend_core.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Activo;
import com.socialmarkets.backend_core.repositories.ActivoRepository;

/**
 * Lógica de negocio para gestionar los activos financieros
 */
@Service
public class ActivoService {

    @Autowired
    private ActivoRepository activoRepository;

    // Guarda un activo nuevo o actualiza los datos de uno que ya existe
    public Activo guardarOActualizar(Activo activo) {
        return activoRepository.save(activo);
    }

    // Recupera la lista de todos los activos disponibles en el sistema
    public List<Activo> obtenerTodos() {
        return activoRepository.findAll();
    }

    // Busca un activo por su nombre y lanza un error si no lo encuentra
    public Activo obtenerPorNombre(String nombre) {
        return activoRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Activo no encontrado: " + nombre));
    }
}