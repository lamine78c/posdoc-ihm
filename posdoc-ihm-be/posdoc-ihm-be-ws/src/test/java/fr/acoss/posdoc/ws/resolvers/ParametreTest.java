package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ParametreRepository;
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
class ParametreTest extends AbstractGraphqlTest {

    @Autowired
    private ParametreRepository parametreRepository;

    @Test
    void create_parametre_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametre = variables.putObject("var");
        parametre.put("code", "AAA");
        parametre.put("value", "Nouvelle valeur");
        parametre.put("libelle", "Description de la valeur");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre/create-parametre.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("AAA", response.get("$.data.createParametre.code"));
        assertEquals("Nouvelle valeur", response.get("$.data.createParametre.value"));
        assertEquals("Description de la valeur", response.get("$.data.createParametre.libelle"));

        final var param = parametreRepository.findById("AAA");
        assertTrue(param.isPresent());
        assertEquals("AAA", param.get().getCode());
        assertEquals("Nouvelle valeur", param.get().getValue());
        assertEquals("Description de la valeur", param.get().getLibelle());

    }

    @Test
    void create_parametre_code_already_exist() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametre = variables.putObject("var");
        parametre.put("code", "ABC");
        parametre.put("value", "Nouvelle valeur");
        parametre.put("libelle", "Description de la valeur");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre/create-parametre.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABC", response.get("$.data.createParametre.code"));
        assertEquals("Nouvelle valeur", response.get("$.data.createParametre.value"));
        assertEquals("Description de la valeur", response.get("$.data.createParametre.libelle"));

        final var reponseKo = graphQLTestTemplate.perform("graphql-requests/parametre/create-parametre.graphql",
                variables);

        assertNotNull(response);
        assertTrue(reponseKo.isOk());
        assertEquals("L'élément Parametre (ABC) est déjà existant",
                reponseKo.get("$.errors[0].message"));
        assertNotNull(reponseKo.get("$.errors[0].extensions.timestamp"));
    }

    @Test
    void update_gamme_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametre = variables.putObject("var");
        parametre.put("code", "CBA");
        parametre.put("value", "Valeur à jour");
        parametre.put("libelle", "Description de la valeur à jour");

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre/update-parametre.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("CBA", response.get("$.data.updateParametre.code"));
        assertEquals("Valeur à jour", response.get("$.data.updateParametre.value"));
        assertEquals("Description de la valeur à jour", response.get("$.data.updateParametre.libelle"));

        final var param = parametreRepository.findById("CBA");
        assertTrue(param.isPresent());
        assertEquals("CBA", param.get().getCode());
        assertEquals("Valeur à jour", param.get().getValue());
        assertEquals("Description de la valeur à jour", param.get().getLibelle());
    }

    @Test
    void delete_gamme_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametres = variables.putObject("var");
        parametres.put("id", "DEL1");

        final var gamme = parametreRepository.findById("DEL1");
        assertTrue(gamme.isPresent());

        final var response = graphQLTestTemplate.perform("graphql-requests/parametre/delete-parametre.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteParametre.ok"));

        assertFalse(parametreRepository.findById("DEL1").isPresent());

    }

    @Test
    void get_param_oguorg_ok() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/parametre/get-param-oguorg.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("999", response.get("$.data.getCodeOrgOGUR"));
    }
}
