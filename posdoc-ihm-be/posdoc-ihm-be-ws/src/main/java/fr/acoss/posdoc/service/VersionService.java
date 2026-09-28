package fr.acoss.posdoc.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;


public class VersionService {

    private static final Logger LOGGER = LoggerFactory.getLogger(VersionService.class);
    private static Properties instance = null;

    private VersionService() {
    }

    public static Properties getProperties() {
        if (instance == null) {
            instance = loadProperties();
        }
        return instance;
    }

    private static Properties loadProperties() {
        Properties properties = new Properties();
        try (InputStream inputStream = VersionService.class.getClassLoader().getResourceAsStream("version.properties")) {
            if (LOGGER.isInfoEnabled()) {
                LOGGER.info("Load fichier version.properties");
            }
            properties.load(inputStream);
        } catch (IOException ioe) {
            LOGGER.error(ioe.getMessage());
        }
        return properties;
    }

}
