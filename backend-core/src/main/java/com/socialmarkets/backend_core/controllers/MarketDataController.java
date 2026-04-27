package com.socialmarkets.backend_core.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
public class MarketDataController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Caché simple para evitar 429 Too Many Requests
    private final java.util.Map<String, CachedPrice> priceCache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final long CACHE_DURATION = 8000; // 8 segundos para asegurar que el intervalo de 10s del front siempre pille dato nuevo

    private static class CachedPrice {
        String data;
        long timestamp;
        CachedPrice(String data) {
            this.data = data;
            this.timestamp = System.currentTimeMillis();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchAssets(@RequestParam String q) {
        try {
            String url = "https://query1.finance.yahoo.com/v1/finance/search?q=" + q + "&quotesCount=10&newsCount=0";
            
            // Yahoo Finance bloquea peticiones sin un User-Agent de navegador
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            headers.set("Accept", "application/json");
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error al buscar activos: " + e.getMessage());
        }
    }

    @GetMapping("/price")
    public ResponseEntity<?> getPrice(@RequestParam String symbol) {
        // 1. Verificar caché
        CachedPrice cached = priceCache.get(symbol);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp) < CACHE_DURATION) {
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(cached.data);
        }

        try {
            // Usamos el endpoint de chart v8 que suele ser más estable
            String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1m&range=1d";
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Accept", "application/json");
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
            
            String body = response.getBody();
            priceCache.put(symbol, new CachedPrice(body)); // Guardar en caché

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(body);
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            // FALLBACK PARA CRIPTO si Yahoo falla por 429
            if (symbol.endsWith("-USD")) {
                try {
                    String cryptoSymbol = symbol.replace("-USD", "USDT");
                    String fallbackUrl = "https://api.binance.com/api/v3/ticker/24hr?symbol=" + cryptoSymbol;
                    String binanceRes = restTemplate.getForObject(fallbackUrl, String.class);
                    // Transformar mínimamente para que el frontend lo entienda o devolverlo tal cual
                    // Por simplicidad, devolvemos un error controlado pero informando que es por límites
                    return ResponseEntity.status(429).body("{\"error\": \"Límite de Yahoo alcanzado. Intenta de nuevo en 1 minuto.\"}");
                } catch (Exception ex) {
                    return ResponseEntity.status(429).body("{\"error\": \"Demasiadas peticiones a Yahoo Finance.\"}");
                }
            }
            return ResponseEntity.status(429).body("{\"error\": \"Demasiadas peticiones. Por favor, espera un momento.\"}");
        } catch (Exception e) {
            System.err.println("Error en proxy de precio para " + symbol + ": " + e.getMessage());
            return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
