package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genfic.model.Facturation;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataFacturationInput;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccAppDetailsFacturationTest extends AbstractGraphqlTest {

    @Test
    void getDetailsFacturation_withValidInput_returnsDetails() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("T", "42C", "CES", "230106-00", false)));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-facturations.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getDetailsFacturation", Facturation.class);
        assertEquals(1, res.size());
    }

    @Test
    void getDetailsFacturation_withInvalidInput_returnsNull() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("invalidCodEnv", "invalidCodOrg", "invalidCodApp", "invalidPerCod", true)));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-facturations.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getDetailsFacturation", Facturation.class);
        assertTrue(res.isEmpty());
    }
    
    private ParamDataFacturationInput getParamData(String codeEnv, String codeOrg, String codeApp, String perCod, Boolean isMasApp) {
        ParamDataFacturationInput paramData = new ParamDataFacturationInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(perCod);
        paramData.setIsMasApp(isMasApp);
        return paramData;
    }
}