package fr.acoss.posdoc.service;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import fr.acoss.posdoc.domain.massification.model.BilanData;
import fr.acoss.posdoc.exceptions.PDFGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service pour générer les bilans PDF de massification/simulation
 */
@Service
@Slf4j
public class PDFBilanGenerationService {

    // Couleur du thème URSSAF
    private static final DeviceRgb URSSAF_BLUE = new DeviceRgb(0, 133, 163);
    private static final DeviceRgb ROW_COLOR = new DeviceRgb(232, 250, 255);
    private static final String LOGO_PATH = "static/images/logo_urssaf_caisse_national.jpg";

    /**
     * Génère un PDF de bilan
     *
     * @param bilanData Les données du bilan
     * @return Le PDF sous forme de tableau de bytes
     * @throws PDFGenerationException si une erreur survient lors de la génération du PDF
     */
    public byte[] generateBilanPDF(BilanData bilanData) {
        log.info("Génération du bilan PDF pour type: {}", bilanData.getType());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfDocument pdfDocument = createPdfDocument(baos);
            Document document = new Document(pdfDocument);

            addHeader(document);
            addTitles(document, bilanData);
            addDataTable(document, bilanData);

            document.close();

            log.info("Bilan PDF généré avec succès, taille: {} bytes", baos.size());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Erreur lors de la génération du PDF", e);
            throw new PDFGenerationException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Crée le document PDF avec les paramètres de base
     */
    private PdfDocument createPdfDocument(ByteArrayOutputStream baos) {
        PdfWriter writer = new PdfWriter(baos);
        writer.setCompressionLevel(0); // Désactiver la compression pour une meilleure qualité
        PdfDocument pdfDocument = new PdfDocument(writer);
        pdfDocument.setDefaultPageSize(PageSize.A4);
        return pdfDocument;
    }

    /**
     * Ajoute l'en-tête du document (logo et date)
     */
    private void addHeader(Document document) {
        Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}));
        headerTable.setWidth(UnitValue.createPercentValue(100));

        headerTable.addCell(createLogoCell());
        headerTable.addCell(createDateCell());

        document.add(headerTable);
    }

    /**
     * Crée la cellule contenant le logo ou le texte URSSAF
     */
    private Cell createLogoCell() {
        Cell logoCell = new Cell();
        try (InputStream logoStream = getClass().getClassLoader().getResourceAsStream(LOGO_PATH)) {
            if (logoStream != null) {
                Image logo = new Image(ImageDataFactory.create(logoStream.readAllBytes()));
                logo.setWidth(120);
                logoCell.add(logo);
            } else {
                log.warn("Logo introuvable au chemin: {}", LOGO_PATH);
                logoCell.add(createUrssafTextParagraph());
            }
        } catch (Exception e) {
            log.warn("Impossible de charger le logo: {}", e.getMessage());
            logoCell.add(createUrssafTextParagraph());
        }
        logoCell.setBorder(null);
        return logoCell;
    }

    /**
     * Crée un paragraphe avec le texte "URSSAF"
     */
    private Paragraph createUrssafTextParagraph() {
        return new Paragraph("URSSAF")
                .setFontSize(16)
                .setBold()
                .setFontColor(URSSAF_BLUE);
    }

    /**
     * Crée la cellule contenant la date
     */
    private Cell createDateCell() {
        String currentDateTime = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
        return new Cell()
                .add(new Paragraph("Date: " + currentDateTime)
                        .setFontSize(12)
                        .setBold())
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(null);
    }

    /**
     * Ajoute les titres (titre principal et sous-titre)
     */
    private void addTitles(Document document, BilanData bilanData) {
        document.add(createTitleParagraph(bilanData));

        String subtitle = buildSubtitle(bilanData);
        if (subtitle != null && !subtitle.isEmpty()) {
            document.add(createSubtitleParagraph(subtitle));
        }
    }

    /**
     * Crée le paragraphe du titre principal
     */
    private Paragraph createTitleParagraph(BilanData bilanData) {
        String typeLabel = "massification".equals(bilanData.getType()) ? "massification" : "simulation";
        int nombreJobs = bilanData.getItems() != null ? bilanData.getItems().size() : 0;
        String title = String.format("%s - Bilan de la %s %s_%s_%s %s (%d jobs)",
                bilanData.getCodsit(), typeLabel, bilanData.getCodenv(), bilanData.getCodorg(),
                bilanData.getMascom(), bilanData.getPercod(), nombreJobs);

        return new Paragraph(title)
                .setFontSize(15)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);
    }

    /**
     * Crée le paragraphe du sous-titre
     */
    private Paragraph createSubtitleParagraph(String subtitle) {
        return new Paragraph(subtitle)
                .setFontSize(12)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(5);
    }

    /**
     * Ajoute le tableau de données avec les totaux
     */
    private void addDataTable(Document document, BilanData bilanData) {
        Table table = createDataTable();
        addTableHeaders(table);
        int[] totals = addTableRows(table, bilanData);
        addTableTotalRow(table, totals[0], totals[1]);
        document.add(table);
    }

    /**
     * Crée la structure du tableau de données
     */
    private Table createDataTable() {
        float[] columnWidths = {3, 2, 3, 2, 2, 2, 2};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setMarginTop(10);
        return table;
    }

    /**
     * Ajoute les en-têtes du tableau
     */
    private void addTableHeaders(Table table) {
        String[] headers = {"Application", "Période", "Fichier massifié", "Nombre pages", "Nombre de plis", "Numéro Bdt", "Client"};
        for (String header : headers) {
            Cell headerCell = new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(14))
                    .setBackgroundColor(ROW_COLOR)
                    .setTextAlignment(TextAlignment.CENTER);
            table.addHeaderCell(headerCell);
        }
    }

    /**
     * Ajoute les lignes de données au tableau
     * @return Un tableau contenant [totalPages, totalPlis]
     */
    private int[] addTableRows(Table table, BilanData bilanData) {
        int totalPages = 0;
        int totalPlis = 0;
        boolean alternate = false;

        if (bilanData.getItems() != null) {
            for (BilanData.BilanItem item : bilanData.getItems()) {
                DeviceRgb bgColor = alternate ? ROW_COLOR : null;
                alternate = !alternate;

                addItemRow(table, item, bgColor);

                totalPages += item.getPagFic() != null ? item.getPagFic() : 0;
                totalPlis += item.getPliFic() != null ? item.getPliFic() : 0;
            }
        }

        return new int[]{totalPages, totalPlis};
    }

    /**
     * Ajoute une ligne de données pour un item
     */
    private void addItemRow(Table table, BilanData.BilanItem item, DeviceRgb bgColor) {
        addCell(table, String.format("%s_%s_%s", item.getCodenv(), item.getCodorg(), item.getCodapp()),
                bgColor, TextAlignment.LEFT);
        addCell(table, item.getPercod() != null ? item.getPercod() : "",
                bgColor, TextAlignment.LEFT);
        addCell(table, String.format("%s_%s_%s", item.getCodcom(), item.getCodfic(), item.getNumcom()),
                bgColor, TextAlignment.LEFT);
        addCell(table, item.getPagFic() != null ? item.getPagFic().toString() : "0",
                bgColor, TextAlignment.RIGHT);
        addCell(table, item.getPliFic() != null ? item.getPliFic().toString() : "0",
                bgColor, TextAlignment.RIGHT);
        addCell(table, item.getCodbon() != null ? item.getCodbon() : "",
                bgColor, TextAlignment.LEFT);
        addCell(table, item.getCodcli() != null ? item.getCodcli() : "",
                bgColor, TextAlignment.LEFT);
    }

    /**
     * Ajoute la ligne de total au tableau
     */
    private void addTableTotalRow(Table table, int totalPages, int totalPlis) {
        addCell(table, "", null, TextAlignment.LEFT).setBold();
        addCell(table, "", null, TextAlignment.LEFT).setBold();
        addCell(table, "***Total***", null, TextAlignment.LEFT).setBold();
        addCell(table, String.valueOf(totalPages), null, TextAlignment.RIGHT).setBold();
        addCell(table, String.valueOf(totalPlis), null, TextAlignment.RIGHT).setBold();
        addCell(table, "", null, TextAlignment.LEFT).setBold();
        addCell(table, "", null, TextAlignment.LEFT).setBold();
    }

    private String buildSubtitle(BilanData bilanData) {
        String mascom = bilanData.getMascom() != null ? bilanData.getMascom() : "";
        String masfic = bilanData.getMasfic() != null ? bilanData.getMasfic() : "";
        String libfic = bilanData.getLibfic();
        String masuti = bilanData.getMasuti();

        StringBuilder subtitleInfo = new StringBuilder();
        if (libfic != null && !libfic.isEmpty() && masuti != null && !masuti.isEmpty()) {
            subtitleInfo.append(libfic).append(" - ").append(masuti);
        } else if (libfic != null && !libfic.isEmpty()) {
            subtitleInfo.append(libfic);
        } else if (masuti != null && !masuti.isEmpty()) {
            subtitleInfo.append(masuti);
        }

        String subtitle = "Fichier " + mascom + "-" + masfic;
        if (subtitleInfo.length() > 0) {
            subtitle += " (" + subtitleInfo + ")";
        }

        return subtitle;
    }

    private Cell addCell(Table table, String content, DeviceRgb backgroundColor, TextAlignment alignment) {
        Cell cell = new Cell().add(new Paragraph(content));
        if (backgroundColor != null) {
            cell.setBackgroundColor(backgroundColor);
        }
        if (alignment != null) {
            cell.setTextAlignment(alignment);
        }
        table.addCell(cell);
        return cell;
    }
}
