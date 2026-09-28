package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpExistsQuery;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.ReeditionRessource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ReeditionRessourceTest extends AbstractGraphqlTest {

    @Autowired
    private GenFicRepository genFicRepository;


    @Test
    void lister_search_data() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-ressource/lister-search-data.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(5, response.getList("$.data.getDistinctEnvOrgAppFromGenfic", EnvOrgApp.class).size());
    }

    @Test
    void lister_perdiode() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("codapp", "SNV2");
        var orgs = variables.putArray("codorg");
        orgs.add("750");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-ressource/lister_search_periode.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getPeriodeFromGenfic", String.class).size());
    }

    @Test
    void search_filtred_ressource() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("codapp", "SNV2");
        var orgs = variables.putArray("codorg");
        orgs.add("750");
        variables.put("periode", "240523-00");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-ressource/search_filtred_ressource.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.searchReeditionPerRessurce", ReeditionRessource.class).size());
    }

    @Test
    void check_if_genetp_exists() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        GenEtpExistsQuery query = new GenEtpExistsQuery();
        query.setCodenv("T");
        query.setCodorg("750");
        query.setCodapp("SNV2");
        query.setPercod("240523-00");
        query.setCodcom("RDEH");
        query.setCodfic("L02");
        query.setNumcom("00");
        query.setCodsit("CIRSO");
        query.setCodres("codres");
        query.setCodgam("FT");
        variables.set("query", new ObjectMapper().valueToTree(query));

        final var response = graphQLTestTemplate.perform("graphql-requests/reedition-ressource/check_if_genetp_exists.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        boolean exists = response.get("$.data.checkIfGenEtpExists", Boolean.class);
        assertTrue(exists);
    }
}
