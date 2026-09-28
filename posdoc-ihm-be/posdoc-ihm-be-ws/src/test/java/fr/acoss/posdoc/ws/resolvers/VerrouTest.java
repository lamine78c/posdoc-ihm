package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.VerrouRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class VerrouTest extends AbstractGraphqlTest {

    @Autowired
    private VerrouRepository verrouRepository;

    @Test
    void test_create_verrou() throws IOException {

        final var variables = createVariables("CODE", "Libelle", 3);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/verrou/create-verrou.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("CODE", response.get("$.data.createVerrou.code"));
        assertEquals("3", response.get("$.data.createVerrou.maxExecution"));
        assertEquals("Libelle", response.get("$.data.createVerrou.libelle"));

        final var verrou = verrouRepository.findById("CODE").get();
        assertEquals("CODE", verrou.getCode());
        assertEquals(3, verrou.getMaxExecution());
        assertEquals("Libelle", verrou.getLibelle());

    }

    @Test
    void test_update_server() throws IOException {

        final var variables = createVariables("DOC1", "Nouveau Libelle", 10);

        final var verrou = verrouRepository.findById("DOC1").get();
        assertEquals("DOC1", verrou.getCode());
        assertEquals("Verrou lie aux process DOC1", verrou.getLibelle());
        assertEquals(50, verrou.getMaxExecution());

        final var response = graphQLTestTemplate
                .perform("graphql-requests/verrou/update-verrou.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("DOC1", response.get("$.data.updateVerrou.code"));
        assertEquals("Nouveau Libelle", response.get("$.data.updateVerrou.libelle"));
        assertEquals("10", response.get("$.data.updateVerrou.maxExecution"));

        final var verrouUpdated = verrouRepository.findById("DOC1").get();
        assertEquals("DOC1", verrouUpdated.getCode());
        assertEquals("Nouveau Libelle", verrouUpdated.getLibelle());
        assertEquals(10, verrouUpdated.getMaxExecution());

    }

    @Test
    void test_delete_verrou() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("ids", "BM");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/verrou/delete-verrou.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteVerrous.ok"));

        assertFalse(verrouRepository.existsById("BM"));

    }

    public ObjectNode createVariables(final String code, final String libelle,
                                      final Integer maxExecution) {
        final var variables = new ObjectMapper().createObjectNode();
        final var server = variables.putObject("var");
        server.put("code", code);
        server.put("libelle", libelle);
        server.put("maxExecution", maxExecution);
        return variables;
    }

}
