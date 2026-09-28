package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationFiltreDTO;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationPayload;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/suivi-massification/insert-suivi-massification.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/suivi-massification/clean-suivi-massification.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class SuiviMassificationTest extends AbstractGraphqlTest {

    @Test
    void lister_filtre() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/suivi-massification/lister_filtre.graphql");
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, response.getList("$.data.getDistinctFiltreMassification", SuiviMassificationFiltreDTO.class).size());
    }

    @Test
    void lister_massifications_only_environment() throws IOException {
        final var variables1 = new ObjectMapper().createObjectNode();
        variables1.set("suiviMassificationPayload", new ObjectMapper().valueToTree(
                this.getParamData("T", null, "230331-00", "240829-00")
        ));

        final var variables2 = new ObjectMapper().createObjectNode();
        variables2.set("suiviMassificationPayload", new ObjectMapper().valueToTree(
                this.getParamData("T", List.of("CIRTIL"), "230331-00", "240829-00")
        ));

        final var responseCount1 = graphQLTestTemplate.perform("graphql-requests/suivi-massification/count_search_massification.graphql", variables1);
        assertNotNull(responseCount1);
        assertTrue(responseCount1.isOk());

        Integer resultCount = responseCount1.get("$.data.searchCountForSuiviMassification", Integer.class);
        assertEquals(2, resultCount);

        final var responseCount2 = graphQLTestTemplate.perform("graphql-requests/suivi-massification/count_search_massification.graphql", variables2);
        assertNotNull(responseCount2);
        assertTrue(responseCount2.isOk());

        resultCount = responseCount2.get("$.data.searchCountForSuiviMassification", Integer.class);
        assertEquals(1, resultCount);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/suivi-massification/lister_search_massification.graphql", variables2);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<SuiviMassificationDTO> responseList = response.getList("$.data.searchForSuiviMassification", SuiviMassificationDTO.class);

        assertEquals(1, responseList.size());
        assertEquals("CES ENVALLIA -  CESU - NAT 6058 - NAT 6219", responseList.get(0).getLibFichier());
        assertEquals("MAS4", responseList.get(0).getMascom());
    }

    @Test
    void lister_massifications_without_periode_fin() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("suiviMassificationPayload", new ObjectMapper().valueToTree(
                this.getParamData("T", List.of("CIRTIL"), "230331-00", "")
        ));

        final var responseCount = graphQLTestTemplate.perform(
                "graphql-requests/suivi-massification/count_search_massification.graphql", variables);
        assertNotNull(responseCount);
        assertTrue(responseCount.isOk());

        Integer resultCount = responseCount.get("$.data.searchCountForSuiviMassification", Integer.class);
        assertNotNull(resultCount);
        assertTrue(resultCount >= 0);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/suivi-massification/lister_search_massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<SuiviMassificationDTO> responseList = response.getList("$.data.searchForSuiviMassification", SuiviMassificationDTO.class);
        assertNotNull(responseList);
    }

    private SuiviMassificationPayload getParamData(String codenv, List<String> sitesMas, String periodeDebut, String periodeFin) {
        SuiviMassificationPayload payload = new SuiviMassificationPayload();
        payload.setCodenv(codenv);
        payload.setSitesMas(sitesMas);
        payload.setPeriodeDebut(periodeDebut);
        payload.setPeriodeFin(periodeFin);
        return payload;
    }
}
