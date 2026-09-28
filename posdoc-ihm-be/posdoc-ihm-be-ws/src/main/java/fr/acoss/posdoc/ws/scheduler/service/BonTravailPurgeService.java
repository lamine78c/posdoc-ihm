package fr.acoss.posdoc.ws.scheduler.service;

import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.UnknownHostException;
import java.nio.file.*;
import java.nio.file.attribute.FileTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.stream.Stream;

import static fr.acoss.posdoc.common.util.StringUtils.PDF_EXTENSION;

@Service
@Slf4j
public class BonTravailPurgeService extends AbstractLockedJobRunner {

    private static final ZoneId DEFAULT_ZONE_ID = ZoneId.systemDefault();
    private static final String NAME_PURGE_BON_TRAVAIL = "PURGE_BON_TRAVAIL";

    private final String bonTravailDirectory;
    private final int retentionDays;
    private final boolean purgeEnabled;
    private final boolean dryRun;
    private final int daysLocked;

    public BonTravailPurgeService(
            final JobLockService jobLockService,
            @Value("${posdoc.bontravail.archive-directory}") String bonTravailDirectory,
            @Value("${posdoc.bontravail.retention-days}") int retentionDays,
            @Value("${posdoc.bontravail.purge.enabled}") boolean purgeEnabled,
            @Value("${posdoc.bontravail.purge.dry-run}") boolean dryRun,
            @Value("${posdoc.bontravail.purge.lock-retention-days}") int daysLocked) {
        super(jobLockService);
        this.bonTravailDirectory = bonTravailDirectory;
        this.retentionDays = retentionDays;
        this.purgeEnabled = purgeEnabled;
        this.dryRun = dryRun;
        this.daysLocked = daysLocked;
    }

    public void purge() throws UnknownHostException {
        if (!purgeEnabled) {
            log.debug("Purge des bons de travail désactivée via configuration");
            return;
        }
        this.runLockedJob(NAME_PURGE_BON_TRAVAIL, daysLocked);
    }

    @Override
    protected void runJob() {
        log.info("Début de la purge des bons de travail");
        log.info("Répertoire : {}", bonTravailDirectory);
        log.info("Rétention : {} jours", retentionDays);
        log.info("Mode dry-run : {}", dryRun);

        Path bwPath = validateAndGetBwPath();
        if (bwPath == null) return;

        try {
            PurgeResult result = executePurge(bwPath);
            logPurgeResult(result);
        } catch (Exception e) {
            log.error("Erreur lors de la purge des bons de travail", e);
        }
        log.info("Fin de la purge des bons de travail");
    }

    private Path validateAndGetBwPath() {
        if (bonTravailDirectory == null || bonTravailDirectory.trim().isEmpty()) {
            log.error("Le répertoire de bons de travail n'est pas configuré");
            return null;
        }
        Path path = Paths.get(bonTravailDirectory);
        if (!Files.exists(path) || !Files.isDirectory(path)) {
            log.error("Le répertoire {} n'existe pas ou n'est pas un dossier", bonTravailDirectory);
            return null;
        }
        return path;
    }

    private PurgeResult executePurge(Path bwPath) {
        LocalDateTime cutoffDate = calculateCutoffDate();
        PurgeResult result = new PurgeResult();
        try {
            result.totalFiles = countFiles(bwPath);
            log.info("Nombre total de fichiers PDF : {}", result.getTotalFiles());
            purgePdfFiles(bwPath, cutoffDate, result);
            result.remainingFiles = countFiles(bwPath);
        } catch (IOException e) {
            log.error("Erreur lors du parcours du répertoire {}", bwPath, e);
        }
        return result;
    }

    private void purgePdfFiles(Path directory, LocalDateTime cutoffDate, PurgeResult result) throws IOException {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory, "*.pdf")) {
            for (Path file : stream) {
                if (Files.isRegularFile(file)) processFile(file, cutoffDate, result);
            }
        }
    }

    private void processFile(Path file, LocalDateTime cutoffDate, PurgeResult result) {
        try {
            FileTime lastModifiedTime = Files.getLastModifiedTime(file);
            LocalDateTime fileDate = LocalDateTime.ofInstant(lastModifiedTime.toInstant(), DEFAULT_ZONE_ID);
            if (fileDate.isBefore(cutoffDate)) {
                if (dryRun) {
                    log.info("[DRY-RUN] Fichier à supprimer : {} (modifié: {})", file, fileDate);
                    result.deletedCount++;
                } else {
                    deleteFile(file, fileDate, result);
                }
            }
        } catch (IOException e) {
            log.error("Erreur lecture attributs fichier : {}", file, e);
            result.failedCount++;
        }
    }

    private void deleteFile(Path file, LocalDateTime fileDate, PurgeResult result) {
        try {
            Files.delete(file);
            log.info("Supprimé : {} (modifié: {})", file, fileDate);
            result.deletedCount++;
        } catch (IOException e) {
            log.error("Erreur suppression : {}", file, e);
            result.failedCount++;
        }
    }

    private long countFiles(Path directory) throws IOException {
        try (Stream<Path> files = Files.list(directory)) {
            return files.filter(p -> p.toString().endsWith(PDF_EXTENSION)).count();
        }
    }

    private LocalDateTime calculateCutoffDate() {
        LocalDate cutoffDay = LocalDate.now().minusDays(retentionDays);
        return LocalDateTime.of(cutoffDay, LocalTime.MIDNIGHT);
    }

    private void logPurgeResult(PurgeResult result) {
        log.info("Purge terminée");
        if (dryRun) {
            log.info("Mode DRY-RUN : Aucune suppression effective");
            log.info("Fichiers qui auraient été supprimés : {}", result.getDeletedCount());
        } else {
            log.info("Fichiers supprimés : {}", result.getDeletedCount());
            log.info("Fichiers restants : {}", result.getRemainingFiles());
            if (result.getFailedCount() > 0) {
                log.warn("ATTENTION : {} fichier(s) n'ont pas pu être supprimés", result.getFailedCount());
            }
        }
    }

    @Getter
    private static class PurgeResult {
        private long totalFiles = 0;
        private int deletedCount = 0;
        private int failedCount = 0;
        private long remainingFiles = 0;
    }
}
