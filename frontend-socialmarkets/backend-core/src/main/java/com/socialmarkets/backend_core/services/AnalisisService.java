package com.socialmarkets.backend_core.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.enums.EstadoAnalisis;
import com.socialmarkets.backend_core.repositories.AnalisisRepository;

@Service
public class AnalisisService {

    @Autowired
    private AnalisisRepository analisisRepository;

    public Analisis crearAnalisis(Analisis analisis) {
        // Al crear un análisis, el estado inicial siempre es "Pendiente" 
    	analisis.setEstado(EstadoAnalisis.PENDIENTE); 
        return analisisRepository.save(analisis);
    }

    public List<Analisis> obtenerTodos() {
        return analisisRepository.findAll();
    }

    public List<Analisis> obtenerPorEstado(String estado) {
        return analisisRepository.findByEstado(estado);
    }

    public Analisis obtenerPorId(Long id) {
        return analisisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));
    }
}