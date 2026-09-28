package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ImprimeRepository;
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
class ImprimeTest extends AbstractGraphqlTest {

    @Autowired
    private ImprimeRepository imprimeRepository;

    @Test
    void create_imprime_ok() throws IOException {

        final var variables = createImprimeInput("REF", "Libelle référence", null, "A", "B", "true");

        final var response = graphQLTestTemplate.perform("graphql-requests/imprime/create-imprime.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        assertEquals("REF", response.get("$.data.createImprime.reference"));
        assertEquals("Libelle référence", response.get("$.data.createImprime.libelle"));
        assertNull(response.get("$.data.createImprime.codeRND"));
        assertEquals("A", response.get("$.data.createImprime.typeComposition"));
        assertEquals("B", response.get("$.data.createImprime.typeCouleur"));
        assertEquals("true", response.get("$.data.createImprime.rectoVerso"));

        final var imprime = imprimeRepository.findById("REF").get();
        assertEquals("REF", imprime.getReference());
        assertEquals("Libelle référence", imprime.getLibelle());
        assertNull(imprime.getCodeRND());
        assertEquals("A", imprime.getTypeComposition());
        assertEquals("B", imprime.getTypeCouleur());
        assertTrue(imprime.getRectoVerso());

    }

    @Test
    void update_imprime_ok() throws IOException {
        final var variables = createImprimeInput("REF2", "Libelle référence", null, "A", "B", "true");

        final var response = graphQLTestTemplate.perform("graphql-requests/imprime/create-imprime.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var updateVariable = createImprimeInput("REF2",
                "Nouveau libelle",
                "RND",
                "A",
                "B",
                "true");

        final var updatedResponse = graphQLTestTemplate.perform("graphql-requests/imprime/update-imprime.graphql",
                updateVariable);

        assertEquals("REF2", updatedResponse.get("$.data.updateImprime.reference"));
        assertEquals("Nouveau libelle", updatedResponse.get("$.data.updateImprime.libelle"));
        assertEquals("RND", updatedResponse.get("$.data.updateImprime.codeRND"));
        assertEquals("A", updatedResponse.get("$.data.updateImprime.typeComposition"));
        assertEquals("B", updatedResponse.get("$.data.updateImprime.typeCouleur"));
        assertEquals("true", updatedResponse.get("$.data.updateImprime.rectoVerso"));

        final var imprime = imprimeRepository.findById("REF2").get();
        assertEquals("REF2", imprime.getReference());
        assertEquals("Nouveau libelle", imprime.getLibelle());
        assertEquals("RND", imprime.getCodeRND());
        assertEquals("A", imprime.getTypeComposition());
        assertEquals("B", imprime.getTypeCouleur());
        assertTrue(imprime.getRectoVerso());
    }

    public ObjectNode createImprimeInput(final String reference, final String libelle,
                                         final String codeRND, final String typeComposition,
                                         final String typeCouleur, final String rectoVerso) {
        final var variables = new ObjectMapper().createObjectNode();
        final var imprime = variables.putObject("var");

        imprime.put("reference", reference);
        imprime.put("libelle", libelle);
        imprime.put("codeRND", codeRND);
        imprime.put("typeComposition", typeComposition);
        imprime.put("typeCouleur", typeCouleur);
        imprime.put("rectoVerso", rectoVerso);

        return variables;
    }

    @Test
    void delete_imprime_ok() throws IOException {

        final var variables = createImprimeInput("REF3", "Libelle référence", null, "A", "B", "true");

        final var response = graphQLTestTemplate.perform("graphql-requests/imprime/create-imprime.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        final var deleteVariables = new ObjectMapper().createObjectNode();
        final var d = deleteVariables.putObject("var");
        d.put("id", "REF3");

        final var responseDeleted = graphQLTestTemplate.perform("graphql-requests/imprime/delete-imprime.graphql",
                deleteVariables);

        assertNotNull(responseDeleted);
        assertTrue(responseDeleted.isOk());

        assertEquals("true", responseDeleted.get("$.data.deleteImprime.ok"));

        assertFalse(imprimeRepository.existsById("REF3"));
    }

}
