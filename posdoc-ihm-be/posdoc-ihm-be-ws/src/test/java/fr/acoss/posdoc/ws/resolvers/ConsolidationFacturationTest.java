package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphql.spring.boot.test.GraphQLResponse;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateTarifConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.UpdateConsolidationFacturationQuery;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/consolidation-facturation/insert-consolidation-facturation.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/consolidation-facturation/clean-consolidation-facturation.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ConsolidationFacturationTest extends AbstractGraphqlTest {

    @Test
    void createConsolidationFacturation() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(List.of("117"));
        query.setCodapp("SNV2");
        query.setPercod("250321-00");
        query.setCodcom("RDEH");
        query.setCodfic("L00");
        final var consolidation = new UpdateConsolidationFacturation();
        consolidation.setCodenv("P");
        consolidation.setCodorg("117");
        consolidation.setCodapp("SNV2");
        consolidation.setPercod("250321-00");
        consolidation.setCodcom("RDEH");
        consolidation.setNumcom("00");
        consolidation.setCodfic("L00");
        final var tarif = new UpdateTarifConsolidationFacturation();
        tarif.setTyptar("DOM");
        tarif.setNbplis(11);
        tarif.setCoutot(4741);
        tarif.setIsCreate(true);
        tarif.setIsUpdate(false);
        tarif.setIsDelete(false);
        consolidation.setTarifs(List.of(tarif));
        query.setConsolidations(List.of(consolidation));
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/create-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        List<ConsolidationFacturationWithAllColumns> consolidations = searchConsolidationFacturation(List.of("117"), "SNV2", "RDEH", "L00");
        assertEquals(1, consolidations.size());
        assertEquals(2, consolidations.get(0).getTarifs().size());
        assertEquals("DOM", consolidations.get(0).getTarifs().get(0).getCodeTar());
        assertEquals(4.741f, consolidations.get(0).getTarifs().get(0).getCout());
    }

    @Test
    void updateConsolidationFacturation() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(List.of("117"));
        query.setCodapp("SNV2");
        query.setPercod("250321-00");
        query.setCodcom("RDEH");
        query.setCodfic("L00");
        final var consolidation = new UpdateConsolidationFacturation();
        consolidation.setCodenv("P");
        consolidation.setCodorg("117");
        consolidation.setCodapp("SNV2");
        consolidation.setPercod("250321-00");
        consolidation.setCodcom("RDEH");
        consolidation.setNumcom("00");
        consolidation.setCodfic("L00");
        final var tarif = new UpdateTarifConsolidationFacturation();
        tarif.setTyptar("TF");
        tarif.setNbplis(15);
        tarif.setCoutot(6645);
        tarif.setIsCreate(false);
        tarif.setIsUpdate(true);
        tarif.setIsDelete(false);
        consolidation.setTarifs(List.of(tarif));
        query.setConsolidations(List.of(consolidation));
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/update-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        List<ConsolidationFacturationWithAllColumns> consolidations = searchConsolidationFacturation(List.of("117"), "SNV2", "RDEH", "L00");
        assertEquals(1, consolidations.size());
        assertEquals(1, consolidations.get(0).getTarifs().size());
        assertEquals("TF", consolidations.get(0).getTarifs().get(0).getCodeTar());
        assertEquals(15, consolidations.get(0).getTarifs().get(0).getPlis());
        assertEquals(6.645f, consolidations.get(0).getTarifs().get(0).getCout());
    }

    /**
     * Reproduit le flux complet de l'écran sur le périmètre MAS (bug d'origine : tableau vide après validation) :
     * recherche par organisme massificateur, mutation envoyée avec les organismes des lignes affichées (gentar),
     * puis rafraîchissement par la recherche avec les critères du formulaire.
     */
    @Test
    void updateConsolidationFacturationSurPerimetreMassification() throws IOException {
        List<ConsolidationFacturationWithAllColumns> initial = searchConsolidationFacturation(List.of("900"), "MAS", null, null);
        assertEquals(1, initial.size());
        assertEquals("117", initial.get(0).getCodorg());

        final var variables = new ObjectMapper().createObjectNode();
        final var query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(List.of("117"));
        query.setCodapp("MAS");
        query.setPercod("250321-00");
        final var consolidation = new UpdateConsolidationFacturation();
        consolidation.setCodenv("P");
        consolidation.setCodorg("117");
        consolidation.setCodapp("SNV2");
        consolidation.setPercod("250321-00");
        consolidation.setCodcom("RDEH");
        consolidation.setNumcom("00");
        consolidation.setCodfic("L00");
        final var tarif = new UpdateTarifConsolidationFacturation();
        tarif.setTyptar("TF");
        tarif.setNbplis(15);
        tarif.setCoutot(6645);
        tarif.setIsCreate(false);
        tarif.setIsUpdate(true);
        tarif.setIsDelete(false);
        consolidation.setTarifs(List.of(tarif));
        query.setConsolidations(List.of(consolidation));
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/update-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        List<ConsolidationFacturationWithAllColumns> refreshed = searchConsolidationFacturation(List.of("900"), "MAS", null, null);
        assertEquals(1, refreshed.size());
        assertEquals(1, refreshed.get(0).getTarifs().size());
        assertEquals("TF", refreshed.get(0).getTarifs().get(0).getCodeTar());
        assertEquals(15, refreshed.get(0).getTarifs().get(0).getPlis());
        assertEquals(6.645f, refreshed.get(0).getTarifs().get(0).getCout());
    }

    @Test
    void deleteConsolidationFacturation() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(List.of("117"));
        query.setCodapp("SNV2");
        query.setPercod("250321-00");
        query.setCodcom("RDEH");
        query.setCodfic("L00");
        final var consolidation = new UpdateConsolidationFacturation();
        consolidation.setCodenv("P");
        consolidation.setCodorg("117");
        consolidation.setCodapp("SNV2");
        consolidation.setPercod("250321-00");
        consolidation.setCodcom("RDEH");
        consolidation.setNumcom("00");
        consolidation.setCodfic("L00");
        final var tarif = new UpdateTarifConsolidationFacturation();
        tarif.setTyptar("TF");
        tarif.setNbplis(null);
        tarif.setCoutot(null);
        tarif.setIsCreate(false);
        tarif.setIsUpdate(false);
        tarif.setIsDelete(true);
        consolidation.setTarifs(List.of(tarif));
        query.setConsolidations(List.of(consolidation));
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/delete-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        List<ConsolidationFacturationWithAllColumns> consolidations = searchConsolidationFacturation(List.of("117"), "SNV2", "RDEH", "L00");
        assertEquals(0, consolidations.size());
    }

    private List<ConsolidationFacturationWithAllColumns> searchConsolidationFacturation(List<String> codorg, String codapp, String codcom, String codfic) throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new SearchConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(codorg);
        query.setCodapp(codapp);
        query.setPercod("250321-00");
        query.setCodcom(codcom);
        query.setCodfic(codfic);
        variables.set("query", new ObjectMapper().valueToTree(query));
        final GraphQLResponse response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/search-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        return response.getList("$.data.searchConsolidationFacturation.consolidationFacturationList", ConsolidationFacturationWithAllColumns.class);
    }

    @Test
    void recalculateFacturation() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new UpdateConsolidationFacturationQuery();
        query.setCodenv("P");
        query.setCodorg(List.of("117"));
        query.setCodapp("SNV2");
        query.setPercod("250321-00");
        query.setCodcom("RDEH");
        query.setCodfic("L00");
        query.setConsolidations(new ArrayList<>());
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/consolidation-facturation/update-consolidation-facturation.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertTrue(response.get("$.data.updateConsolidationFacturation", Boolean.class));

        List<ConsolidationFacturationWithAllColumns> consolidations = searchConsolidationFacturation(List.of("117"), "SNV2", "RDEH", "L00");
        assertEquals(1, consolidations.size());
        assertEquals(1, consolidations.get(0).getTarifs().size());
        assertEquals("TF", consolidations.get(0).getTarifs().get(0).getCodeTar());
        assertEquals(200, consolidations.get(0).getTarifs().get(0).getPlis());
        assertEquals(88.6f, consolidations.get(0).getTarifs().get(0).getCout());
    }
}
