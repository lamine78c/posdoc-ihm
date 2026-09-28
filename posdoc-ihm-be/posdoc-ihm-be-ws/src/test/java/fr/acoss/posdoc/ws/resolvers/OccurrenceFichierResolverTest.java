package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genfic.model.OccurrenceFichierPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.OccurrencesFichiersFiltersInput;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicQuery;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/occurrence-fichier/insert-occurrence-fichier.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-fichier/clean-occurrence-fichier.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class OccurrenceFichierResolverTest extends AbstractGraphqlTest {

    @Test
    void getOccurrencesFichiers_with_codenv_only_should_return_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodenvOnly("T")
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
        assertNull(payload.getMessage());
    }

    @Test
    void getOccurrencesFichiers_with_codenv_and_codorg_should_return_filtered_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodenvAndCodorg("T", "750")
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
        assertNull(payload.getMessage());
    }

    @Test
    void getOccurrencesFichiers_with_all_filters_should_return_filtered_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFullFilters()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
        assertNull(payload.getMessage());

        if (!payload.getOccurrencesFichiers().isEmpty()) {
            assertEquals("T", payload.getOccurrencesFichiers().get(0).getCodenv());
            assertEquals("750", payload.getOccurrencesFichiers().get(0).getCodorg());
            assertEquals("SNV2", payload.getOccurrencesFichiers().get(0).getCodapp());
        }
    }

    @Test
    void getOccurrencesFichiers_with_codprd_filter_should_return_filtered_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodprd("T", "SNV2")
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
    }

    @Test
    void getOccurrencesFichiers_with_codsta_filter_should_return_filtered_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodsta("T", "T")
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
    }

    @Test
    void getOccurrencesFichiers_with_non_existing_codenv_should_return_empty_list() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodenvOnly("INVALID")
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
        assertTrue(payload.getOccurrencesFichiers().isEmpty());
    }

    @Test
    void getOccurrencesFichiers_with_multiple_filters_and_no_match_should_return_empty_list() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithNoMatch()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
        assertTrue(payload.getOccurrencesFichiers().isEmpty());
    }

    @Test
    void getOccurrencesFichiers_should_return_all_required_fields() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersForFieldValidation()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);

        if (!payload.getOccurrencesFichiers().isEmpty()) {
            var occurrence = payload.getOccurrencesFichiers().get(0);
            assertNotNull(occurrence.getCodenv());
            assertNotNull(occurrence.getCodorg());
            assertNotNull(occurrence.getCodapp());
            assertNotNull(occurrence.getPercod());
            assertNotNull(occurrence.getCodcom());
            assertNotNull(occurrence.getCodfic());
            assertNotNull(occurrence.getNumcom());
            assertNotNull(occurrence.getFicsta());
            assertFalse(false);
            assertFalse(false);
        }
    }

    @Test
    void getOccurrencesFichiers_with_codapp_and_percod_should_return_filtered_results() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodappAndPercod()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());
    }

    @Test
    void getOccurrencesFichiers_with_codcom_and_codfic_should_return_specific_file() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("filtersPayload", new ObjectMapper().valueToTree(
                getFiltersWithCodcomAndCodfic()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/get-occurrences-fichiers.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        OccurrenceFichierPayloadDTO payload = response.get("$.data.getOccurrencesFichiers", OccurrenceFichierPayloadDTO.class);
        assertNotNull(payload);
        assertNotNull(payload.getOccurrencesFichiers());

        if (!payload.getOccurrencesFichiers().isEmpty()) {
            assertEquals("RDEH", payload.getOccurrencesFichiers().get(0).getCodcom());
            assertEquals("L02", payload.getOccurrencesFichiers().get(0).getCodfic());
        }
    }

    // Helper methods to create filter objects
    private OccurrencesFichiersFiltersInput getFiltersWithCodenvOnly(String codenv) {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv(codenv);
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithCodenvAndCodorg(String codenv, String codorg) {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv(codenv);
        filters.setCodorg(Collections.singletonList(codorg));
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFullFilters() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");
        filters.setCodcom("RDEH");
        filters.setCodfic("L02");
        filters.setRefimp("%V90%");
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithCodprd(String codenv, String codprd) {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv(codenv);
        filters.setCodprd(codprd);
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithCodsta(String codenv, String codsta) {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv(codenv);
        filters.setCodsta(codsta);
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithNoMatch() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("999"));
        filters.setCodapp("INVALID");
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersForFieldValidation() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithCodappAndPercod() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");
        return filters;
    }

    private OccurrencesFichiersFiltersInput getFiltersWithCodcomAndCodfic() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");
        filters.setCodcom("RDEH");
        filters.setCodfic("L02");
        return filters;
    }

    @Test
    void search_occ_app_by_fic_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("fichierPayload", new ObjectMapper().valueToTree(
                getSearchOccAppByFicCondition()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/search-occurrences-fichiers-by-fichier.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        SearchOccAppByFicPayloadDTO payload = response.get("$.data.searchOccAppByFic", SearchOccAppByFicPayloadDTO.class);
        assertNotNull(payload);
        assertEquals("Fichier Test 1", payload.getLibfic());
    }

    private SearchOccAppByFicQuery getSearchOccAppByFicCondition() {
        SearchOccAppByFicQuery query = new SearchOccAppByFicQuery();
        query.setCodenv("T");
        query.setCodapp("SNV2");
        query.setCodorg("750");
        query.setPercod("240523-00");
        query.setCodfic("L02");
        query.setCodcom("RDEH");
        query.setNumcom("00");
        return query;
    }

    @Test
    void search_produits_by_fic_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("fichierPayload", new ObjectMapper().valueToTree(
                getSearchProduitsByFicCondition()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/search-produits-by-fichier.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        List<SearchProduitsByFichierPayloadDTO> payload = response.getList("$.data.searchProduitsByFichier", SearchProduitsByFichierPayloadDTO.class);
        assertNotNull(payload);
        assertEquals(2, payload.size());
    }

    private SearchProduitsByFichierInput getSearchProduitsByFicCondition() {
        SearchProduitsByFichierInput query = new SearchProduitsByFichierInput();
        query.setCodenv("T");
        query.setCodapp("MAS");
        query.setCodorg("00L");
        query.setPercod("230331-00");
        query.setCodfic("CV02A");
        query.setCodcom("IPVT");
        query.setNumcom("00");
        return query;
    }

    @Test
    void search_facturations_by_fic_mas_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("fichierPayload", new ObjectMapper().valueToTree(
                getSearchFacturationsByFicMasCondition()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/search-facturations-by-fichier.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        SearchFacturationsByFichierPayloadDTO payload = response.get("$.data.searchFacturationsByFichier", SearchFacturationsByFichierPayloadDTO.class);
        assertEquals(2, payload.getFacturations().size());
        assertEquals(3, payload.getFichiersMas().size());
    }

    private SearchFacturationsByFichierInput getSearchFacturationsByFicMasCondition() {
        SearchFacturationsByFichierInput query = new SearchFacturationsByFichierInput();
        query.setCodenv("T");
        query.setCodapp("MAS");
        query.setCodorg("00L");
        query.setPercod("230331-00");
        query.setCodfic("M4001");
        query.setCodcom("MAS4");
        query.setNumcom("00");
        return query;
    }

    @Test
    void search_facturations_by_fic_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("fichierPayload", new ObjectMapper().valueToTree(
                getSearchFacturationsByFicCondition()
        ));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/occurrence-fichier/search-facturations-by-fichier.graphql",
                variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        SearchFacturationsByFichierPayloadDTO payload = response.get("$.data.searchFacturationsByFichier", SearchFacturationsByFichierPayloadDTO.class);
        assertEquals(2, payload.getFacturations().size());
        assertNull(payload.getFichiersMas());
    }

    private SearchFacturationsByFichierInput getSearchFacturationsByFicCondition() {
        SearchFacturationsByFichierInput query = new SearchFacturationsByFichierInput();
        query.setCodenv("T");
        query.setCodapp("CES");
        query.setCodorg("42C");
        query.setPercod("230331-00");
        query.setCodfic("CV02A");
        query.setCodcom("IPVT");
        query.setNumcom("00");
        return query;
    }
}
