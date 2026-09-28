package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.massification.model.MassificationMessage;
import fr.acoss.posdoc.domain.massification.model.MassificationPool;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.service.adelaide.DeleteMassificationAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.types.MyslogAction;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class MassificationTest extends AbstractGraphqlTest {

    @MockBean
    private DeleteMassificationAdelaideService deleteMassificationAdelaideService;

    @Test
    void searchForMassification_withValidCodenv_returnsExpectedResults() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("searchMassificationPayload", new ObjectMapper().valueToTree(SearchMassificationQuery.builder().codenv("T").build()));
        final var response = graphQLTestTemplate.perform("graphql-requests/massification/search-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.searchForMassification", MassificationSearch.class);
        assertEquals(1, res.size());
    }

    @Test
    void searchForMassification_withInvalidCodenv_returnsEmptyList() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("searchMassificationPayload", new ObjectMapper().valueToTree(SearchMassificationQuery.builder().build()));
        final var response = graphQLTestTemplate.perform("graphql-requests/massification/search-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.searchForMassification", MassificationSearch.class);
        assertTrue(res.isEmpty());
    }

    @Test
    void get_pool_elements_for_massification_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode masfics = new ObjectMapper().createArrayNode().add("M4569");
        variables.set("masfics", masfics);
        final var response = graphQLTestTemplate.perform("graphql-requests/massification/get-pool-elements-for-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<MassificationPool> responseList = response.getList("$.data.getPoolElementsForMassification", MassificationPool.class);
        assertEquals(0, responseList.size());
    }

    @Test
    void get_massification_message_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("typtar", "");
        variables.put("codsit", "CIRTIL");
        variables.put("isTarifUrgent", "0");
        final var response = graphQLTestTemplate.perform("graphql-requests/massification/get-massification-message.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        MassificationMessage result = response.get("$.data.getMassificationMessage", MassificationMessage.class);
        assertEquals("Confirmez la massification T_00L_MAS avec la période générée "+getPercod()+"-00 et les tarifs par défaut", result.getMessage());
    }

    @Test
    void get_simulation_message_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "T");
        variables.put("codsit", "CIRTIL");
        final var response = graphQLTestTemplate.perform("graphql-requests/massification/get-simulation-message.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        MassificationMessage result = response.get("$.data.getSimulationMessage", MassificationMessage.class);
        assertEquals("Confirmez la simulation de la massification T_00L_MAS avec la période générée "+getPercod()+"-00", result.getMessage());
    }

    private String getPercod() {
        GregorianCalendar calJour = new GregorianCalendar();
        int aa = calJour.get(Calendar.YEAR) - 2000;
        int mm = calJour.get(Calendar.MONTH) + 1;
        int jj = calJour.get(Calendar.DAY_OF_MONTH);
        return aa + (mm < 10 ? "0" : "") + mm + (jj < 10 ? "0" : "") + jj;
    }

    @Test
    void updateMassification_withValidData_returnsUpdatedList() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var massificationList = new ArrayList<MassificationUpdate>();

        final var massificationItem = getMassificationUpdate();

        massificationList.add(massificationItem);
        variables.set("data", new ObjectMapper().valueToTree(massificationList));
        variables.put("codsit", "CIRSO");

        final var response = graphQLTestTemplate.perform("graphql-requests/massification/update-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        var res = response.getList("$.data.updateMassification", MassificationSearch.class);
        assertEquals("CIRSO", res.get(0).getCodsit());

        // Check History
        final var historyResponse = graphQLTestTemplate.perform("graphql-requests/history/all-history.graphql", variables);
        assertNotNull(historyResponse);
        assertTrue(historyResponse.isOk());
        List<HistoryEntity> responseList = historyResponse.getList("$.data.allHistory", HistoryEntity.class);
        assertEquals(2, responseList.size());
        assertEquals(MyslogAction.UPDATE, responseList.get(0).getActionUtilisateur());
        assertEquals("TmpMas", responseList.get(0).getEntite());
        assertEquals("GenFic", responseList.get(1).getEntite());
    }

    @Test
    void updateMassification_withSameCodsit_doesNotUpdate() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var massificationList = new ArrayList<MassificationUpdate>();

        final var massificationItem = getMassificationUpdate();

        massificationList.add(massificationItem);
        variables.set("data", new ObjectMapper().valueToTree(massificationList));
        variables.put("codsit", "CIRTIL");

        final var response = graphQLTestTemplate.perform("graphql-requests/massification/update-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        var res = response.getList("$.data.updateMassification", MassificationSearch.class);
        assertTrue(res.isEmpty());
    }

    @Test
    void deleteMassification_withValidData_returnsSuccess() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var massificationList = new ArrayList<MassificationSearch>();

        final var massificationItem = getMassificationSearch();
        massificationList.add(massificationItem);
        variables.set("data", new ObjectMapper().valueToTree(massificationList));

        Mockito.when(deleteMassificationAdelaideService.delete(massificationList)).thenReturn(new AdelaideResult(null, null));

        final var response = graphQLTestTemplate.perform("graphql-requests/massification/delete-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        var ok = response.get("$.data.deleteMassification.ok", Boolean.class);
        assertTrue(ok);

        // Check History
        final var historyResponse = graphQLTestTemplate.perform("graphql-requests/history/all-history.graphql", variables);
        assertNotNull(historyResponse);
        assertTrue(historyResponse.isOk());
        List<HistoryEntity> responseList = historyResponse.getList("$.data.allHistory", HistoryEntity.class);
        assertEquals(1, responseList.size());
        assertEquals(MyslogAction.DELETE, responseList.get(0).getActionUtilisateur());
        assertEquals("TmpMas", responseList.get(0).getEntite());
    }

    @Test
    void deleteMassification_withEmptyList_returnsFailure() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var massificationList = new ArrayList<MassificationSearch>();

        variables.set("data", new ObjectMapper().valueToTree(massificationList));

        Mockito.when(deleteMassificationAdelaideService.delete(massificationList)).thenReturn(new AdelaideResult(null, "error message"));

        final var response = graphQLTestTemplate.perform("graphql-requests/massification/delete-massification.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        var ok = response.get("$.data.deleteMassification.ok", Boolean.class);
        assertFalse(ok);
        var error = response.get("$.data.deleteMassification.error", String.class);
        assertEquals("error message", error);
    }

    private static @NotNull MassificationSearch getMassificationSearch() {
        final var massificationItem = new MassificationSearch();
        massificationItem.setMascom("MAS4");
        massificationItem.setMasfic("M4569");
        massificationItem.setCodsit("CIRTIL");
        massificationItem.setCodenv("T");
        massificationItem.setCodorg("750");
        massificationItem.setCodapp("SNV2");
        massificationItem.setPercod("240523-00");
        massificationItem.setCodcom("RDEH");
        massificationItem.setCodfic("L02");
        massificationItem.setNumcom("00");
        massificationItem.setCodeGam("L02");
        massificationItem.setPagFic(7);
        massificationItem.setPliFic(0);
        massificationItem.setCodcli("CIP");
        massificationItem.setCodbon("24-301838");
        massificationItem.setMasuti("null");
        massificationItem.setLibfic("CES ENVALLIA - #CESU - #CIP - NAT/6077");
        massificationItem.setTypsup("S");

        return massificationItem;
    }

    private static @NotNull MassificationUpdate getMassificationUpdate() {
        final var massificationItem = new MassificationUpdate();
        massificationItem.setMascom("MAS4");
        massificationItem.setMasfic("M4569");
        massificationItem.setCodsit("CIRTIL");
        massificationItem.setCodenv("T");
        massificationItem.setCodorg("750");
        massificationItem.setCodapp("SNV2");
        massificationItem.setPercod("240523-00");
        massificationItem.setCodcom("RDEH");
        massificationItem.setCodfic("L02");
        massificationItem.setNumcom("00");
        massificationItem.setCodeGam("L02");
        massificationItem.setPagFic(7);
        massificationItem.setPliFic(0);
        massificationItem.setCodcli("CIP");
        massificationItem.setCodbon("24-301838");
        massificationItem.setMasuti("null");
        massificationItem.setLibfic("CES ENVALLIA - #CESU - #CIP - NAT/6077");
        massificationItem.setTypsup("S");
        massificationItem.setIsAllFichiersInPoolSelected(false);

        return massificationItem;
    }
}