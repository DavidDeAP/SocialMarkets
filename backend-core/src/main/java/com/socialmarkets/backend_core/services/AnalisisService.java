package com.socialmarkets.backend_core.services;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.socialmarkets.backend_core.entities.Analisis;
import com.socialmarkets.backend_core.entities.Usuario;
import com.socialmarkets.backend_core.entities.Voto;
import com.socialmarkets.backend_core.entities.Activo;
import com.socialmarkets.backend_core.enums.EstadoAnalisis;
import com.socialmarkets.backend_core.repositories.AnalisisRepository;
import com.socialmarkets.backend_core.repositories.UsuarioRepository;
import com.socialmarkets.backend_core.repositories.VotoRepository;

@Service
public class AnalisisService {

    @Autowired
    private AnalisisRepository analisisRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
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

    @Autowired
    private NotificacionService notificacionService;

    @Transactional
    public Analisis crearAnalisis(Analisis analisis, String username, MultipartFile[] imagenes) throws Exception {
        Usuario usuario = usuarioService.obtenerPorNombre(username);
        analisis.setUsuario(usuario);

        if (analisis.getActivo() != null && analisis.getActivo().getNombre() != null) {
            String nombreActivo = analisis.getActivo().getNombre().toUpperCase();
            try {
                analisis.setActivo(activoService.obtenerPorNombre(nombreActivo));
            } catch (Exception e) {
                Activo nuevoActivo = new Activo();
                nuevoActivo.setNombre(nombreActivo);
                nuevoActivo.setTipo("CRIPTO");
                analisis.setActivo(activoService.guardarOActualizar(nuevoActivo));
            }
        }

        if (imagenes != null && imagenes.length > 0) {
            List<String> urls = new ArrayList<>();
            for (MultipartFile img : imagenes) {
                if (img != null && !img.isEmpty()) {
                    urls.add(s3Service.subirArchivo(img));
                }
            }
            analisis.setImagenes(urls);
        }

        analisis.setEstado(EstadoAnalisis.PENDIENTE);
        analisis.setFechaCreacion(LocalDateTime.now());
        
        Analisis guardado = analisisRepository.save(analisis);

        if (usuario.getSeguidores() != null) {
            String textoNoti = "@" + usuario.getUsuario() + " ha publicado un nuevo análisis sobre " + guardado.getActivo().getNombre();
            String enlaceNoti = "/comunidad?analisis=" + guardado.getIdentificador();
            
            for (Usuario seguidor : usuario.getSeguidores()) {
                notificacionService.crearNotificacion(seguidor, textoNoti, enlaceNoti, usuario);
            }
        }

        return guardado;
    }

    public List<Analisis> obtenerTodos() {
        verificarAnalisisPendientes();
        return analisisRepository.findAll();
    }

    @Transactional
    public void verificarAnalisisPendientes() {
        try {
            List<Analisis> pendientes = analisisRepository.findByEstado(EstadoAnalisis.PENDIENTE);
            LocalDateTime ahora = LocalDateTime.now();

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
                        a.setFechaCierre(ahora);
                        cerrado = true;
                    }
                }

                if (!cerrado && a.getFechaVencimiento().isBefore(ahora)) {
                    a.setEstado(EstadoAnalisis.FALLIDO);
                    a.setPrecioCierre(precioActual != null ? precioActual : a.getPrecioEntrada());
                    a.setFechaCierre(ahora);
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
    public void actualizarEstadisticasUsuario(Usuario usuario) {
        List<Analisis> todos = analisisRepository.findByUsuario(usuario);
        
        // 1. Índice de Acierto Total
        long cerradosTotales = todos.stream().filter(a -> a.getEstado() != EstadoAnalisis.PENDIENTE).count();
        if (cerradosTotales == 0) {
            usuario.setIndiceAcierto(0.0);
        } else {
            long acertadosTotales = todos.stream().filter(a -> a.getEstado() == EstadoAnalisis.ACERTADO).count();
            usuario.setIndiceAcierto((double) acertadosTotales / cerradosTotales * 100.0);
        }

        // 2. Rendimiento Mensual (Diferencia entre hoy y hace 30 días)
        // Calculamos el índice que tenía hace 30 días
        LocalDateTime haceUnMes = LocalDateTime.now().minusDays(30);
        List<Analisis> cerradosHaceUnMes = todos.stream()
                .filter(a -> a.getEstado() != EstadoAnalisis.PENDIENTE)
                .filter(a -> a.getFechaCierre() != null && a.getFechaCierre().isBefore(haceUnMes))
                .collect(Collectors.toList());

        double indiceHaceUnMes = 0.0;
        if (!cerradosHaceUnMes.isEmpty()) {
            long acertadosHaceUnMes = cerradosHaceUnMes.stream()
                    .filter(a -> a.getEstado() == EstadoAnalisis.ACERTADO)
                    .count();
            indiceHaceUnMes = (double) acertadosHaceUnMes / cerradosHaceUnMes.size() * 100.0;
        }

        // El rendimiento es la ganancia de índice en este periodo
        // Si es nuevo (indiceHaceUnMes = 0), el rendimiento es su índice actual completo
        usuario.setRendimientoMes(usuario.getIndiceAcierto() - indiceHaceUnMes);

        usuarioRepository.save(usuario);
    }

    public List<Analisis> obtenerPorUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return analisisRepository.findByUsuario(usuario).stream()
                .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
                .collect(Collectors.toList());
    }

    public List<Analisis> obtenerPorEstado(String estado) {
        try {
            return analisisRepository.findByEstado(EstadoAnalisis.valueOf(estado.toUpperCase()));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public java.util.Map<String, Object> obtenerResumenDashboard(String username) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Analisis> todos = analisisRepository.findByUsuario(usuario);
        
        // Ordenar por fecha descendente para "Actividad Reciente"
        List<Analisis> recientes = todos.stream()
                .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
                .limit(10)
                .collect(Collectors.toList());

        List<Analisis> activos = todos.stream()
                .filter(a -> a.getEstado() == EstadoAnalisis.PENDIENTE)
                .collect(Collectors.toList());

        java.util.Map<String, Object> resumen = new java.util.HashMap<>();
        resumen.put("total", todos.size());
        resumen.put("indiceAcierto", usuario.getIndiceAcierto());
        resumen.put("recientes", recientes);
        resumen.put("activos", activos); // Mantenemos activos para el conteo live del header
        
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        long acertadosMes = todos.stream()
                .filter(a -> a.getEstado() == EstadoAnalisis.ACERTADO && a.getFechaCreacion().isAfter(inicioMes))
                .count();
        
        double aumento = acertadosMes > 0 ? (double)acertadosMes * 1.5 : 0.0;
        resumen.put("aumentoMes", aumento);

        return resumen;
    }

    public Analisis obtenerPorId(Long id) {
        return analisisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Análisis no encontrado"));
    }

    public List<Analisis> obtenerPorIdEn(List<Long> ids) {
        return analisisRepository.findAllById(ids);
    }

    @Transactional
    public void alternarVoto(Long analisisId, String username) {
        Analisis analisis = obtenerPorId(analisisId);
        Usuario usuario = usuarioService.obtenerPorNombre(username);

        Optional<Voto> votoExistente = votoRepository.findByUsuarioAndAnalisis(usuario, analisis);

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