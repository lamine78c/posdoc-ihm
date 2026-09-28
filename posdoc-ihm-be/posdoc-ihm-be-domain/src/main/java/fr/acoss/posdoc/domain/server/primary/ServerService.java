package fr.acoss.posdoc.domain.server.primary;

import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.log.Logger;
import com.itextpdf.text.log.LoggerFactory;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.server.validators.ServerValidators.adresseIpValidator;
import static fr.acoss.posdoc.domain.server.validators.ServerValidators.codeValidator;
import static fr.acoss.posdoc.domain.server.validators.ServerValidators.libelleValidator;

public class ServerService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServerService.class);
    public static final String ACTIF = "actif";
    public static final String SERVER = "Server";
    public static final String TESTE = "teste";
    public static final String SYSTEME = "systeme";
    public static final String RESSOURCE = "Ressource";

    private final ServerPersistence serverPersistence;
    private final RessourcePersistence ressourcePersistence;

    public ServerService(
            final ServerPersistence serverPersistence,
            final RessourcePersistence ressourcePersistence
    ) {
        this.serverPersistence = serverPersistence;
        this.ressourcePersistence = ressourcePersistence;
    }

    public Server createServer(final Server server) {

        codeValidator().validate(server.getCode());
        libelleValidator().validate(server.getLibelle());
        adresseIpValidator().validate(server.getAdresseIp());

        objectNotNullOrThrow(ACTIF).validate(server.getActif());
        objectNotNullOrThrow(TESTE).validate(server.getTeste());
        objectNotNullOrThrow(SYSTEME).validate(server.getSysteme());

        if (serverPersistence.exists(server.getCode())) {
            throw new AlreadyExistingElement(SERVER, server.getCode());
        }

        return serverPersistence.create(server);
    }

    public Server updateServer(final Server server) {

        codeValidator().validate(server.getCode());
        libelleValidator().validate(server.getLibelle());
        adresseIpValidator().validate(server.getAdresseIp());

        objectNotNullOrThrow(ACTIF).validate(server.getActif());
        objectNotNullOrThrow(TESTE).validate(server.getTeste());
        objectNotNullOrThrow(SYSTEME).validate(server.getSysteme());

        if (!serverPersistence.exists(server.getCode())) {
            throw new ElementNotFoundException(SERVER, server.getCode());
        }

        return serverPersistence.create(server);
    }

    public void deleteServers(final String code) {
        serverPersistence.delete(code);
    }

    public void deleteServers(List<String> serverIds) {
        // vérification dépendance Ressource
        List<String> listRes = ressourcePersistence.serversExistsInRessources(serverIds);
        if (!listRes.isEmpty()) {
            throw new StileExistingElement(SERVER, serverIds, RESSOURCE);
        }
        serverPersistence.deleteAll(serverIds);
    }

    public List<Server> updateServers(List<Server> servers) {

        servers.forEach(e -> {
            codeValidator().validate(e.getCode());
            libelleValidator().validate(e.getLibelle());
            adresseIpValidator().validate(e.getAdresseIp());

            objectNotNullOrThrow(ACTIF).validate(e.getActif());
            objectNotNullOrThrow(TESTE).validate(e.getTeste());
            objectNotNullOrThrow(SYSTEME).validate(e.getSysteme());

            if (!serverPersistence.exists(e.getCode())) {
                throw new ElementNotFoundException(SERVER, e.getCode());
            }
        });

        return serverPersistence.updateAll(servers);
    }

    public List<Server> createServers(List<Server> servers) {

        servers.forEach(e -> {

            codeValidator().validate(e.getCode());
            libelleValidator().validate(e.getLibelle());
            adresseIpValidator().validate(e.getAdresseIp());

            objectNotNullOrThrow(ACTIF).validate(e.getActif());
            objectNotNullOrThrow(TESTE).validate(e.getTeste());
            objectNotNullOrThrow(SYSTEME).validate(e.getSysteme());

            if (serverPersistence.exists(e.getCode())) {
                throw new AlreadyExistingElement(SERVER, e.getCode());
            }
        });

        return serverPersistence.updateAll(servers);
    }

    public byte[] createPdf() {
        var servers = serverPersistence.selectAll();
        return createPdfFile(servers);

    }

    //TODO voir si c'est utilisé
    private byte[] createPdfFile(List<Server> servers) {
        var headers = Arrays.asList("Code", "Systeme", "Libelle", "adresse", "Test", "Actf");

        Document document = new Document();
        try {

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Paragraph p = new Paragraph();
            p.add("Liste des Serveurs");
            p.setAlignment(Element.ALIGN_CENTER);
            document.add(p);

            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(headers.size());


            headers.forEach(e -> {
                PdfPCell c1 = new PdfPCell(new Phrase(e));
                c1.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(c1);
            });

            servers.forEach(e -> {
                table.addCell(e.getCode());
                table.addCell(e.getSysteme().toString());
                table.addCell(e.getLibelle());
                table.addCell(e.getAdresseIp());
                table.addCell(e.getTeste() ? "Testé" : "-");
                table.addCell(e.getActif() ? "Actif" : "Inactif");
            });
            document.add(table);

            document.close();
            writer.close();

            return out.toByteArray();

        } catch (DocumentException e) {
            LOGGER.error("Erreur de création du PDF {} ",e);
        }
        return new byte[0];
    }


}

