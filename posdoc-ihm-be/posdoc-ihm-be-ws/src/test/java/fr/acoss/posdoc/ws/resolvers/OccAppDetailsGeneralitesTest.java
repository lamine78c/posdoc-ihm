package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsGeneralitesPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.OngletsParamDataInput;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccAppDetailsGeneralitesTest extends AbstractGraphqlTest {

    @Test
    void getDetailsGeneralites_withValidInput_returnsDetails() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("T", "910", "SNV2", "230816-0G")));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-generalites.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<DetailsGeneralitesPayload> responseList = response.getList("$.data.getDetailsGeneralites", DetailsGeneralitesPayload.class);

        assertEquals(1, responseList.size());
        assertEquals(true, responseList.get(0).getArefec());
        assertEquals("appsta_value", responseList.get(0).getAppsta());
        assertEquals("appinf_value", responseList.get(0).getAppinf());
    }

    @Test
    void getDetailsGeneralites_withInvalidInput_returnsNull() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamData("invalidCodEnv", "invalidCodOrg", "invalidCodApp", "invalidPerCod")));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-generalites.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<DetailsGeneralitesPayload> responseList = response.getList("$.data.getDetailsGeneralites", DetailsGeneralitesPayload.class);

        assertTrue(responseList.isEmpty());
    }

    private OngletsParamDataInput getParamData(String codeEnv, String codeOrg, String codeApp, String perCod) {
        OngletsParamDataInput paramData = new OngletsParamDataInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(perCod);

        return paramData;
    }
}