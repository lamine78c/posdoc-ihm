package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.PapaadRepository;
import fr.acoss.posdoc.database.entities.PapaadCompositeIdEntity;
import fr.acoss.posdoc.database.entities.PapaadEntity;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdatePapaadPayloadDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/papaad/insert-papaad.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/papaad/clean-papaad.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class PapaadResolverTest extends AbstractGraphqlTest {

    @Autowired
    private PapaadRepository papaadRepository;

    @BeforeEach
    void setUp() {
        Context context = new Context();
        context.setUser("testUser");
        context.setHost("127.0.0.1");
        ContextHolder.setContext(context);
    }

    @Test
    void get_all_papaads_should_return_all_records() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/papaad/all-papaads.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdatePapaadPayloadDTO> papaads = response.getList("$.data.allPapaads", CreateOrUpdatePapaadPayloadDTO.class);
        assertNotNull(papaads);
        assertTrue(papaads.size() >= 3);

        CreateOrUpdatePapaadPayloadDTO first = papaads.stream()
                .filter(p -> "COM1".equals(p.getCodeCommande())
                        && "FIC01".equals(p.getCodeFichier())
                        && "NOT1".equals(p.getCodeNotif()))
                .findFirst()
                .orElse(null);
        assertNotNull(first);
        assertEquals("Papaad Test 1", first.getLibelle());
    }

    @Test
    void create_papaad_should_add_new_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createInput = variables.putObject("createDTO");
        createInput.put("codeCommande", "COM1");
        createInput.put("codeFichier", "FIC04");
        createInput.put("codeNotif", "NOT4");
        createInput.put("libelle", "Nouveau Papaad");
        createInput.put("periode", false);
        createInput.put("codeRND", "RND4");
        createInput.put("appPro", "APP1");
        createInput.put("typeHas", "HAS4");
        createInput.put("format", "FMT4");
        createInput.put("nsTruc", false);
        createInput.put("imprime", false);
        createInput.put("huissier", false);
        createInput.put("numNot", false);
        createInput.put("strRaf", false);
        createInput.put("contrat", false);
        createInput.put("medele", false);
        createInput.put("idtbcc", false);

        final var response = graphQLTestTemplate.perform("graphql-requests/papaad/create-papaad.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdatePapaadPayloadDTO created = response.get("$.data.createPapaad", CreateOrUpdatePapaadPayloadDTO.class);
        assertNotNull(created);
        assertEquals("COM1", created.getCodeCommande());
        assertEquals("FIC04", created.getCodeFichier());
        assertEquals("NOT4", created.getCodeNotif());
        assertEquals("Nouveau Papaad", created.getLibelle());

        Optional<PapaadEntity> inDb = papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC04", "NOT4"));
        assertTrue(inDb.isPresent());
        assertEquals("Nouveau Papaad", inDb.get().getLibelle());
    }

    @Test
    void update_papaad_should_modify_existing_record() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var updateInput = variables.putObject("updateDTO");
        updateInput.put("codeCommande", "COM1");
        updateInput.put("codeFichier", "FIC01");
        updateInput.put("codeNotif", "NOT1");
        updateInput.put("libelle", "Papaad Test 1 - Modifié");
        updateInput.put("periode", true);
        updateInput.put("codeRND", "RND1");
        updateInput.put("appPro", "APP1");
        updateInput.put("typeHas", "HAS1");
        updateInput.put("format", "FMT1");
        updateInput.put("nsTruc", false);
        updateInput.put("imprime", false);
        updateInput.put("huissier", false);
        updateInput.put("numNot", false);
        updateInput.put("strRaf", false);
        updateInput.put("contrat", false);
        updateInput.put("medele", false);
        updateInput.put("idtbcc", false);

        final var response = graphQLTestTemplate.perform("graphql-requests/papaad/update-papaad.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdatePapaadPayloadDTO updated = response.get("$.data.updatePapaad", CreateOrUpdatePapaadPayloadDTO.class);
        assertNotNull(updated);
        assertEquals("COM1", updated.getCodeCommande());
        assertEquals("Papaad Test 1 - Modifié", updated.getLibelle());

        Optional<PapaadEntity> inDb = papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC01", "NOT1"));
        assertTrue(inDb.isPresent());
        assertEquals("Papaad Test 1 - Modifié", inDb.get().getLibelle());
    }

    @Test
    void delete_papaads_should_remove_records() throws IOException {
        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC02", "NOT2")).isPresent());
        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC03", "NOT3")).isPresent());

        final var variables = new ObjectMapper().createObjectNode();
        final var deleteInput = variables.putObject("deleteDTO");
        final var idsArray = deleteInput.putArray("ids");

        final var id1 = idsArray.addObject();
        id1.put("codeCommande", "COM1");
        id1.put("codeFichier", "FIC02");
        id1.put("codeNotif", "NOT2");

        final var id2 = idsArray.addObject();
        id2.put("codeCommande", "COM1");
        id2.put("codeFichier", "FIC03");
        id2.put("codeNotif", "NOT3");

        final var response = graphQLTestTemplate.perform("graphql-requests/papaad/delete-papaads.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean ok = response.get("$.data.deletePapaads.ok", Boolean.class);
        assertTrue(ok);

        assertFalse(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC02", "NOT2")).isPresent());
        assertFalse(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC03", "NOT3")).isPresent());
    }
}
