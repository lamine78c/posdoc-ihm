package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.organiclient.model.OrganiClient;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/organi-client/insert-organi-client.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/organi-client/clean-organi-client.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OrganiClientTest extends AbstractGraphqlTest {

    @Test
    void lister_all() throws IOException {
        final var response = graphQLTestTemplate.postForResource("graphql-requests/organi-client/find-all-organi-client.graphql");
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(5, response.getList("$.data.findAllOrganiClient", OrganiClient.class).size());
    }
}
