package fr.acoss.posdoc.flyway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class FlywayCleaner {

    private static final String RELATIVE_SQL_PATH = "src/main/resources/db/migration";

    private static final Logger LOGGER = LoggerFactory.getLogger(FlywayCleaner.class);

    public static void main(String[] args) {

        if (args.length == 0) {
            LOGGER.error("Le chemin de base du module n'a pas été fourni. L'exécution via le POM est requise.");
            return;
        }

        String moduleBasePath = args[0];

        Path startPath = Paths.get(moduleBasePath, RELATIVE_SQL_PATH);

        if (!Files.exists(startPath)) {
            LOGGER.error("Erreur : Le dossier {} est introuvable.", startPath.toAbsolutePath());
            return;
        }

        try (Stream<Path> stream = Files.walk(startPath)) {
            stream.filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".sql"))
                    .filter(path -> !path.getFileName().toString().startsWith("V"))
                    .forEach(FlywayCleaner::processFile);
            LOGGER.info("Traitement terminé des fichiers de migration");
        } catch (IOException e) {
            LOGGER.error(e.getMessage());
        }
    }

    private static void processFile(Path filePath) {

        try {
            modifyFileContent(filePath);
        } catch (IOException e) {
            LOGGER.error("Erreur lors de la modification du contenu de {} : {}", filePath.getFileName(), e.getMessage());
            return;
        }

        Path parentDir = filePath.getParent();
        String folderName = parentDir.getFileName().toString();
        String fileName = filePath.getFileName().toString();

        if (!folderName.startsWith("v") || folderName.length() < 2) {
            return;
        }

        String versionBase = folderName.substring(1);

        // Regex explication :
        // ^(\d+)   -> Capture le numéro au début (ex: 10)
        // [-_]     -> Le séparateur (tiret ou underscore)
        // (.+)     -> La description (ex: schema)
        // \.sql$   -> L'extension
        Pattern pattern = Pattern.compile("^(\\d+)[-_](.+)\\.sql$");
        Matcher matcher = pattern.matcher(fileName);

        if (matcher.find()) {
            String sequence = matcher.group(1);
            String description = matcher.group(2);

            description = description.replace("-", "_").replace(" ", "_");

            String newName = String.format("V%s.%s__%s.sql", versionBase, sequence, description);

            Path targetPath = parentDir.resolve(newName);

            try {
                Files.move(filePath, targetPath);
            } catch (IOException e) {
                LOGGER.error("Erreur lors du renommage de {} : {} ", fileName, e.getMessage());
            }
        }
    }

    private static void modifyFileContent(Path filePath) throws IOException {
        String content = Files.readString(filePath);
        String originalContent = content;

        content = content.replace("pgposdoc", "user_e2e");

        content = content.replace("postgres", "user_e2e");

        content = content.replace("CREATE INDEX CONCURRENTLY", "CREATE INDEX");

        content = content.replace("${}", "$${}");

        if (!content.equals(originalContent)) {
            Files.writeString(filePath, content);
        }
    }
}