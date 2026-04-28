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
        return analisisRepository.findAll();
    }

    public List<Analisis> obtenerPorEstado(String estado) {
        return analisisRepository.findByEstado(estado);
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