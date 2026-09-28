package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.RegionRepository;
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
class RegionTest extends AbstractGraphqlTest {

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void create_region_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "ABC");
        environnement.put("libelle", "Nouvelle région");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/region/create-region.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABC", response.get("$.data.createRegion.code"));
        assertEquals("Nouvelle région", response.get("$.data.createRegion.libelle"));

        final var region = regionRepository.findById("ABC");
        assertTrue(region.isPresent());
        assertEquals("ABC", region.get().getCode());
        assertEquals("Nouvelle région", region.get().getLibelle());

    }

    @Test
    void create_region_code_already_exist() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "CDE");
        environnement.put("libelle", "Nouvelle région");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/region/create-region.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("CDE", response.get("$.data.createRegion.code"));
        assertEquals("Nouvelle région", response.get("$.data.createRegion.libelle"));

        final var reponseKo = graphQLTestTemplate.perform(
                "graphql-requests/region/create-region.graphql",
                variables);

        assertNotNull(response);
        assertTrue(reponseKo.isOk());
        assertEquals("L'élément Region (CDE) est déjà existant", reponseKo.get("$.errors[0].message"));
        assertNotNull(reponseKo.get("$.errors[0].extensions.timestamp"));
    }

    @Test
    void update_region_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("code", "116");
        environnement.put("libelle", "Région mise à jour");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/region/update-region.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("116", response.get("$.data.updateRegion.code"));
        assertEquals("Région mise à jour", response.get("$.data.updateRegion.libelle"));

        final var region = regionRepository.findById("116");
        assertTrue(region.isPresent());
        assertEquals("116", region.get().getCode());
        assertEquals("Région mise à jour", region.get().getLibelle());
    }

    @Test
    void delete_region_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var environnement = variables.putObject("var");
        environnement.put("id", "117");

        assertTrue(regionRepository.findById("117").isPresent());

        final var response = graphQLTestTemplate
                .perform("graphql-requests/region/delete-region.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteRegion.ok"));

        assertFalse(regionRepository.findById("117").isPresent());

    }

}
