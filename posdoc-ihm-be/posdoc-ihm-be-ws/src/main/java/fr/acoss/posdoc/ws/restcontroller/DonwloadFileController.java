package fr.acoss.posdoc.ws.restcontroller;

import fr.acoss.posdoc.domain.server.primary.ServerService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
public class DonwloadFileController {

    private final ServerService serverService;

    public DonwloadFileController(final ServerService serverService) {
        this.serverService = serverService;
    }

    @CrossOrigin(origins = "http://localhost:4200")
    @GetMapping("/serverspdf")
    ResponseEntity<InputStreamResource> getServersPDF() {

        String fileName = "servers-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        headers.add("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

        InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(serverService.createPdf()));

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

}
