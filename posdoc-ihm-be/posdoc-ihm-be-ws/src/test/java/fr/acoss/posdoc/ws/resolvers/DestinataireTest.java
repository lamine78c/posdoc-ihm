package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.DestinataireRepository;
import fr.acoss.posdoc.domain.destinataire.model.CodeDestinataireCodeOrg;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireToAddNewExemplaire;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateDestinatairePayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class DestinataireTest extends AbstractGraphqlTest {

    @Autowired
    private DestinataireRepository destinataireRepository;

    @Test
    void lister_destinataires() throws IOException {
        graphQLTestTemplate.clearHeaders();
        final var response = graphQLTestTemplate
                .perform("graphql-requests/destinataire/liste-destinataire-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allDestinataires", CreateOrUpdateDestinatairePayloadDTO.class);
        assertEquals(2, res.size());

    }

    @Test
    void lister_destinataire_with_user_profile() throws IOException {

        graphQLTestTemplate.addHeader("user.organismes", "750");
        final var response = graphQLTestTemplate
                .perform("graphql-requests/destinataire/liste-destinataire-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allDestinataires", CreateOrUpdateDestinatairePayloadDTO.class);
        assertEquals(1, res.size());

        graphQLTestTemplate.clearHeaders();

    }

    @Test
    void get_destinataires_to_add_new_exemplaire_should_be_ok() throws IOException {
        String codeOrg = "750";

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codeOrg", codeOrg);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/destinataire/get-destinataires-to-add-new-exemplaire.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        List<DestinataireToAddNewExemplaire> result = response.getList("$.data.getDestinatairesToAddNewExemplaire", DestinataireToAddNewExemplaire.class);
        assertEquals(1, result.size());

        assertEquals("addre", result.get(0).getCode());
        assertEquals("addre-adresse", result.get(0).getText());
    }

    @Test
    void find_all_code_and_codeorg() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/destinataire/find-all-code-and-codeorg.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, response.getList("$.data.findAllCodeDestinsAndCodeOrg", CodeDestinataireCodeOrg.class).size());
    }
}
