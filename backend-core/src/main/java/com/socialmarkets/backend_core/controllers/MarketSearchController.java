package com.socialmarkets.backend_core.controllers;

import com.socialmarkets.backend_core.services.MarketSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador para la búsqueda rápida de activos en el mercado
 */
@RestController
@RequestMapping("/api/mercados/buscar")
@CrossOrigin(origins = "*")
public class MarketSearchController {

    @Autowired
    private MarketSearchService marketSearchService;

    // Realiza una búsqueda de activos basándose en un texto (mínimo 2 caracteres)
    @GetMapping
    public List<Map<String, Object>> buscar(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return List.of();
        }
        return marketSearchService.search(q);
    }
}
