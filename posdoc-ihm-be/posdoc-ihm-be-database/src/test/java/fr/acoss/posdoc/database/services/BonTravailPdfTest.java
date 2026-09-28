package fr.acoss.posdoc.database.services;

import com.github.tomakehurst.wiremock.WireMockServer;
import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailPdfInput;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.FileStorageException;
import org.apache.commons.codec.binary.Base64;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TestApplication.class)
@ActiveProfiles("test")
class BonTravailPdfTest {

    @Autowired
    private BonTravailPersistenceImpl bonTravailPersistenceImpl;

    @Autowired
    private ConfigurableEnvironment environment;

    private static WireMockServer wireMockServer;

    @TempDir
    Path tempDir;

    @BeforeAll
    static void setUp() {
        wireMockServer = new WireMockServer(options().port(8089));
        wireMockServer.start();
    }

    @AfterAll
    static void tearDown() {
        if (wireMockServer != null && wireMockServer.isRunning()) {
            wireMockServer.stop();
        }
    }

    private void setTestProperties(Map<String, Object> properties) {
        environment.getPropertySources().addFirst(new MapPropertySource("test", properties));
    }

    private void clearTestProperties() {
        environment.getPropertySources().remove("test");
    }

    // Tests avec fichiers sur le partage
    @Test
    void getBonTravailPdf_withLocalFile_manual_returnsBase64() throws IOException {
        setTestProperties(Map.of("bon-travail.directory", tempDir.toString()));

        Path pdfFile = tempDir.resolve("p_117_snv2_241224-a0_00_ad04_l00.pdf");
        byte[] pdfContent = "Test PDF content manuel".getBytes();
        Files.write(pdfFile, pdfContent);

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(true);
        input.setCodenv("P");
        input.setCodorg("117");
        input.setCodapp("SNV2");
        input.setPercod("241224-A0");
        input.setNumcom("00");
        input.setCodcom("AD04");
        input.setCodfic("L00");

        String result = bonTravailPersistenceImpl.getBonTravailPdf(input);

        assertNotNull(result);
        assertEquals(Base64.encodeBase64String(pdfContent), result);

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_withLocalFile_standard_returnsBase64() throws IOException {
        setTestProperties(Map.of("bon-travail.directory", tempDir.toString()));

        Path pdfFile = tempDir.resolve("BDT_25123456.pdf");
        byte[] pdfContent = "Test PDF content standard".getBytes();
        Files.write(pdfFile, pdfContent);

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        String result = bonTravailPersistenceImpl.getBonTravailPdf(input);

        assertNotNull(result);
        assertEquals(Base64.encodeBase64String(pdfContent), result);

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_withLocalFileNotFound_throwsException() {
        setTestProperties(Map.of("bon-travail.directory", tempDir.toString()));

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(true);
        input.setCodenv("P");
        input.setCodorg("117");
        input.setCodapp("SNV2");
        input.setPercod("241224-A0");
        input.setNumcom("00");
        input.setCodcom("AD04");
        input.setCodfic("L00");

        ElementNotFoundException exception = assertThrows(ElementNotFoundException.class, () -> {
            bonTravailPersistenceImpl.getBonTravailPdf(input);
        });

        assertTrue(exception.getMessage().contains("n'a pas été trouvé dans le répertoire"));

        clearTestProperties();
    }

    // Tests avec serveur Adelaide (WireMock)
    @Test
    void getBonTravailPdf_withAdelaideServer_returnsBase64() {
        setTestProperties(Map.of(
            "adelaide-server.host", "localhost:8089"
        ));

        byte[] pdfContent = "Test PDF from Adelaide".getBytes();

        wireMockServer.stubFor(get(urlEqualTo("/Export/BDT_25123456.pdf"))
            .willReturn(aResponse()
                .withStatus(200)
                .withBody(pdfContent)));

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        String result = bonTravailPersistenceImpl.getBonTravailPdf(input);

        assertNotNull(result);
        assertEquals(Base64.encodeBase64String(pdfContent), result);

        wireMockServer.verify(getRequestedFor(urlEqualTo("/Export/BDT_25123456.pdf")));

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_withAdelaideNotFound_throwsException() {
        setTestProperties(Map.of(
            "adelaide-server.host", "localhost:8089"
        ));

        wireMockServer.stubFor(get(urlEqualTo("/Export/BDT_25123456.pdf"))
            .willReturn(aResponse()
                .withStatus(404)));

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        assertThrows(Exception.class, () -> {
            bonTravailPersistenceImpl.getBonTravailPdf(input);
        });

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_withAdelaideEmptyResponse_throwsException() {
        setTestProperties(Map.of(
            "adelaide-server.host", "localhost:8089"
        ));

        wireMockServer.stubFor(get(urlEqualTo("/Export/BDT_25123456.pdf"))
            .willReturn(aResponse()
                .withStatus(200)
                .withBody(new byte[0])));

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        ElementNotFoundException exception = assertThrows(ElementNotFoundException.class, () -> {
            bonTravailPersistenceImpl.getBonTravailPdf(input);
        });

        assertTrue(exception.getMessage().contains("n'a pas été trouvé sur le serveur Adelaide"));

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_withAdelaideNotConfigured_throwsException() {
        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        FileStorageException exception = assertThrows(FileStorageException.class, () -> {
            bonTravailPersistenceImpl.getBonTravailPdf(input);
        });

        assertTrue(exception.getMessage().contains("Le serveur Adelaide n'est pas configuré"));
    }

    @Test
    void getBonTravailPdf_withAdelaideEmptyHost_throwsException() {
        setTestProperties(Map.of(
            "adelaide-server.host", ""
        ));

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        FileStorageException exception = assertThrows(FileStorageException.class, () -> {
            bonTravailPersistenceImpl.getBonTravailPdf(input);
        });

        assertTrue(exception.getMessage().contains("Le serveur Adelaide n'est pas configuré"));

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_buildFileName_manual_withUpperCase() throws IOException {
        setTestProperties(Map.of("bon-travail.directory", tempDir.toString()));

        Path pdfFile = tempDir.resolve("t_750_snv2_240523-00_00_rdeh_l02.pdf");
        byte[] pdfContent = "Test PDF with uppercase input".getBytes();
        Files.write(pdfFile, pdfContent);

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(true);
        input.setCodenv("T");
        input.setCodorg("750");
        input.setCodapp("SNV2");
        input.setPercod("240523-00");
        input.setNumcom("00");
        input.setCodcom("RDEH");
        input.setCodfic("L02");

        String result = bonTravailPersistenceImpl.getBonTravailPdf(input);

        assertNotNull(result);
        assertEquals(Base64.encodeBase64String(pdfContent), result);

        clearTestProperties();
    }

    @Test
    void getBonTravailPdf_buildFileName_standard_withDash() throws IOException {
        setTestProperties(Map.of("bon-travail.directory", tempDir.toString()));

        Path pdfFile = tempDir.resolve("BDT_25123456.pdf");
        byte[] pdfContent = "Test PDF standard with dash".getBytes();
        Files.write(pdfFile, pdfContent);

        BonTravailPdfInput input = new BonTravailPdfInput();
        input.setIsManuel(false);
        input.setCodbon("25-123456");

        String result = bonTravailPersistenceImpl.getBonTravailPdf(input);

        assertNotNull(result);
        assertEquals(Base64.encodeBase64String(pdfContent), result);

        clearTestProperties();
    }
}
