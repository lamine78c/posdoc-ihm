package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRessourcePayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

class RessourceTest extends AbstractGraphqlTest {

    @Test
    void lister_ressources() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/ressource/liste-ressource-existante.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allRessources", CreateOrUpdateRessourcePayloadDTO.class);
        assertEquals(3, res.size());

        assertEquals("COALA", res.get(0).getCodeRessource());
        assertEquals(Boolean.FALSE, res.get(0).getIsNotAuthorisedToBeDeleted());
        assertEquals("COALA", res.get(1).getCodeRessource());
        assertEquals(Boolean.FALSE, res.get(1).getIsNotAuthorisedToBeDeleted());
        assertEquals("MASSI", res.get(2).getCodeRessource());
        assertEquals(Boolean.TRUE, res.get(2).getIsNotAuthorisedToBeDeleted());
    }

    @Test
    void lister_ressources_with_user_profile() throws IOException {
        graphQLTestTemplate.addHeader("user.organismes", "100");
        final var response = graphQLTestTemplate
                .perform("graphql-requests/ressource/liste-ressource-existante.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.allRessources", CreateOrUpdateRessourcePayloadDTO.class);
        assertEquals(1, res.size());
        assertEquals(Boolean.FALSE, res.get(0).getIsNotAuthorisedToBeDeleted());

        graphQLTestTemplate.clearHeaders();
    }

}
