package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProduction;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProductionInput;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-application/insert-occurrence-application.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-application/clean-occurrence-application.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccAppSuiviProductionTest extends AbstractGraphqlTest {

    @Test
    void getOccurrenceApplicationForSuiviProduction() throws IOException {
        OccurrenceApplicationSuiviProductionInput query = new OccurrenceApplicationSuiviProductionInput();
        query.setCodenv("P");
        query.setCodorgs(List.of("117"));
        query.setCodapp("SNV2");
        query.setPercod("251016-00");
        query.setCodsit("CIRSO");
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/occurrence-application-suivi-production.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<OccurrenceApplicationSuiviProduction> responseList = response.getList("$.data.getOccurrenceApplicationForSuiviProduction.occurrencesApplication", OccurrenceApplicationSuiviProduction.class);
        assertEquals(2, responseList.size());
    }
}
