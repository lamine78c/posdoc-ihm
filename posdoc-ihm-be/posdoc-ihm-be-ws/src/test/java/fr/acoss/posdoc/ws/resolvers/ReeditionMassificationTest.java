package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.domain.genfic.model.EnvOrg;
import fr.acoss.posdoc.domain.genfic.model.ReeditionMassification;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ReeditionMassificationTest extends AbstractGraphqlTest {

    @Autowired
    private GenFicRepository genFicRepository;

    @Test
    void lister_search_data() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-massification/lister-search-data.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(4, response.getList("$.data.getDistinctEnvOrgFromGenfic", EnvOrg.class).size());
    }

    @Test
    void lister_commande() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("periode", "240523-00");
        var orgs = variables.putArray("codorg");
        orgs.add("750");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-massification/lister_search_commande.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getCommandeFromGenfic", String.class).size());
    }

    @Test
    void lister_fichier() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("periode", "240523-00");
        variables.put("commande", "RDEH");
        var orgs = variables.putArray("codorg");
        orgs.add("750");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-massification/lister_search_fichier.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getFichierFromGenfic", String.class).size());
    }



    @Test
    void search_reedition_par_massification() throws IOException {
        List<String> orgs = new LinkedList<>();
        orgs.add("750");
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("searchReeditionParMassificationQuery", new ObjectMapper().valueToTree(
        SearchReeditionParMassificationQuery.builder()
                .codenv("T")
                .periode("240523-00")
                .codcom("RDEH")
                .codfic("L02")
                .codorg(orgs)
                .build()
                ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/reedition-massification/search_reedition_par_massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.searchReeditionParMassification", ReeditionMassification.class).size());
    }
}
