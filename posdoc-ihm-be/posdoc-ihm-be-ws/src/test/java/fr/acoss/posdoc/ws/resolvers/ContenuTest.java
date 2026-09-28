package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ContenuRepository;
import fr.acoss.posdoc.domain.contenu.model.ContenuForAccueil;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateContenuPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"/sql/contenu/insert-contenu.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/sql/contenu/clean-contenu.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ContenuTest extends AbstractGraphqlTest {

    @Autowired
    private ContenuRepository contenuRepository;

    @Test
    void lister_contenu() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/contenu/liste-contenu-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allContenus", CreateOrUpdateContenuPayloadDTO.class);
        assertEquals(2, res.size());
        assertEquals(1, res.get(1).getRegions().size());
    }

    @Test
    void test_getContenuForAccueil() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode userCodesOrg = new ObjectMapper().createArrayNode().add("116");
        variables.set("userOrganismes", userCodesOrg);
        final var response = graphQLTestTemplate.perform("graphql-requests/contenu/get-contenu-for-accueil.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<ContenuForAccueil> contenus = response.getList("$.data.getContenusForAccueil", ContenuForAccueil.class);

        assertEquals(1, contenus.size());
        assertEquals("titre 1", contenus.get(0).getTitre());
        assertEquals(List.of("116"), contenus.get(0).getRegions());
    }

    @Test
    void create_contenu_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var contenu = variables.putObject("createContenu");
        contenu.put("id", 3);
        contenu.put("titre", "titre 3");
        contenu.put("message", "message texte trois");
        contenu.put("dateActivation", "2011-12-03T10:15:30");
        contenu.put("dateExpiration", "2011-12-03T10:15:30");

        final var listRegion = contenu.putArray("regions");
        final var regions = new ObjectMapper().createObjectNode();
        regions.put("code", "116");
        listRegion.add(regions);
        final var response = graphQLTestTemplate.perform("graphql-requests/contenu/create-contenu.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.get("$.data.createContenu", CreateOrUpdateContenuPayloadDTO.class);
        assertEquals("titre 3", res.getTitre());
        assertEquals("message texte trois", res.getMessage());
        assertEquals(1, res.getRegions().size());
    }

    @Test
    void delete_contenu() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", 1);

        final var response = graphQLTestTemplate.perform("graphql-requests/contenu/delete-contenu.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteContenu.ok"));

        final var contenu = contenuRepository.findById(1);
        assertFalse(contenu.isPresent());

    }

}
