package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.TarifFacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateTarifConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.UpdateConsolidationFacturationQuery;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/facturation-detaillee/insert-facturation-detaillee.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/facturation-detaillee/clean-facturation-detaillee.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class FacturationDetailleeTest extends AbstractGraphqlTest {

    @Test
    void searchFacturationDetaillee_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final SearchFacturationDetailleeQuery query = new SearchFacturationDetailleeQuery();
        query.setDfiexpDeb("2011-01-01");
        query.setDfiexpFin("2025-12-20");
        query.setCodorgs(List.of("42C", "971"));
        query.setCodclis(List.of("UCN", "UR971"));
        query.setTyptars(List.of("DOM", "DD"));
        query.setShowTotal(false);

        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/facturation/search-facturation-detaillee.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<FacturationDetailleeWithAllColumns> list = response.getList(
                "$.data.searchFacturationDetaillee.facturationDetailleeWithAllColumns",
                FacturationDetailleeWithAllColumns.class
        );
        assertEquals(2, list.size());
        FacturationDetailleeWithAllColumns row = list.get(0);
        assertEquals("INFORMATION PRELEVEMENT", row.getLibfic());
    }

    @Test
    void updateConsolidationFacturation_ok() throws IOException {
        final UpdateConsolidationFacturationQuery query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("42C"));
        query.setCodapp("CES");
        query.setPercod("230106-00");
        query.setCodcom("IPVT");
        query.setCodfic("CV02A");
        UpdateConsolidationFacturation consolidation = new UpdateConsolidationFacturation();
        consolidation.setCodenv("T");
        consolidation.setCodorg("42C");
        consolidation.setCodapp("CES");
        consolidation.setPercod("230106-00");
        consolidation.setCodcom("IPVT");
        consolidation.setNumcom("00");
        consolidation.setCodfic("CV02A");
        UpdateTarifConsolidationFacturation tarif = new UpdateTarifConsolidationFacturation();
        tarif.setTyptar("DOM");
        tarif.setNbplis(20);
        tarif.setCoutot(8580);
        tarif.setIsCreate(false);
        tarif.setIsUpdate(true);
        tarif.setIsDelete(false);
        consolidation.setTarifs(List.of(tarif));
        query.setConsolidations(List.of(consolidation));

        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/facturation/update-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        final var searchVariables = new ObjectMapper().createObjectNode();
        final SearchConsolidationFacturationQuery searchQuery = new SearchConsolidationFacturationQuery();
        searchQuery.setCodenv("T");
        searchQuery.setCodorg(List.of("42C"));
        searchQuery.setCodapp("CES");
        searchQuery.setPercod("230106-00");
        searchQuery.setCodcom("IPVT");
        searchQuery.setCodfic("CV02A");
        searchVariables.set("query", new ObjectMapper().valueToTree(searchQuery));
        final var searchResponse = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/search-consolidation-facturation.graphql", searchVariables);

        assertNotNull(searchResponse);
        assertTrue(searchResponse.isOk());

        List<ConsolidationFacturationWithAllColumns> list = searchResponse.getList(
                "$.data.searchConsolidationFacturation.consolidationFacturationList",
                ConsolidationFacturationWithAllColumns.class
        );
        assertEquals(1, list.size());
        ConsolidationFacturationWithAllColumns consolidationWithColumns = list.get(0);
        // Tarif non comptabilisé
        assertEquals(0, consolidationWithColumns.getPlific());
        assertEquals(0.0f, consolidationWithColumns.getCoufic());
        assertEquals(1, consolidationWithColumns.getTarifs().size());
        TarifFacturationDetaillee tarifFacturation = consolidationWithColumns.getTarifs().get(0);
        assertEquals(20, tarifFacturation.getPlis());
    }
}

