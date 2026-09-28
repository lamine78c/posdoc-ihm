package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.GammeRepository;
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
class GammeTest extends AbstractGraphqlTest {

    @Autowired
    private GammeRepository gammeRepository;

    @Test
    void create_gamme_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "CD");
        environnement.put("libelle", "Nouvelle gamme de produits");
        environnement.put("codeVerrou", "CODEVERR");

        final var response = graphQLTestTemplate.perform("graphql-requests/gamme/create-gamme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("CD", response.get("$.data.createGamme.code"));
        assertEquals("Nouvelle gamme de produits", response.get("$.data.createGamme.libelle"));
        assertEquals("CODEVERR", response.get("$.data.createGamme.codeVerrou"));

        final var gamme = gammeRepository.findById("CD");
        assertTrue(gamme.isPresent());
        assertEquals("CD", gamme.get().getCode());
        assertEquals("Nouvelle gamme de produits", gamme.get().getLibelle());
        assertEquals("CODEVERR", gamme.get().getCodeVerrou());

    }

    @Test
    void create_gamme_code_already_exist() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "AB");
        environnement.put("libelle", "Nouvelle gamme de produits");
        environnement.put("codeVerrou", "CODEVERR");

        final var response = graphQLTestTemplate.perform("graphql-requests/gamme/create-gamme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("AB", response.get("$.data.createGamme.code"));
        assertEquals("Nouvelle gamme de produits", response.get("$.data.createGamme.libelle"));
        assertEquals("CODEVERR", response.get("$.data.createGamme.codeVerrou"));

        final var reponseKo = graphQLTestTemplate
                .perform("graphql-requests/gamme/create-gamme.graphql", variables);

        assertNotNull(response);
        assertTrue(reponseKo.isOk());
        assertEquals("L'élément Gamme (AB) est déjà existant", reponseKo.get("$.errors[0].message"));
        assertNotNull(reponseKo.get("$.errors[0].extensions.timestamp"));
    }

    @Test
    void update_gamme_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "UP");
        environnement.put("libelle", "Gamme de produits mis à jour");
        environnement.put("codeVerrou", "PASVERR");

        final var response = graphQLTestTemplate.perform("graphql-requests/gamme/update-gamme.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("UP", response.get("$.data.updateGamme.code"));
        assertEquals("Gamme de produits mis à jour", response.get("$.data.updateGamme.libelle"));
        assertEquals("PASVERR", response.get("$.data.updateGamme.codeVerrou"));

        final var gamme = gammeRepository.findById("UP");
        assertTrue(gamme.isPresent());
        assertEquals("UP", gamme.get().getCode());
        assertEquals("Gamme de produits mis à jour", gamme.get().getLibelle());
        assertEquals("PASVERR", gamme.get().getCodeVerrou());
    }

    @Test
    void delete_gamme_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("id", "RT");

        final var response = graphQLTestTemplate.perform("graphql-requests/gamme/delete-gamme.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteGamme.ok"));

        final var gamme = gammeRepository.findById("RT");
        assertFalse(gamme.isPresent());

    }

}
