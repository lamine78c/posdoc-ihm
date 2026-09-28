package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriode;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriodeInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.UpdateTypRefInGenAppInput;
import fr.acoss.posdoc.types.TypeRefection;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccAppGestionTest extends AbstractGraphqlTest {

    @Test
    void getSearchPeriod_withValidInput_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamDataSearchPeriod("T", List.of("910"), "SNV2", false)));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-periode.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<DetailsPeriode> responseList = response.getList("$.data.getDetailsPeriodeFromGenApp", DetailsPeriode.class);
        assertEquals(1, responseList.size());
    }

    @Test
    void getSearchPeriod_withInValidInput_ko() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamDataSearchPeriod("Z", List.of("ZZZ"), "APP_INVALID", false)));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-periode.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<DetailsPeriode> responseList = response.getList("$.data.getDetailsPeriodeFromGenApp", DetailsPeriode.class);
        assertTrue(responseList.isEmpty());
    }

    @Test
    void getOccurrenceApplication_withValidInput_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamDataDetailsOccApp("T", "910", "SNV2", "230816-0G")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-occurrence-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("2024-01-01T00:00:00", response.get("$.data.getOccurrenceApplication.dapplc"));
    }

    @Test
    void getOccurrenceApplication_withInValidInput_ko() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamDataDetailsOccApp("T", "ZZZ", "APP_INVALID", "999999-ZZ")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-occurrence-application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(null, response.get("$.data.getOccurrenceApplication"));
    }

    @Test
    void update_typref_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("paramData", new ObjectMapper().valueToTree(this.getParamDataUpdateTypRef("T", "910", "SNV2", "230816-0G", TypeRefection.fromValue("A"), "user", "formId")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/update-typref.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(TypeRefection.fromValue("A").toString(), response.get("$.data.updateTypRefInGenApp.typref"));
    }

    private DetailsPeriodeInput getParamDataSearchPeriod(String codeEnv, List<String> codeOrgs, String codeApp, Boolean isManuel) {
        DetailsPeriodeInput paramData = new DetailsPeriodeInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrgs(codeOrgs);
        paramData.setCodApp(codeApp);
        paramData.setIsManuel(isManuel);
        return paramData;
    }

    private OccurrenceApplicationInput getParamDataDetailsOccApp(String codeEnv, String codeOrg, String codeApp, String periode) {
        OccurrenceApplicationInput paramData = new OccurrenceApplicationInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(periode);
        return paramData;
    }

    private UpdateTypRefInGenAppInput getParamDataUpdateTypRef(String codeEnv, String codeOrg, String codeApp, String periode, TypeRefection typRef, String user, String formId) {
        UpdateTypRefInGenAppInput paramData = new UpdateTypRefInGenAppInput();
        paramData.setCodEnv(codeEnv);
        paramData.setCodOrg(codeOrg);
        paramData.setCodApp(codeApp);
        paramData.setPerCod(periode);
        paramData.setTypRef(typRef);
        paramData.setUser(user);
        paramData.setFormId(formId);
        return paramData;
    }
}