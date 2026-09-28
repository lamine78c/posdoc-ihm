package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.EnvironnementRepository;
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
class EnvironnementTest extends AbstractGraphqlTest {

    @Autowired
    private EnvironnementRepository environnementRepository;

    @Test
    void create_environnement_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "C");
        environnement.put("libelle", "Environnement de Julien");

        final var response = graphQLTestTemplate.perform("graphql-requests/environnement/create-environnement.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("C", response.get("$.data.createEnvironnement.code"));
        assertEquals("Environnement de Julien", response.get("$.data.createEnvironnement.libelle"));

        final var env = environnementRepository.findById("C");
        assertEquals("Environnement de Julien", env.get().getLibelle());
    }

    @Test
    void create_environnement_already_exist_code() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "J");
        environnement.put("libelle", "Environnement de Julien");

        final var response = graphQLTestTemplate.perform("graphql-requests/environnement/create-environnement.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("J", response.get("$.data.createEnvironnement.code"));
        assertEquals("Environnement de Julien", response.get("$.data.createEnvironnement.libelle"));

        final var responseKo = graphQLTestTemplate.perform("graphql-requests/environnement/create-environnement.graphql",
                variables);
        assertNotNull(responseKo);
        assertTrue(responseKo.isOk());
        assertEquals("L'élément Environnement (J) est déjà existant",
                responseKo.get("$.errors[0].message"));
        assertNotNull(responseKo.get("$.errors[0].extensions.timestamp"));
    }

    @Test
    void update_environnement_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "B");
        environnement.put("libelle", "Environnement mis à jour");

        final var response = graphQLTestTemplate.perform("graphql-requests/environnement/update-environnement.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("B", response.get("$.data.updateEnvironnement.code"));
        assertEquals("Environnement mis à jour", response.get("$.data.updateEnvironnement.libelle"));

        final var env = environnementRepository.findById("B");
        assertEquals("Environnement mis à jour", env.get().getLibelle());

    }

    @Test
    void delete_environnement_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("id", "A");

        final var response = graphQLTestTemplate.perform("graphql-requests/environnement/delete-environnement.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteEnvironnement.ok"));

        final var env = environnementRepository.findById("A");
        assertFalse(env.isPresent());

    }

}