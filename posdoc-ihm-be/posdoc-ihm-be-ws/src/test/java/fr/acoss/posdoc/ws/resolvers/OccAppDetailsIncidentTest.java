package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataIncidentInput;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccAppDetailsIncidentTest extends AbstractGraphqlTest {

    @Test
    void getDetailsIncident_withValidInput_returnsDetails() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("T", "00L", "MAS", "230331-00")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-incident.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getDetailsIncident", DetailsIncident.class);
        assertEquals(1, res.size());
    }

    @Test
    void getDetailsIncident_withInvalidInput_returnsNull() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("invalidCodEnv", "invalidCodOrg", "invalidCodApp", "invalidPerCod")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-incident.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getDetailsIncident", DetailsIncident.class);
        assertTrue(res.isEmpty());
    }

    private ParamDataIncidentInput getParamData(String codeEnv, String codeOrg, String codeApp, String perCod) {
        ParamDataIncidentInput paramData = new ParamDataIncidentInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(perCod);
        return paramData;
    }
}