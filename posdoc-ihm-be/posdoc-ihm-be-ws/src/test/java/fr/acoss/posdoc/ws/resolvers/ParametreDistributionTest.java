package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.ParametreDistributionRepository;
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
class ParametreDistributionTest extends AbstractGraphqlTest {

    @Autowired
    private ParametreDistributionRepository parametreDistributionRepository;


    @Test
    void create_parametredistribution_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametreResource = variables.putObject("var");

        parametreResource.put("reference", "REFERENCE");
        parametreResource.put("libelle", "Libelle");
        parametreResource.put("logicielDistribution", "Q");
        parametreResource.put("commandeDistribution", "commandeDistribution");

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/parametre-distribution/create-parametre-distribution.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("REFERENCE", response.get("$.data.createParametreDistribution.reference"));
        assertEquals("Libelle", response.get("$.data.createParametreDistribution.libelle"));
        assertEquals("Q", response.get("$.data.createParametreDistribution.logicielDistribution"));
        assertEquals("commandeDistribution",
                response.get("$.data.createParametreDistribution.commandeDistribution"));

        final var paramResEntity = parametreDistributionRepository.findById("REFERENCE");
        assertTrue(paramResEntity.isPresent());
        assertEquals("REFERENCE", paramResEntity.get().getReference());
        assertEquals("Libelle", paramResEntity.get().getLibelle());
        assertEquals("commandeDistribution", paramResEntity.get().getCommandeDistribution());
        assertEquals("Q", paramResEntity.get().getLogicielDistribution());

    }

    @Test
    void update_parametredistribution_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametreDistribution = variables.putObject("var");

        parametreDistribution.put("reference", "ABORT");
        parametreDistribution.put("libelle", "Updated Libelle");
        parametreDistribution.put("logicielDistribution", "Q");
        parametreDistribution.put("commandeDistribution", "commandeDistribution");

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/parametre-distribution/update-parametre-distribution.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("ABORT", response.get("$.data.updateParametreDistribution.reference"));
        assertEquals("Updated Libelle", response.get("$.data.updateParametreDistribution.libelle"));
        assertEquals("Q", response.get("$.data.updateParametreDistribution.logicielDistribution"));
        assertEquals("commandeDistribution",
                response.get("$.data.updateParametreDistribution.commandeDistribution"));

        final var paramResEntity = parametreDistributionRepository.findById("ABORT");
        assertTrue(paramResEntity.isPresent());
        assertEquals("ABORT", paramResEntity.get().getReference());
        assertEquals("Updated Libelle", paramResEntity.get().getLibelle());
        assertEquals("commandeDistribution", paramResEntity.get().getCommandeDistribution());
        assertEquals("Q", paramResEntity.get().getLogicielDistribution());
    }

    @Test
    void delete_parametredistribution_ok() throws IOException {

        final var variables = new ObjectMapper().createObjectNode();
        final var parametres = variables.putObject("var");
        parametres.put("ids", "ADL_PLATYPUS");
        assertTrue(parametreDistributionRepository.findById("ADL_PLATYPUS").isPresent());

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/parametre-distribution/delete-parametre-distribution.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteParametreDistributions.ok"));

        assertFalse(parametreDistributionRepository.findById("ADL_PLATYPUS").isPresent());

    }

}
