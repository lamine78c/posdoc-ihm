package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.SupportRepository;
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
class SupportTest extends AbstractGraphqlTest {

    @Autowired
    private SupportRepository supportRepository;

    @Test
    void test_create_support() throws IOException {

        final var variables = createSupportInput("A", "Libelle du support A", 750);

        final var response = graphQLTestTemplate.perform("graphql-requests/support/create-support.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        assertEquals("A", response.get("$.data.createSupport.type"));
        assertEquals("Libelle du support A", response.get("$.data.createSupport.libelle"));
        assertEquals("750", response.get("$.data.createSupport.poids"));

        final var support = supportRepository.findById("A").get();
        assertEquals("A", support.getType());
        assertEquals("Libelle du support A", support.getLibelle());
        assertEquals(750, support.getPoids());

    }

    @Test
    void test_update_support() throws IOException {

        final var variables = createSupportInput("B", "Libelle du support B", 750);

        final var response = graphQLTestTemplate.perform("graphql-requests/support/create-support.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var updateVariables = createSupportInput("B", "Nouveau libelle du support B", 900);

        final var updateResponse = graphQLTestTemplate.perform("graphql-requests/support/update-support.graphql",
                updateVariables);

        assertNotNull(updateResponse);
        assertTrue(updateResponse.isOk());

        assertEquals("B", updateResponse.get("$.data.updateSupport.type"));
        assertEquals("Nouveau libelle du support B",
                updateResponse.get("$.data.updateSupport.libelle"));
        assertEquals("900", updateResponse.get("$.data.updateSupport.poids"));

        final var support = supportRepository.findById("B").get();
        assertEquals("B", support.getType());
        assertEquals("Nouveau libelle du support B", support.getLibelle());
        assertEquals(900, support.getPoids());

    }


    @Test
    void test_delete_support() throws IOException {

        final var variables = createSupportInput("C", "Libelle du support C", 1000);

        final var response = graphQLTestTemplate.perform("graphql-requests/support/create-support.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        assertTrue(supportRepository.existsById("C"));

        final var deleteVariables = new ObjectMapper().createObjectNode();
        final var delete = deleteVariables.putObject("var");
        delete.put("ids", "C");

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/support/delete-support.graphql",
                deleteVariables);

        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());

        assertFalse(supportRepository.existsById("C"));

    }

    private ObjectNode createSupportInput(final String type, final String libelle,
                                          final Integer poids) {

        final var variables = new ObjectMapper().createObjectNode();
        final var support = variables.putObject("var");

        support.put("type", type);
        support.put("libelle", libelle);
        support.put("poids", poids);

        return variables;
    }

}
