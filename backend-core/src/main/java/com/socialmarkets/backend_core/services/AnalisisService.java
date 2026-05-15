package com.socialmarkets.backend_core.services;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

/**
 * Servicio principal para gestionar las publicaciones de análisis financieros de la comunidad
 */
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

    // Crea un nuevo análisis, gestiona las imágenes en S3 y notifica a los seguidores
    @Transactional
    public Analisis crearAnalisis(Analisis analisis, String username, MultipartFile[] imagenes) throws Exception {
        Usuario usuario = usuarioService.obtenerPorNombre(username);
        analisis.setUsuario(usuario);

        // Si el activo no existe en nuestra BD, lo creamos automáticamente
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

        // Subida de imágenes a AWS S3 (máximo 4)
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

        // Notificación a los seguidores del autor
        if (usuario.getSeguidores() != null) {
            String textoNoti = "@" + usuario.getUsuario() + " ha publicado un nuevo análisis sobre " + guardado.getActivo().getNombre();
            String enlaceNoti = "/comunidad?analisis=" + guardado.getIdentificador();
            
            for (Usuario seguidor : usuario.getSeguidores()) {
                if (seguidor.getNotificarPublicaciones() != null && seguidor.getNotificarPublicaciones()) {
                    notificacionService.crearNotificacion(seguidor, textoNoti, enlaceNoti, usuario);
                }
            }
        }

        return guardado;
    }

    public List<Analisis> obtenerTodos() {
        verificarAnalisisPendientes();
        return analisisRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion"));
    }

    // Recupera todos los análisis del feed con soporte para paginación y orden por popularidad
    public Page<Analisis> obtenerTodosPaginados(int pagina, int tamano, String orden) {
        verificarAnalisisPendientes();
        Pageable pageable;
        
        if ("likes".equals(orden)) {
            pageable = PageRequest.of(pagina, tamano);
            return analisisRepository.findAllOrderByPopularity(pageable);
        }
        
        pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        return analisisRepository.findAll(pageable);
    }

    // Comprueba los análisis PENDIENTES contra los precios reales para ver si han tenido éxito o han fallado
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
                        
                        // Si se toca el precio objetivo, marcamos como ACERTADO
                        if ((isBullish && precioActual >= a.getPrecioObjetivo()) || 
                            (!isBullish && precioActual <= a.getPrecioObjetivo())) {
                            a.setEstado(EstadoAnalisis.ACERTADO);
                            a.setPrecioCierre(precioActual);
                            a.setFechaCierre(ahora);
                            cerrado = true;
                        }
                    }

                    // Si llega la fecha de vencimiento sin tocar el objetivo, marcamos como FALLIDO
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
        
        // 1. Conteo de Estados y Rendimiento Real-time
        long acertadas = todos.stream().filter(a -> a.getEstado() == EstadoAnalisis.ACERTADO).count();
        long fallidas = todos.stream().filter(a -> a.getEstado() == EstadoAnalisis.FALLIDO).count();
        
        List<Analisis> pendientes = todos.stream().filter(a -> a.getEstado() == EstadoAnalisis.PENDIENTE).collect(Collectors.toList());
        int ganando = 0;
        int perdiendo = 0;

        for (Analisis a : pendientes) {
            try {
                Double precioActual = marketDataService.obtenerPrecioActual(a.getActivo().getNombre());
                if (precioActual != null) {
                    boolean isBullish = a.getPrecioObjetivo() > a.getPrecioEntrada();
                    boolean isWinning = isBullish ? precioActual >= a.getPrecioEntrada() : precioActual <= a.getPrecioEntrada();
                    if (isWinning) ganando++;
                    else perdiendo++;
                }
            } catch (Exception e) {
                // Si falla el precio, no sumamos
            }
        }
        
        usuario.setProyeccionesActivas(pendientes.size());
        usuario.setProyeccionesAcertadas((int) acertadas);
        usuario.setProyeccionesFallidas((int) fallidas);
        usuario.setProyeccionesGanando(ganando);
        usuario.setProyeccionesPerdiendo(perdiendo);

        // 2. Índice de Acierto Total
        long cerradosTotales = acertadas + fallidas;
        if (cerradosTotales == 0) {
            usuario.setIndiceAcierto(0.0);
        } else {
            usuario.setIndiceAcierto((double) acertadas / cerradosTotales * 100.0);
        }

        usuarioRepository.save(usuario);
    }

    public List<Analisis> obtenerPorUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return analisisRepository.findByUsuario(usuario).stream()
                .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
                .collect(Collectors.toList());
    }

    public Page<Analisis> obtenerPorUsuarioPaginado(String username, int pagina, int tamano) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Pageable pageable = PageRequest.of(pagina, tamano, Sort.by(Sort.Direction.DESC, "fechaCreacion"));
        return analisisRepository.findByUsuario(usuario, pageable);
    }

    public List<Analisis> obtenerPorEstado(String estado) {
        try {
            return analisisRepository.findByEstado(EstadoAnalisis.valueOf(estado.toUpperCase()));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // Genera los datos agregados para la pantalla de inicio del usuario
    public java.util.Map<String, Object> obtenerResumenDashboard(String username) {
        Usuario usuario = usuarioRepository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Analisis> todos = analisisRepository.findByUsuario(usuario);
        
        // Obtenemos los 10 análisis más recientes para mostrar actividad
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
        resumen.put("activos", activos);
        
        // Calculamos el rendimiento simulado del mes actual
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

    // Añade o quita un voto (like) de un usuario a una publicación
    @Transactional
    public void alternarVoto(Long analisisId, String username) {
        Analisis analisis = obtenerPorId(analisisId);
        Usuario usuario = usuarioService.obtenerPorNombre(username);

        Optional<Voto> votoExistente = votoRepository.findByUsuarioAndAnalisis(usuario, analisis);

        if (votoExistente.isPresent()) {
            votoRepository.delete(votoExistente.get()); // Si ya existía, lo quitamos (unlike)
        } else {
            Voto nuevoVoto = new Voto();
            nuevoVoto.setUsuario(usuario);
            nuevoVoto.setAnalisis(analisis);
            votoRepository.save(nuevoVoto); // Si no existía, lo añadimos (like)
            
            // Notificar al autor del análisis
            Usuario autor = analisis.getUsuario();
            // Solo notificamos si el que da el like no es el propio autor
            if (autor != null && !autor.getUsuario().equals(username)) {
                notificacionService.crearNotificacion(
                    autor, 
                    "@" + username + " ha reaccionado a tu análisis sobre " + analisis.getActivo().getNombre(),
                    "/comunidad?analisis=" + analisis.getIdentificador(),
                    usuario
                );
            }
        }
    }
}