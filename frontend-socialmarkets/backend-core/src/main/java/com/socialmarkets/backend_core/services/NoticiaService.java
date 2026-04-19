package com.socialmarkets.backend_core.services;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.socialmarkets.backend_core.entities.Noticia;
import com.socialmarkets.backend_core.repositories.NoticiaRepository;

@Service
public class NoticiaService {

    @Autowired
    private NoticiaRepository noticiaRepository;

    public Noticia registrarNoticia(Noticia noticia) {
        if (noticia.getFecha() == null) {
            noticia.setFecha(LocalDateTime.now());
        }
        return noticiaRepository.save(noticia);
    }

    public List<Noticia> obtenerUltimasNoticias() {
        return noticiaRepository.findAllByOrderByFechaDesc();
    }
}