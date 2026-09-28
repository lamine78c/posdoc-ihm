package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/utilog/clean-utilog.sql","classpath:sql/utilog/insert-utilog.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/utilog/clean-utilog.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UtilogTest extends AbstractGraphqlTest {

    @Test
    void test_find_utilog_by_query_should_be_ok() throws IOException {
        final FindUtiLogByQuery query = new FindUtiLogByQuery();
        query.setDtdeb("2025-06-12 00:00:00");
        query.setDtfin("2025-06-13 23:59:59");
        final var variable = new ObjectMapper().createObjectNode();
        variable.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/utilog/find_utilog_by_query.graphql", variable);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<UtiLogEntity> responseList = response.getList("$.data.findUtiLogByQuery", UtiLogEntity.class);
        assertEquals(1, responseList.size());
    }

    @ParameterizedTest
    @CsvSource({
        "graphql-requests/utilog/find_distinct_user.graphql, $.data.findDistinctUserUtilog",
        "graphql-requests/utilog/find_distinct_action.graphql, $.data.findDistinctActionUtilog",
        "graphql-requests/utilog/find_distinct_form_id.graphql, $.data.findDistinctFormIdUtilog"
    })
    void test_find_distinct_fields_should_be_ok(String graphqlRequest, String jsonPath) throws IOException {
        final var response = graphQLTestTemplate.perform(graphqlRequest, null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> responseList = response.getList(jsonPath, String.class);
        assertEquals(1, responseList.size());
    }
}
