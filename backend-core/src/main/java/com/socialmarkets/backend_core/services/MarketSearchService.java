package com.socialmarkets.backend_core.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio encargado de buscar activos (acciones, criptos, índices) mediante palabras clave
 */
@Service
public class MarketSearchService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Mapeo manual para asegurar que los activos más populares siempre aparezcan con nombres amigables
    private static final Map<String, Map<String, String>> TOP_ASSETS = new HashMap<>();

    static {
        addTopAsset("SP500", "^GSPC", "S&P 500 Index", "INDEX", "Índice");
        addTopAsset("IBEX", "^IBEX", "IBEX 35 Madrid", "INDEX", "Índice");
        addTopAsset("NASDAQ", "^IXIC", "NASDAQ Composite", "INDEX", "Índice");
        addTopAsset("DOW", "^DJI", "Dow Jones Industrial Average", "INDEX", "Índice");
        addTopAsset("ORO", "GC=F", "Gold Futures", "COMMODITY", "Materia Prima");
        addTopAsset("GOLD", "GC=F", "Gold Futures", "COMMODITY", "Materia Prima");
        addTopAsset("PLATA", "SI=F", "Silver Futures", "COMMODITY", "Materia Prima");
        addTopAsset("PETROLEO", "CL=F", "Crude Oil Futures", "COMMODITY", "Materia Prima");
        addTopAsset("OIL", "CL=F", "Crude Oil Futures", "COMMODITY", "Materia Prima");
        addTopAsset("BITCOIN", "BTC-USD", "Bitcoin", "CRYPTO", "Cripto");
        addTopAsset("ETHEREUM", "ETH-USD", "Ethereum", "CRYPTO", "Cripto");
        addTopAsset("APPLE", "AAPL", "Apple Inc.", "EQUITY", "Acción");
        addTopAsset("TESLA", "TSLA", "Tesla, Inc.", "EQUITY", "Acción");
        addTopAsset("NVIDIA", "NVDA", "NVIDIA Corporation", "EQUITY", "Acción");
    }

    private static void addTopAsset(String key, String symbol, String name, String type, String typeDisp) {
        Map<String, String> data = new HashMap<>();
        data.put("symbol", symbol);
        data.put("name", name);
        data.put("exchange", type.equals("CRYPTO") ? "CRYPTO" : "INDEX");
        data.put("type", type);
        data.put("typeDisp", typeDisp);
        TOP_ASSETS.put(key.toUpperCase(), data);
    }

    // Método principal que combina resultados manuales (TOP_ASSETS) con resultados de Yahoo Finance
    public List<Map<String, Object>> search(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        String upperQuery = query.toUpperCase();

        // 1. Buscamos primero en nuestra lista manual de activos populares
        for (Map.Entry<String, Map<String, String>> entry : TOP_ASSETS.entrySet()) {
            if (entry.getKey().contains(upperQuery) || upperQuery.contains(entry.getKey())) {
                results.add(new HashMap<>(entry.getValue()));
            }
        }

        // 2. Realizamos la búsqueda en la API de Yahoo Finance para encontrar otros activos
        try {
            String url = "https://query1.finance.yahoo.com/v1/finance/search?q=" + query + "&quotesCount=20&newsCount=0";
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode quotes = root.path("quotes");
                
                for (JsonNode q : quotes) {
                    String symbol = q.path("symbol").asText();
                    // Evitamos duplicar si el activo ya estaba en nuestra lista manual
                    if (results.stream().anyMatch(r -> r.get("symbol").equals(symbol))) continue;

                    Map<String, Object> map = new HashMap<>();
                    map.put("symbol", symbol);
                    map.put("name", q.path("shortname").asText(q.path("longname").asText(symbol)));
                    map.put("exchange", q.path("exchange").asText("UNKNOWN"));
                    map.put("type", q.path("quoteType").asText("UNKNOWN"));
                    map.put("typeDisp", q.path("typeDisp").asText(q.path("quoteType").asText()));
                    results.add(map);
                }
            }
        } catch (Exception e) {
            System.err.println("Error en búsqueda de mercado: " + e.getMessage());
        }

        return results;
    }
}
