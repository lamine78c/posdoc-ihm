package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.GenEtpInput;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapeSearchData;
import fr.acoss.posdoc.domain.genetp.model.VideoStep;
import fr.acoss.posdoc.domain.genetp.model.VideoStepPayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-etape/insert-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape/clean-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/insert-params.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/clean-params.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccurrenceEtapeTest extends AbstractGraphqlTest {

    @Autowired
    private OccurrenceEtapeResolver occurrenceEtapeResolver;

    @Test
    void getOccEtp_withNullInput_returnsOccEtp() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("occurrenceEtapePayload", new ObjectMapper().valueToTree(
                        this.getParamData(null, null, null)
                )
        );

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/occurrence-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<GenEtp> responseList = response.getList("$.data.searchOccurrenceEtape", GenEtp.class);

        assertEquals(3, responseList.size());
        assertEquals("RDEH", responseList.get(0).getCodcom());
        assertEquals("SNV2", responseList.get(0).getCodapp());
    }

    @Test
    void set_new_status_for_list_of_genEtp_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var etapeList = new ArrayList<GenEtpInput>();
        etapeList.add(GenEtpInput.builder().id(1).statut("V").build());
        variables.set("etapes", new ObjectMapper().valueToTree(etapeList));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/set-new-status-for-list-of-genEtp.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<GenEtp> res = response.getList("$.data.setNewStatusForListOfGenEtp", GenEtp.class);
        assertEquals("V", res.get(0).getStatut());
    }

    @Test
    void getOccEtp_withTypdatDatdebDatfinInput_returnsOccEtp() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("occurrenceEtapePayload", new ObjectMapper().valueToTree(
                this.getParamData("Création", "20/02/2023", "16/09/2024")));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/occurrence-etape.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<GenEtp> responseList = response.getList("$.data.searchOccurrenceEtape", GenEtp.class);

        assertEquals(3, responseList.size());
        assertEquals("RDEH", responseList.get(0).getCodcom());
        assertEquals("SNV2", responseList.get(0).getCodapp());
    }


    private OccurrenceEtapePayload getParamData(String typdat, String datdeb, String datfin) {
        OccurrenceEtapePayload paramData = new OccurrenceEtapePayload();
        paramData.setCodenv(null);
        paramData.setCodorg(null);
        paramData.setCodapp(null);
        paramData.setPercod(null);
        paramData.setCodcom(null);
        paramData.setCodfic(null);
        paramData.setCodgam(null);
        paramData.setCodsit(null);
        paramData.setCodres(null);
        paramData.setCodser(null);
        paramData.setTypetp(null);
        paramData.setStatut(null);
        paramData.setCodver(null);
        if (typdat != null && datdeb != null && datfin != null) {
            paramData.setTypdat(typdat);
            paramData.setDatdeb(datdeb);
            paramData.setDatfin(datfin);
        }

        return paramData;
    }

    @Test
    void get_video_steps_with_reedit_false_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("")
                        .codgam("")
                        .statut("")
                        .etpfus("")
                        .reedit(false)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_video_steps_with_reedit_true_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("")
                        .codgam("")
                        .statut("")
                        .etpfus("")
                        .reedit(true)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_video_steps_with_gam_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("")
                        .codgam("FT")
                        .statut("")
                        .etpfus("")
                        .reedit(false)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_video_steps_with_statut_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("")
                        .codgam("")
                        .statut("S")
                        .etpfus("")
                        .reedit(false)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_video_steps_with_etpfus_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("")
                        .codgam("")
                        .statut("")
                        .etpfus("FAB")
                        .reedit(false)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_video_steps_reedit_true_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .codcom("RDH")
                        .codgam("FB")
                        .statut("D")
                        .etpfus("-")
                        .reedit(true)
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-video-steps.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<VideoStep> responseList = response.getList("$.data.getVideoSteps", VideoStep.class);

        assertEquals(2, responseList.size());
        assertEquals(1, responseList.get(0).getIdetap());
        assertEquals(0, responseList.get(0).getIdpere());
    }

    @Test
    void get_first_video_step_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepPayload", new ObjectMapper().valueToTree(
                VideoStepPayload.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-etape/get-first-video-step.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        VideoStep video = response.get("$.data.getFirstVideoStep", VideoStep.class);

        assertEquals(0, video.getIdetap());
        assertNull(video.getIdpere());
    }

    @Test
    void get_occurrence_etape_search_data() throws IOException {
        graphQLTestTemplate.clearHeaders();
        final var response = graphQLTestTemplate
                .perform("graphql-requests/occurrence-etape/get_occurrence_etape_search_data.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<OccurrenceEtapeSearchData> res = response.getList("$.data.getOccurrenceEtapeSearchData", OccurrenceEtapeSearchData.class);
        assertEquals(1, res.size());
    }

    @Test
    void get_distinct_coms_by_envs_and_orgs_and_apps_and_percods() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var listEnvVar = variables.putArray("codenvs");
        listEnvVar.add("T");
        final var listOrgVar = variables.putArray("codorgs");
        listOrgVar.add("750");
        final var listAppVar = variables.putArray("codapps");
        listAppVar.add("SNV2");
        final var listPercodeVar = variables.putArray("percods");
        listPercodeVar.add("240523-00");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/occurrence-etape/get_distinct_coms_by_envs_and_orgs_and_apps_and_percods.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getDistinctComsByEnvsAndOrgsAndAppsAndPercods", String.class).size());

        var listEnv = List.of("T");
        var listOrg = List.of("750");
        var listApp = List.of("SNV2");
        var listPercode = List.of("240523-00");
        assertEquals(occurrenceEtapeResolver.getDistinctComsByEnvsAndOrgsAndAppsAndPercods(listEnv, listOrg, listApp, listPercode), response.getList("$.data.getDistinctComsByEnvsAndOrgsAndAppsAndPercods", String.class));
    }

    @Test
    void get_distinct_gams_by_envs_and_orgs_and_apps_and_percods() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var listEnvVar = variables.putArray("codenvs");
        listEnvVar.add("T");
        final var listOrgVar = variables.putArray("codorgs");
        listOrgVar.add("750");
        final var listAppVar = variables.putArray("codapps");
        listAppVar.add("SNV2");
        final var listPercodeVar = variables.putArray("percods");
        listPercodeVar.add("240523-00");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/occurrence-etape/get_distinct_gams_by_envs_and_orgs_and_apps_and_percods.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods", String.class).size());

        var listEnv = List.of("T");
        var listOrg = List.of("750");
        var listApp = List.of("SNV2");
        var listPercode = List.of("240523-00");
        assertEquals(occurrenceEtapeResolver.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(listEnv, listOrg, listApp, listPercode), response.getList("$.data.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods", String.class));
    }
}