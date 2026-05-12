package com.socialmarkets.backend_core.controllers;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Arrays;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Este controlador actúa como un puente para obtener datos financieros reales de Yahoo Finance
 * sin tener problemas de CORS en el navegador.
 */
@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "*")
public class MarketDataController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, String> priceCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION = 8000; // Cache de 8 segundos para no saturar la API externa

    // Busca activos por nombre o ticker (ej: "Apple" o "AAPL")
    @GetMapping("/search")
    public ResponseEntity<?> searchAssets(@RequestParam String q) {
        try {
            String url = "https://query2.finance.yahoo.com/v1/finance/search?q=" + q + "&quotesCount=10&newsCount=0";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            return restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // Obtiene el precio actual de un único activo
    @GetMapping("/price")
    public ResponseEntity<?> getPrice(@RequestParam String symbol) {
        String data = fetchSinglePrice(symbol);
        if (data != null) {
            return ResponseEntity.ok().header("Content-Type", "application/json").body(data);
        }
        return ResponseEntity.status(500).body("{\"error\": \"No se pudo obtener el precio\"}");
    }

    // Obtiene los precios de varios activos a la vez de forma eficiente y en paralelo
    @GetMapping("/prices")
    public ResponseEntity<?> getPrices(@RequestParam String symbols) {
        String[] symbolArray = symbols.split(",");
        
        List<CompletableFuture<Map<String, Object>>> futures = Arrays.stream(symbolArray)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> CompletableFuture.supplyAsync(() -> {
                String json = fetchSinglePrice(s);
                Map<String, Object> result = new HashMap<>();
                if (json != null) {
                    try {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(json);
                        com.fasterxml.jackson.databind.JsonNode meta = root.path("chart").path("result").get(0).path("meta");
                        
                        result.put("symbol", s);
                        result.put("regularMarketPrice", meta.path("regularMarketPrice").asDouble());
                        result.put("currency", meta.path("currency").asText());
                    } catch (Exception e) {
                        System.err.println("Error parseando v8 para " + s);
                    }
                }
                return result;
            }))
            .collect(Collectors.toList());

        List<Map<String, Object>> results = futures.stream()
            .map(CompletableFuture::join)
            .filter(m -> !m.isEmpty())
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        Map<String, Object> quoteResponse = new HashMap<>();
        quoteResponse.put("result", results);
        response.put("quoteResponse", quoteResponse);

        return ResponseEntity.ok(response);
    }

    // Método interno que hace la petición real a Yahoo Finance o devuelve el dato de la caché
    private String fetchSinglePrice(String symbol) {
        long now = System.currentTimeMillis();
        if (priceCache.containsKey(symbol) && (now - cacheTimestamps.get(symbol)) < CACHE_DURATION) {
            return priceCache.get(symbol);
        }

        try {
            String url = "https://query2.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1m&range=1d";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            priceCache.put(symbol, response.getBody());
            cacheTimestamps.put(symbol, now);
            return response.getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
