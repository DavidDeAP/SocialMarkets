package com.socialmarkets.backend_core.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.enums.EstadoAnalisis;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.entities.Voto;
import com.socialmarkets.backend_core.repositories.AnalisisRepository;
import com.socialmarkets.backend_core.repositories.UsuarioRepository;
import com.socialmarkets.backend_core.repositories.VotoRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalisisService {

    @Autowired
    private AnalisisRepository analisisRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private ActivoService activoService;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private MarketDataService marketDataService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private VotoRepository votoRepository;

    @Transactional
    public Analisis crearAnalisis(Analisis analisis, String username, org.springframework.web.multipart.MultipartFile[] imagenes) throws Exception {
        // 1. Asignar Usuario
        com.socialmarkets.backend_core.entities.Usuario usuario = usuarioService.obtenerPorNombre(username);
        analisis.setUsuario(usuario);

        // 2. Gestionar Activo
        if (analisis.getActivo() != null && analisis.getActivo().getNombre() != null) {
            String nombreActivo = analisis.getActivo().getNombre().toUpperCase();
            try {
                analisis.setActivo(activoService.obtenerPorNombre(nombreActivo));
            } catch (Exception e) {
                // Si no existe, creamos uno básico
                com.socialmarkets.backend_core.entities.Activo nuevoActivo = new com.socialmarkets.backend_core.entities.Activo();
                nuevoActivo.setNombre(nombreActivo);
                nuevoActivo.setTipo("CRIPTO"); // Por defecto
                analisis.setActivo(activoService.guardarOActualizar(nuevoActivo));
            }
        }

        // 3. Subir Imágenes a S3
        if (imagenes != null && imagenes.length > 0) {
            java.util.List<String> urls = new java.util.ArrayList<>();
            for (org.springframework.web.multipart.MultipartFile img : imagenes) {
                if (img != null && !img.isEmpty()) {
                    urls.add(s3Service.subirArchivo(img));
                }
            }
            analisis.setImagenes(urls);
        }

        // 4. Configurar Metadatos
        analisis.setEstado(EstadoAnalisis.PENDIENTE);
        analisis.setFechaCreacion(java.time.LocalDateTime.now());
        
        return analisisRepository.save(analisis);
    }

    public List<Analisis> obtenerTodos() {
        verificarAnalisisPendientes();
        return analisisRepository.findAll();
    }

    @Transactional
    public void verificarAnalisisPendientes() {
        try {
            List<Analisis> pendientes = analisisRepository.findByEstado(EstadoAnalisis.PENDIENTE);
            java.time.LocalDateTime ahora = java.time.LocalDateTime.now();

            for (Analisis a : pendientes) {
                try {
                    if (a.getActivo() == null || a.getFechaVencimiento() == null) continue;

                    boolean cerrado = false;
                    Double precioActual = marketDataService.obtenerPrecioActual(a.getActivo().getNombre());

                    if (precioActual != null) {
                        boolean isBullish = a.getPrecioObjetivo() > a.getPrecioEntrada();
                        
                        if ((isBullish && precioActual >= a.getPrecioObjetivo()) || 
                            (!isBullish && precioActual <= a.getPrecioObjetivo())) {
                            a.setEstado(EstadoAnalisis.ACERTADO);
                            a.setPrecioCierre(precioActual);
                            cerrado = true;
                        }
                    }

                    if (!cerrado && a.getFechaVencimiento().isBefore(ahora)) {
                        a.setEstado(EstadoAnalisis.FALLIDO);
                        a.setPrecioCierre(precioActual != null ? precioActual : a.getPrecioEntrada());
                        cerrado = true;
                    }

                    if (cerrado) {
                        analisisRepository.save(a);
                        actualizarEstadisticasUsuario(a.getUsuario());
                    }
                } catch (Exception e) {
                    System.err.println("Error procesando análisis " + a.getIdentificador() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Error general en verificación de análisis: " + e.getMessage());
        }
    }

    @Transactional
    public void actualizarEstadisticasUsuario(com.socialmarkets.backend_core.entities.Usuario usuario) {
        List<Analisis> todos = analisisRepository.findByUsuario(usuario);
        long cerrados = todos.stream().filter(a -> a.getEstado() != com.socialmarkets.backend_core.enums.EstadoAnalisis.PENDIENTE).count();
        if (cerrados == 0) {
            usuario.setIndiceAcierto(0.0);
        } else {
            long acertados = todos.stream().filter(a -> a.getEstado() == com.socialmarkets.backend_core.enums.EstadoAnalisis.ACERTADO).count();
            double indice = (double) acertados / cerrados * 100.0;
            usuario.setIndiceAcierto(indice);
        }
        usuarioRepository.save(usuario);
    }

    public List<Analisis> obtenerPorEstado(String estado) {
        try {
            return analisisRepository.findByEstado(EstadoAnalisis.valueOf(estado.toUpperCase()));
        } catch (Exception e) {
            return new java.util.ArrayList<>();
        }
    }

    public Analisis obtenerPorId(Long id) {
        return analisisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));
    }

    @Transactional
    public void alternarVoto(Long analisisId, String username) {
        Analisis analisis = obtenerPorId(analisisId);
        Usuario usuario = usuarioService.obtenerPorNombre(username);

        java.util.Optional<Voto> votoExistente = votoRepository.findByUsuarioAndAnalisis(usuario, analisis);

        if (votoExistente.isPresent()) {
            votoRepository.delete(votoExistente.get());
        } else {
            Voto nuevoVoto = new Voto();
            nuevoVoto.setUsuario(usuario);
            nuevoVoto.setAnalisis(analisis);
            votoRepository.save(nuevoVoto);
        }
    }
}