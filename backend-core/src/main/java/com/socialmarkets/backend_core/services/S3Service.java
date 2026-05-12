package com.socialmarkets.backend_core.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

/**
 * Servicio para gestionar la subida de archivos (imágenes) a la nube de Amazon (AWS S3)
 */
@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    // Sube un archivo a S3 y devuelve la URL pública para poder visualizarlo
    public String subirArchivo(MultipartFile archivo) throws IOException {
        // Generamos un nombre único para el archivo para evitar que se sobrescriban
        String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();

        // Configuramos la petición de subida
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(nombreArchivo)
                .contentType(archivo.getContentType())
                .build();

        // Enviamos el archivo a AWS
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(archivo.getInputStream(), archivo.getSize()));

        // Devolvemos la dirección web (URL) del archivo recién subido
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, nombreArchivo);
    }
}
