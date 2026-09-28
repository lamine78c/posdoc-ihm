package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.EnvOrgsQuery;
import fr.acoss.posdoc.domain.genetp.model.ResGamSit;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/volumes-traites/insert-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/volumes-traites/clean-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class VolumeTraiteTest extends AbstractGraphqlTest {

    @Test
    void get_distinct_envs_from_genetp_ok() throws IOException {

        final var response = graphQLTestTemplate
                .perform("graphql-requests/volume-traite/get-distinct-envs-from-genetp.graphql", null);

        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> list = response.getList("$.data.getDistinctEnvsFromGenEtp", String.class);
        assertEquals(1, list.size());
    }

    @Test
    void get_distinct_orgs_from_genetp_ok() throws IOException {

        final var response = graphQLTestTemplate
                .perform("graphql-requests/volume-traite/get-distinct-orgs-from-genetp.graphql", null);

        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> list = response.getList("$.data.getDistinctOrgsFromGenEtp", String.class);
        assertEquals(1, list.size());
    }

    @Test
    void get_ressources_by_env_orgs_ok() throws IOException {
        EnvOrgsQuery query = new EnvOrgsQuery();
        query.setCodeEnv("P");
        query.setCodesOrg(List.of("750"));
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));

        final var response = graphQLTestTemplate.perform("graphql-requests/volume-traite/get-ressources-by-env-orgs.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<ResGamSit> list = response.getList("$.data.getGamSitResByEnvOrgs", ResGamSit.class);
        assertEquals(1, list.size());
    }
}