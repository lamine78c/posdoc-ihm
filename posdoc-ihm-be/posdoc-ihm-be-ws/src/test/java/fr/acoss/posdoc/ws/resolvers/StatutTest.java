package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.statut.model.StatutDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/statut/insert-statut.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/statut/clean-statut.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class StatutTest extends AbstractGraphqlTest {

    @Test
    void allStatuts_returnsAllStatutsOrderedByCode() throws IOException {
        final var response = graphQLTestTemplate.perform("graphql-requests/statut/select-statut.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<StatutDTO> responseList = response.getList("$.data.allStatuts", StatutDTO.class);


        assertEquals(5, responseList.size());
        assertEquals("C", responseList.get(0).getCode());
        assertEquals("Cree", responseList.get(0).getLibelle());
    }
}