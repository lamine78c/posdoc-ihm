package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.history.model.FindHistoryByQuery;
import fr.acoss.posdoc.types.MyslogAction;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/myslog/insert-myslog.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/myslog/clean-myslog.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class MyslogTest extends AbstractGraphqlTest {

    @Test
    void test_all_history_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/history/all-history.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<HistoryEntity> responseList = response.getList("$.data.allHistory", HistoryEntity.class);
        assertEquals(3, responseList.size());
    }

    @Test
    void test_find_history_by_query_should_be_ok() throws IOException {
        final FindHistoryByQuery query = new FindHistoryByQuery();
        query.setDtdeb("2025-06-12 00:00:00");
        query.setDtfin("2025-06-13 23:59:59");
        query.setAction(MyslogAction.INSERT);
        final var variable = new ObjectMapper().createObjectNode();
        variable.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/history/find_history_by_query.graphql", variable);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<HistoryEntity> responseList = response.getList("$.data.findHistoryByQuery", HistoryEntity.class);
        assertEquals(3, responseList.size());
    }

    @Test
    void test_find_distinct_user_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/history/find_distinct_user.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> responseList = response.getList("$.data.findDistinctUser", String.class);
        assertEquals(1, responseList.size());
    }

    @Test
    void test_find_distinct_entity_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/history/find_distinct_entity.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> responseList = response.getList("$.data.findDistinctEntity", String.class);
        assertEquals(1, responseList.size());
    }

    @Test
    void test_find_history_by_codulo_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codulo", 1234);
        final var response = graphQLTestTemplate.perform("graphql-requests/history/find_history_by_codulo.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<HistoryEntity> responseList = response.getList("$.data.findHistoryByCodulo", HistoryEntity.class);
        assertEquals(2, responseList.size());
    }
}
