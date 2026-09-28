package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.occurrence.etape.model.Incidents;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-etape-incident/insert-occurrence-etape-incident.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape-incident/clean-occurrence-etape-incident.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccurrenceEtapeIncidentsTest extends AbstractGraphqlTest {

    @Test
    void get_incidents_by_idetap_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("idetap", 1739);
        variables.put("idtfus", 1739);
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-incidents-by-idetap.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<Incidents> responseList = response.getList("$.data.getIncidentsByIdetap", Incidents.class);
        assertEquals(1, responseList.size());
    }
}