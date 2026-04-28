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

@Service
public class MarketDataService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, Double> priceCache = new ConcurrentHashMap<>();
    private final Map<String, Long> cacheTimestamps = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION = 10000; // 10 segundos

    public Double obtenerPrecioActual(String symbol) {
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
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            JsonNode meta = root.path("chart").path("result").get(0).path("meta");
            Double price = meta.path("regularMarketPrice").asDouble();
            
            priceCache.put(symbol, price);
            cacheTimestamps.put(symbol, now);
            return price;
        } catch (Exception e) {
            System.err.println("Error obteniendo precio para " + symbol + ": " + e.getMessage());
            return null;
        }
    }
}
