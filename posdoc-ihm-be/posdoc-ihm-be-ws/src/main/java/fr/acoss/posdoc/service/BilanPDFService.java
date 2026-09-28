package fr.acoss.posdoc.service;

import fr.acoss.posdoc.domain.massification.model.BilanData;
import fr.acoss.posdoc.domain.message.model.ExpMassification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;

/**
 * Service pour générer et archiver les bilans PDF
 */
@Service
@Slf4j
public class BilanPDFService {

    private final PDFBilanGenerationService pdfGenerationService;

    @Value("${posdoc.bilan.archive-directory:}")
    private String archiveDirectory;

    public BilanPDFService(PDFBilanGenerationService pdfGenerationService) {
        this.pdfGenerationService = pdfGenerationService;
    }

    /**
     * Génère et archive un bilan PDF pour une massification ou simulation
     *
     * @param massifications Liste des massifications
     * @param type Type de bilan ("massification" ou "simulation")
     * @return Le PDF en base64, ou null en cas d'erreur
     */
    public String generateAndSaveBilan(List<ExpMassification> massifications, String type) {
        if (massifications == null || massifications.isEmpty()) {
            log.warn("Aucune massification fournie pour générer le bilan");
            return null;
        }

        try {
            ExpMassification first = massifications.get(0);

            if (first.getBilanItems() == null || first.getBilanItems().isEmpty()) {
                log.warn("Aucune donnée de bilan fournie par le frontend");
                return null;
            }

            log.info("Génération du bilan PDF avec {} items", first.getBilanItems().size());
            BilanData bilanData = extractBilanDataFromFrontend(first, type);
            return generateAndArchivePDF(bilanData, type);

        } catch (Exception e) {
            log.error("Erreur lors de la génération du bilan PDF: {}", e.getMessage(), e);
            // Ne pas faire échouer la massification si le PDF échoue
            return null;
        }
    }

    /**
     * Génère et archive le PDF
     *
     * @return Le PDF en base64
     */
    private String generateAndArchivePDF(BilanData bilanData, String type) {
        byte[] pdfBytes = pdfGenerationService.generateBilanPDF(bilanData);
        String filename = buildFilename(bilanData, type);

        log.info("Bilan PDF généré : {}", filename);

        archivePDF(pdfBytes, filename);

        return Base64.getEncoder().encodeToString(pdfBytes);
    }

    /**
     * Archive le PDF dans le répertoire configuré
     */
    private void archivePDF(byte[] pdfBytes, String filename) {
        if (archiveDirectory == null || archiveDirectory.trim().isEmpty()) {
            log.debug("Aucun répertoire d'archivage configuré, le PDF ne sera pas archivé");
            return;
        }

        try {
            Path archivePath = Paths.get(archiveDirectory);

            if (!Files.exists(archivePath)) {
                Files.createDirectories(archivePath);
                log.info("Répertoire d'archivage créé : {}", archivePath);
            }

            Path pdfFile = archivePath.resolve(filename);
            Files.write(pdfFile, pdfBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            log.info("Bilan PDF archivé : {}", pdfFile.toAbsolutePath());
        } catch (IOException e) {
            log.error("Erreur lors de l'archivage du PDF dans {}: {}", archiveDirectory, e.getMessage(), e);
        }
    }

    /**
     * Extrait les données du bilan directement depuis le frontend
     */
    private BilanData extractBilanDataFromFrontend(ExpMassification massification, String type) {
        BilanData.BilanItem firstItem = massification.getBilanItems().get(0);

        return BilanData.builder()
                .type(type)
                .items(massification.getBilanItems())
                .codenv(massification.getCodEnv())
                .codorg(massification.getCodOrg())
                .codsit(firstItem.getCodsit())
                .percod(massification.getPerCod())
                .mascom(firstItem.getMascom())
                .masfic(firstItem.getMasfic())
                .libfic(firstItem.getLibfic())
                .masuti(firstItem.getMasuti())
                .build();
    }

    /**
     * Construit le nom du fichier PDF
     */
    private String buildFilename(BilanData bilanData, String type) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        return String.format("bilan_%s_%s_%s_%s_%s.pdf",
                type,
                bilanData.getCodsit() != null ? bilanData.getCodsit() : "SITE",
                bilanData.getCodenv() != null ? bilanData.getCodenv() : "ENV",
                bilanData.getCodorg() != null ? bilanData.getCodorg() : "ORG",
                timestamp);
    }
}
