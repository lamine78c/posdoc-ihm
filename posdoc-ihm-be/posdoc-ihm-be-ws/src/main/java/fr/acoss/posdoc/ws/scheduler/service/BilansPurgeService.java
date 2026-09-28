package fr.acoss.posdoc.ws.scheduler.service;

import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import fr.acoss.posdoc.ws.scheduler.service.AbstractLockedJobRunner;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.UnknownHostException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileTime;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.stream.Stream;

import static fr.acoss.posdoc.common.util.StringUtils.PDF_EXTENSION;

/**
 * Service de purge automatique des bilans de massification obsolètes.
 *
 * Ce service supprime les fichiers de bilans plus anciens que la période de rétention configurée.
 * L'exécution est déclenchée par BilansPurgeJob.
 *
 * @author Lamine CAMARA
 * @since 24-03-2026
 */
@Service
@Slf4j
public class BilansPurgeService extends AbstractLockedJobRunner {

    private static final ZoneId DEFAULT_ZONE_ID = ZoneId.systemDefault();
    private static final String NAME_PURGE_BILAN = "PURGE_BILAN";

    private final String bilansDirectory;
    private final int retentionDays;
    private final boolean purgeEnabled;
    private final boolean dryRun;
    private final int daysLocked;

    /**
     * Constructeur avec injection de dépendances.
     *
     * @param jobLockService Service de gestion des verrous
     * @param bilansDirectory Répertoire des bilans
     * @param retentionDays Durée de rétention en jours
     * @param purgeEnabled Active/désactive la purge
     * @param dryRun Mode simulation
     * @param daysLocked Durée de rétention des verrous en jours
     */
    public BilansPurgeService(
            final JobLockService jobLockService,
            @Value("${posdoc.bilan.archive-directory:/hawai/data/partage/posdoc/bilans}") String bilansDirectory,
            @Value("${posdoc.bilan.retention-days:90}") int retentionDays,
            @Value("${posdoc.bilan.purge.enabled:true}") boolean purgeEnabled,
            @Value("${posdoc.bilan.purge.dry-run:false}") boolean dryRun,
            @Value("${posdoc.bilan.purge.lock-retention-days:1}") int daysLocked) {
        super(jobLockService);
        this.bilansDirectory = bilansDirectory;
        this.retentionDays = retentionDays;
        this.purgeEnabled = purgeEnabled;
        this.dryRun = dryRun;
        this.daysLocked = daysLocked;
    }

    /**
     * Exécute la purge des bilans avec gestion du verrou distribué.
     * Appelée par BilansPurgeJob.
     *
     * @throws UnknownHostException si le nom d'hôte ne peut pas être déterminé
     */
    public void purge() throws UnknownHostException {
        if (!purgeEnabled) {
            log.debug("Purge des bilans désactivée via configuration");
            return;
        }

        this.runLockedJob(NAME_PURGE_BILAN, daysLocked);
    }

    /**
     * Exécute la purge des bilans (méthode abstraite implémentée).
     */
    @Override
    protected void runJob() {
        logPurgeStart();

        Path bilansPath = validateAndGetBilansPath();
        if (bilansPath == null) {
            return;
        }

        try {
            PurgeResult result = executePurge(bilansPath);
            logPurgeResult(result);
        } catch (Exception e) {
            log.error("Erreur lors de la purge des bilans", e);
        }

        log.info("Fin de la purge des bilans");
    }

    /**
     * Affiche les informations de démarrage de la purge.
     */
    private void logPurgeStart() {
        log.info("Début de la purge des bilans");
        log.info("Répertoire : {}", bilansDirectory);
        log.info("Rétention : {} jours", retentionDays);
        log.info("Mode dry-run : {}", dryRun);
    }

    /**
     * Valide le répertoire des bilans et retourne le Path si valide.
     *
     * @return Path du répertoire ou null si invalide
     */
    private Path validateAndGetBilansPath() {
        if (!isDirectoryConfigured()) {
            log.error("Le répertoire de bilans n'est pas configuré (posdoc.bilan.archive-directory)");
            return null;
        }

        Path bilansPath = Paths.get(bilansDirectory);

        if (!isDirectoryValid(bilansPath)) {
            return null;
        }

        return bilansPath;
    }

    /**
     * Vérifie si le répertoire est configuré.
     *
     * @return true si configuré, false sinon
     */
    private boolean isDirectoryConfigured() {
        return bilansDirectory != null && !bilansDirectory.trim().isEmpty();
    }

    /**
     * Vérifie si le répertoire existe et est valide.
     *
     * @param path Chemin du répertoire
     * @return true si valide, false sinon
     */
    private boolean isDirectoryValid(Path path) {
        if (!Files.exists(path)) {
            log.error("Le répertoire {} n'existe pas", bilansDirectory);
            return false;
        }

        if (!Files.isDirectory(path)) {
            log.error("{} n'est pas un répertoire", bilansDirectory);
            return false;
        }

        return true;
    }

    /**
     * Exécute la purge des fichiers PDF obsolètes.
     *
     * @param bilansPath Chemin du répertoire des bilans
     * @return Résultat de la purge
     */
    private PurgeResult executePurge(Path bilansPath) {
        LocalDateTime cutoffDate = calculateCutoffDate();
        PurgeResult result = new PurgeResult();

        try {
            result.totalFiles = countFiles(bilansPath);
            log.info("Nombre total de fichiers PDF : {}", result.getTotalFiles());

            purgePdfFiles(bilansPath, cutoffDate, result);

            result.remainingFiles = countFiles(bilansPath);
        } catch (IOException e) {
            log.error("Erreur lors du parcours du répertoire {}", bilansPath, e);
        }

        return result;
    }

    /**
     * Purge les fichiers PDF du répertoire.
     *
     * @param directory Répertoire contenant les bilans
     * @param cutoffDate Date limite (fichiers plus anciens seront supprimés)
     * @param result Résultat accumulateur
     */
    private void purgePdfFiles(Path directory, LocalDateTime cutoffDate, PurgeResult result) throws IOException {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory, "*.pdf")) {
            for (Path file : stream) {
                if (Files.isRegularFile(file)) {
                    processFile(file, cutoffDate, result);
                }
            }
        }
    }

    /**
     * Traite un fichier : vérifie s'il est obsolète et le supprime si nécessaire.
     *
     * @param file Fichier à traiter
     * @param cutoffDate Date limite
     * @param result Résultat accumulateur
     */
    private void processFile(Path file, LocalDateTime cutoffDate, PurgeResult result) {
        try {
            FileTime lastModifiedTime = Files.getLastModifiedTime(file);
            LocalDateTime fileDate = LocalDateTime.ofInstant(
                lastModifiedTime.toInstant(),
                DEFAULT_ZONE_ID
            );

            if (fileDate.isBefore(cutoffDate)) {
                if (dryRun) {
                    log.info("[DRY-RUN] Fichier à supprimer : {} (modifié: {})", file, fileDate);
                    result.deletedCount++;
                } else {
                    deleteFile(file, fileDate, result);
                }
            }
        } catch (IOException e) {
            log.error("Erreur lors de la lecture des attributs du fichier : {}", file, e);
            result.failedCount++;
        }
    }

    /**
     * Supprime un fichier et met à jour les compteurs.
     *
     * @param file Fichier à supprimer
     * @param fileDate Date de modification du fichier
     * @param result Résultat accumulateur
     */
    private void deleteFile(Path file, LocalDateTime fileDate, PurgeResult result) {
        try {
            Files.delete(file);
            log.info("Supprimé : {} (modifié: {})", file, fileDate);
            result.deletedCount++;
        } catch (IOException e) {
            log.error("Erreur lors de la suppression : {}", file, e);
            result.failedCount++;
        }
    }

    /**
     * Compte le nombre de fichiers PDF dans le répertoire.
     *
     * @param directory Répertoire à analyser
     * @return Nombre de fichiers PDF
     */
    private long countFiles(Path directory) throws IOException {
        try (Stream<Path> files = Files.list(directory)) {
            return files.filter(path -> path.toString().endsWith(PDF_EXTENSION)).count();
        }
    }

    /**
     * Log le résultat de la purge.
     *
     * @param result Résultat de la purge
     */
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

    /**
     * Calcule la date de cutoff pour la purge.
     * Retourne minuit du jour il y a X jours (X = retentionDays).
     *
     * @return Date de cutoff
     */
    private LocalDateTime calculateCutoffDate() {
        LocalDate cutoffDay = LocalDate.now().minusDays(retentionDays);
        return LocalDateTime.of(cutoffDay, LocalTime.MIDNIGHT);
    }

    /**
     * Classe interne pour stocker les résultats de la purge.
     */
    @Getter
    private static class PurgeResult {
        private long totalFiles = 0;
        private int deletedCount = 0;
        private int failedCount = 0;
        private long remainingFiles = 0;
    }
}
