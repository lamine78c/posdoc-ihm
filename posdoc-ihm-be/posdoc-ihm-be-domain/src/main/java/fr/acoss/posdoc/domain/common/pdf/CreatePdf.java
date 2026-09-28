package fr.acoss.posdoc.domain.common.pdf;

import com.itextpdf.text.*;
import com.itextpdf.text.log.Logger;
import com.itextpdf.text.log.LoggerFactory;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.types.Systeme;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.Arrays;
import java.util.List;

public class CreatePdf {

    //TODO voir avec l'équipe si il faut supprimer cette class ?

    private static final Logger LOGGER = LoggerFactory.getLogger(CreatePdf.class);

    public static void main(String[] args)
    {

        List<String> headers = Arrays.asList("Code", "systeme", "libelle", "adresse", "test", "actf");
        List<Server> servers = Arrays.asList(new Server("cdfd", Systeme.LINUX, "lebsd", "124512212", true, true, false),
                new Server("cdfd", Systeme.LINUX, "lebsd", "124512212", true, true, false));
        Document document = new Document();
        try
        {
            PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream("HelloWorld.pdf"));
            document.open();

            Paragraph p = new Paragraph();
            p.add("Liste des Serveurs");
            p.setAlignment(Element.ALIGN_CENTER);
            document.add(p);

            document.add( Chunk.NEWLINE );

            createTable(document, headers, servers);

            document.close();
            writer.close();
        } catch (DocumentException de)
        {
            LOGGER.error(de.getMessage());
        } catch (FileNotFoundException fnfe)
        {
            LOGGER.error(fnfe.getMessage());
        }
    }

    public static void createTable(Document document, List<String> headers, List<Server> content) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.size());



        headers.forEach(e -> {
            PdfPCell c1 = new PdfPCell(new Phrase(e));
            c1.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(c1);
        });


        content.forEach(e -> {
            table.addCell(e.getCode());
            table.addCell(e.getSysteme().toString());
            table.addCell(e.getLibelle());
            table.addCell(e.getAdresseIp());
            table.addCell(e.getTeste() ? "Testé" :"-");
            table.addCell(e.getActif() ? "Actif" : "Inactif");
        });
        document.add(table);
    }

}
