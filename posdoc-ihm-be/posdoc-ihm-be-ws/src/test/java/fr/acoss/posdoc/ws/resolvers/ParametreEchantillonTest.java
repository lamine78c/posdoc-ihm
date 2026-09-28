package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ParametreEchantillonRepository;
import fr.acoss.posdoc.types.TypeEchantillon;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ParametreEchantillonTest extends AbstractGraphqlTest {

    @Autowired
    private ParametreEchantillonRepository parametreEchantillonRepository;


    @Test
    void create_parametreechantillon_ok() throws IOException {

        final var variables = createVariables("ref", "LOT", "10", "1", true, "formule");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-echantillon/create-parametre-echantillon.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ref", response.get("$.data.createParametreEchantillon.reference"));
        assertEquals("LOT", response.get("$.data.createParametreEchantillon.type"));
        assertEquals("10", response.get("$.data.createParametreEchantillon.nombreLots"));
        assertEquals("1", response.get("$.data.createParametreEchantillon.nombrePages"));
        assertEquals("true", response.get("$.data.createParametreEchantillon.random"));
        assertEquals("formule", response.get("$.data.createParametreEchantillon.formule"));

        final var paramEchantillon = parametreEchantillonRepository.findById("ref").get();
        assertEquals("ref", paramEchantillon.getReference());
        assertEquals(TypeEchantillon.LOT, paramEchantillon.getType());
        assertEquals(10, paramEchantillon.getNombreLots());
        assertEquals(1, paramEchantillon.getNombrePages());
        assertTrue(paramEchantillon.getRandom());
        assertEquals("formule", paramEchantillon.getFormule());

    }


    @Test
    void update_parametreechantillon_ok() throws IOException {
        final var variables = createVariables("ref2", "LOT", "10", "1", true, "formule");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-echantillon/create-parametre-echantillon.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var updatedVariable = createVariables("ref2", "PAGE", null, "5", true, "formule");

        final var updatedResponse = graphQLTestTemplate.perform(
                "graphql-requests/parametre-echantillon/update-parametre-echantillon.graphql",
                updatedVariable);

        assertNotNull(updatedResponse);
        assertTrue(updatedResponse.isOk());
        assertEquals("ref2", updatedResponse.get("$.data.updateParametreEchantillon.reference"));
        assertEquals("PAGE", updatedResponse.get("$.data.updateParametreEchantillon.type"));
        assertNull(updatedResponse.get("$.data.updateParametreEchantillon.nombreLots"));
        assertEquals("5", updatedResponse.get("$.data.updateParametreEchantillon.nombrePages"));
        assertEquals("true", updatedResponse.get("$.data.updateParametreEchantillon.random"));
        assertEquals("formule", updatedResponse.get("$.data.updateParametreEchantillon.formule"));

        final var paramEchantillon = parametreEchantillonRepository.findById("ref2").get();
        assertEquals("ref2", paramEchantillon.getReference());
        assertEquals(TypeEchantillon.PAGE, paramEchantillon.getType());
        assertEquals(5, paramEchantillon.getNombrePages());
        assertNull(paramEchantillon.getNombreLots());
        assertTrue(paramEchantillon.getRandom());
        assertEquals("formule", paramEchantillon.getFormule());

    }

    @Test
    void delete_parametreechantillon_ok() throws IOException {

        final var variables = createVariables("ref3", "LOT", "10", "1", true, "formule");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre-echantillon/create-parametre-echantillon.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var deleteVariables = new ObjectMapper().createObjectNode();
        final var params = deleteVariables.putObject("var");
        params.put("ids", "ref3");

        final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/parametre-echantillon/delete-parametre-echantillon.graphql",
                deleteVariables);

        assertNotNull(deleteResponse);
        assertTrue(deleteResponse.isOk());
        assertEquals("true", deleteResponse.get("$.data.deleteParametreEchantillons.ok"));

        assertFalse(parametreEchantillonRepository.findById("ref3").isPresent());

    }

    public ObjectNode createVariables(final String reference, final String type,
                                      final String nombreLots, final String nombrePages,
                                      final Boolean random, final String formule) {
        final var variables = new ObjectMapper().createObjectNode();
        final var server = variables.putObject("var");
        server.put("reference", reference);
        server.put("type", type);
        server.put("nombreLots", nombreLots);
        server.put("nombrePages", nombrePages);
        server.put("random", random);
        server.put("formule", formule);
        return variables;
    }

    //  reference:String!
    //  type: TypeEchantillon!
    //  nombreLots: Int
    //  nombrePages: Int
    //  random: Boolean!
    //  formule: String!

}
