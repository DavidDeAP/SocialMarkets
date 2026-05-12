package com.socialmarkets.backend_core.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio encargado de obtener precios en tiempo real desde APIs externas (Yahoo Finance)
 */
@Service
public class MarketDataService {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // Sistema de caché para evitar saturar la API externa
    private final Map<String, Double> priceCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION = 10000; // El precio se considera "fresco" durante 10 segundos

    // Obtiene el precio de mercado actual para un símbolo
    public Double obtenerPrecioActual(String symbol) {
        long now = System.currentTimeMillis();
        
        // Si tenemos el precio en caché y no ha caducado, lo devolvemos directamente
        if (priceCache.containsKey(symbol) && (now - cacheTimestamps.get(symbol)) < CACHE_DURATION) {
            return priceCache.get(symbol);
        }

        try {
            // Consultamos a Yahoo Finance simulando un navegador para evitar bloqueos
            String url = "https://query2.finance.yahoo.com/v8/finance/chart/" + symbol + "?interval=1m&range=1d";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            // Parseamos el JSON para extraer el precio actual
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode meta = root.path("chart").path("result").get(0).path("meta");
            Double price = meta.path("regularMarketPrice").asDouble();
            
            // Guardamos en caché y devolvemos
            priceCache.put(symbol, price);
            cacheTimestamps.put(symbol, now);
            return price;
        } catch (Exception e) {
            System.err.println("Error obteniendo precio para " + symbol + ": " + e.getMessage());
            return null;
        }
    }
}
