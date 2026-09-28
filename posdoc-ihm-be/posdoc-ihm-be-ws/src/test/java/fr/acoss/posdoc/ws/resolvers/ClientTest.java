package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ClientRepository;
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
class ClientTest extends AbstractGraphqlTest {

    @Autowired
    private ClientRepository clientRepository;

    @Test
    void create_client_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var client = variables.putObject("var");
        client.put("code", "CODE");
        client.put("libelle", "Julien");
        client.put("codeAlliage", "AB");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/client/create-client.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("CODE", response.get("$.data.createClient.code"));
        assertEquals("Julien", response.get("$.data.createClient.libelle"));
        assertEquals("AB", response.get("$.data.createClient.codeAlliage"));

        final var cli = clientRepository.findById("CODE");

        assertEquals("Julien", cli.get().getLibelle());
        assertEquals("AB", cli.get().getCodeAlliage());
    }

    @Test
    void create_client_already_exist_code() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var client = variables.putObject("var");
        client.put("code", "ABC");
        client.put("libelle", "Julien");
        client.put("codeAlliage", "AB");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/client/create-client.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABC", response.get("$.data.createClient.code"));
        assertEquals("Julien", response.get("$.data.createClient.libelle"));
        assertEquals("AB", response.get("$.data.createClient.codeAlliage"));

        final var responseKo = graphQLTestTemplate.perform("graphql-requests/client/create-client.graphql",
                variables);
        assertNotNull(responseKo);
        assertTrue(responseKo.isOk());
        assertEquals("L'élément Client (ABC) est déjà existant", responseKo.get("$.errors[0].message"));
        assertNotNull(responseKo.get("$.errors[0].extensions.timestamp"));
    }

    @Test
    void update_client_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var client = variables.putObject("var");
        client.put("code", "ABCD");
        client.put("libelle", "Mise à jour du libellé");
        client.put("codeAlliage", "FG");
        //Pas de mise à jour du code alliage

        final var response = graphQLTestTemplate
                .perform("graphql-requests/client/update-client.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABCD", response.get("$.data.updateClient.code"));
        assertEquals("Mise à jour du libellé", response.get("$.data.updateClient.libelle"));
        assertEquals("FG", response.get("$.data.updateClient.codeAlliage"));

        final var env = clientRepository.findById("ABCD");
        assertEquals("Mise à jour du libellé", env.get().getLibelle());
        assertEquals("FG", env.get().getCodeAlliage());

    }

    @Test
    void delete_environnement_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        final var ids = environnement.putArray("ids");
        ids.add("JKLM");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/client/delete-client.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteClients.ok"));

        final var exist = clientRepository.existsById("JKLM");
        assertFalse(exist);

    }

}
