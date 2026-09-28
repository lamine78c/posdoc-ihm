package fr.acoss.posdoc.ws;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
public class NoticeDirectoryInitializer implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger(NoticeDirectoryInitializer.class);

    @Value("${notices.directory}")
    private String noticesDirectory;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        File directory = new File(noticesDirectory);
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) {
                LOGGER.warn("Répertoire {} créé avec succès", noticesDirectory);
            } else {
                LOGGER.error("Echec de la création du répertoire {}", noticesDirectory);
            }
        } else {
            LOGGER.info("Le répertoire {} existe déjà", noticesDirectory);
        }
    }
}
