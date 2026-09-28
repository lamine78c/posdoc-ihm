package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.ws.resolvers.query.StaInfDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/stainf/insert-stainf.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/stainf/clean-stainf.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class StaInfTest extends AbstractGraphqlTest {

    @Test
    void allStaInf_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/stainf/select-stainf.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<StaInfDTO> responseList = response.getList("$.data.allStaInf", StaInfDTO.class);

        assertEquals(5, responseList.size());
    }
}