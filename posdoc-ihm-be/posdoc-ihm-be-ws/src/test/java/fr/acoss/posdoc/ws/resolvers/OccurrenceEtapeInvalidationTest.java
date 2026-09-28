package fr.acoss.posdoc.ws.resolvers;


import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.etape.model.InvalideGenEtpPayload;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-etape-invalidation/insert-occurrence-etape-invalidation.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape-invalidation/clean-occurrence-etape-invalidation.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/insert-params.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/clean-params.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

class OccurrenceEtapeInvalidationTest extends AbstractGraphqlTest {

    @Test
    void invalidation_etape_liens() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("payload", new ObjectMapper().valueToTree(this.getPayloadInvalideGenEtp(4, "ac75092074", "Invalidation d'une étape et liens")));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/invalidation-etape-liens.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        UtiLog utiLog = response.get("$.data.invalideGenEtpEtLiens", UtiLog.class);
        assertNotNull(utiLog);
        assertNull(utiLog.getErreur());

        final var variables1 = new ObjectMapper().createObjectNode();
        variables1.put("id", 1);
        final var response1 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables1);
        assertNotNull(response1);
        assertTrue(response1.isOk());
        GenEtp genEtp1 = response1.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("D", genEtp1.getStatut());

        final var variables2 = new ObjectMapper().createObjectNode();
        variables2.put("id", 2);
        final var response2 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables2);
        assertNotNull(response2);
        assertTrue(response2.isOk());
        GenEtp genEtp2 = response2.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("V", genEtp2.getStatut());

        final var variables3 = new ObjectMapper().createObjectNode();
        variables3.put("id", 3);
        final var response3 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables3);
        assertNotNull(response3);
        assertTrue(response3.isOk());
        GenEtp genEtp3 = response3.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("T", genEtp3.getStatut());

        final var variables4 = new ObjectMapper().createObjectNode();
        variables4.put("id", 4);
        final var response4 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables4);
        assertNotNull(response4);
        assertTrue(response4.isOk());
        GenEtp genEtp4 = response4.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("I", genEtp4.getStatut());

        final var variables5 = new ObjectMapper().createObjectNode();
        variables5.put("id", 5);
        final var response5 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables5);
        assertNotNull(response5);
        assertTrue(response5.isOk());
        GenEtp genEtp5 = response5.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("I", genEtp5.getStatut());

        final var variables6 = new ObjectMapper().createObjectNode();
        variables6.put("id", 6);
        final var response6 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables6);
        assertNotNull(response6);
        assertTrue(response6.isOk());
        GenEtp genEtp6 = response6.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("I", genEtp6.getStatut());

        final var variables7 = new ObjectMapper().createObjectNode();
        variables7.set("paramData", new ObjectMapper().valueToTree(this.getParamDataDetailsOccApp("T", "750", "SNV2", "240523-00")));
        final var response7 = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-occurrence-application.graphql", variables7);
        assertNotNull(response7);
        assertTrue(response7.isOk());
        assertEquals("D", response7.get("$.data.getOccurrenceApplication.appsta"));
    }


    private void invalidation_etape_test(final int idEtape, final String s, final String message) throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<InvalideGenEtpPayload> payload = new ArrayList<>();
        payload.add(this.getPayloadInvalideGenEtp(idEtape, "ac11478952", "formid123"));
        variables.set("payload", new ObjectMapper().valueToTree(payload));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/invalidation-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(Objects.requireNonNull(response.getRawResponse().getBody()).contains(s), message);
    }

    @Test
    void invalidation_etape_debut_error() throws IOException {
        invalidation_etape_test(1, "Impossible d'invalider une étape DEB ou FIN", "Contient le message \"Impossible d'invalider une étape DEB ou FIN\"");
    }

    @Test
    void invalidation_etape_fin_error() throws IOException {
        invalidation_etape_test(2, "Impossible d'invalider une étape DEB ou FIN", "Contient le message \"Impossible d'invalider une étape DEB ou FIN\"");
    }

    @Test
    void invalidation_etape_terminee_error() throws IOException {
        invalidation_etape_test(8, "Impossible d'invalider une étape déja terminée", "Contient le message \"Impossible d'invalider une étape déja terminée\"");
    }

    @Test
    void invalidation_etape_historique_error() throws IOException {
        invalidation_etape_test(7, "Impossible d'invalider une étape déja terminée", "Contient le message \"Impossible d'invalider une étape déja terminée\"");
    }


    @Test
    void invalidation_etape_sans_liens() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<InvalideGenEtpPayload> payload = new ArrayList<>();
        payload.add(this.getPayloadInvalideGenEtp(6, "ac11478952", "formid123"));
        variables.set("payload", new ObjectMapper().valueToTree(payload));
        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/invalidation-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<UtiLog> utiLog = response.getList("$.data.invalideGenEtp", UtiLog.class);
        assertNotNull(utiLog);
        assertNull(utiLog.get(0).getErreur());

        final var variables2 = new ObjectMapper().createObjectNode();
        variables2.put("id", 6);
        final var response2 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables2);
        assertNotNull(response2);
        assertTrue(response2.isOk());
        GenEtp genEtp2 = response2.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("I", genEtp2.getStatut());

        final var variables3 = new ObjectMapper().createObjectNode();
        variables3.put("id", 3);
        final var response3 = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-genEtp-by-id.graphql", variables3);
        assertNotNull(response3);
        assertTrue(response3.isOk());
        GenEtp genEtp3 = response3.get("$.data.getGenEtpById", GenEtp.class);
        assertEquals("V", genEtp3.getStatut());

        final var variables7 = new ObjectMapper().createObjectNode();
        variables7.set("paramData", new ObjectMapper().valueToTree(this.getParamDataDetailsOccApp("T", "750", "SNV2", "240523-00")));
        final var response7 = graphQLTestTemplate.perform("graphql-requests/occurrence-application/details-occurrence-application.graphql", variables7);
        assertNotNull(response7);
        assertTrue(response7.isOk());
        assertEquals("S", response7.get("$.data.getOccurrenceApplication.appsta"));
    }

    private InvalideGenEtpPayload getPayloadInvalideGenEtp(Integer idEtape, String user, String formid) {
        InvalideGenEtpPayload payload = new InvalideGenEtpPayload();
        payload.setIdetap(idEtape);
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
