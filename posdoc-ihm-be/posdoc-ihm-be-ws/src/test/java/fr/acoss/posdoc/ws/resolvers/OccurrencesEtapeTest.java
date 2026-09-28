package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-etape/insert-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape/clean-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccurrencesEtapeTest extends AbstractGraphqlTest {

    @Test
    void get_genetp_by_id_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("id", 1);
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        GenEtp genetp = response.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("T", genetp.getCodenv());
    }

}