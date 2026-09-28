package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.etape.model.ValideGenEtpPayload;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-etape-validation/insert-occurrence-etape-validation.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape-validation/clean-occurrence-etape-validation.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/insert-params.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/clean-params.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccurrenceEtapeValidationTest extends AbstractGraphqlTest {

    @Test
    void validation_etape_cond_etpfus1_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<ValideGenEtpPayload> payload = new ArrayList<>();
        payload.add(this.getPayloadValideGenEtp(1, "ac11478952", "formid123"));
        variables.set("payload", new ObjectMapper().valueToTree(payload));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/validation-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<UtiLog> responseList = response.getList("$.data.valideGenEtp", UtiLog.class);
        assertEquals(1, responseList.size());
        assertNull(responseList.get(0).getErreur());

        final var variables2 = new ObjectMapper().createObjectNode();
        variables2.put("id", 1);
        final var response2 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables2);
        assertNotNull(response2);
        assertTrue(response2.isOk());
        GenEtp genetp = response2.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("V", genetp.getStatut());
        assertEquals(0, genetp.getCodinf());
    }

    @Test
    void validation_etape_cond_etpfus2_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<ValideGenEtpPayload> payload = new ArrayList<>();
        payload.add(this.getPayloadValideGenEtp(3, "ac11478952", "formid123"));
        variables.set("payload", new ObjectMapper().valueToTree(payload));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/validation-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<UtiLog> responseList = response.getList("$.data.valideGenEtp", UtiLog.class);
        assertEquals(1, responseList.size());
        assertNull(responseList.get(0).getErreur());

        final var variables2 = new ObjectMapper().createObjectNode();
        variables2.put("id", 3);
        final var response2 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables2);
        assertNotNull(response2);
        assertTrue(response2.isOk());
        GenEtp genetp = response2.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("V", genetp.getStatut());
        assertEquals(8, genetp.getCodinf());

        final var variables3 = new ObjectMapper().createObjectNode();
        variables3.set("paramData", new ObjectMapper().valueToTree(this.getParamDataDetailsOccApp("T", "750", "SNV2", "240523-00")));
        final var response3 = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-occurrence-application.graphql", variables3);
        assertNotNull(response3);
        assertTrue(response3.isOk());
        assertEquals("D", response3.get("$.data.getOccurrenceApplication.appsta"));
    }

    private ValideGenEtpPayload getPayloadValideGenEtp(Integer idetap, String user, String formid) {
        ValideGenEtpPayload payload = new ValideGenEtpPayload();
        payload.setIdetap(idetap);
        payload.setUser(user);
        payload.setFormid(formid);
        return payload;
    }

    private OccurrenceApplicationInput getParamDataDetailsOccApp(String codeEnv, String codeOrg, String codeApp, String periode) {
        OccurrenceApplicationInput paramData = new OccurrenceApplicationInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(periode);
        return paramData;
    }
}