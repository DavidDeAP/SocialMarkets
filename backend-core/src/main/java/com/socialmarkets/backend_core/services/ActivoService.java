package com.socialmarkets.backend_core.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Activo;
import com.socialmarkets.backend_core.repositories.ActivoRepository;

@Service
public class ActivoService {

    @Autowired
    private ActivoRepository activoRepository;

    public Activo guardarOActualizar(Activo activo) {
        return activoRepository.save(activo);
    }

    public List<Activo> obtenerTodos() {
        return activoRepository.findAll();
    }

    public Activo obtenerPorNombre(String nombre) {
        return activoRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Activo no encontrado: " + nombre));
    }
}