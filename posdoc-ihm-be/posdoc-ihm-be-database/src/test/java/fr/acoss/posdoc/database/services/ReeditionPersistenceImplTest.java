package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import fr.acoss.posdoc.domain.genfic.model.OccurrencesFichiersFiltersInput;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/occurrence-fichier/insert-occurrence-fichier.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-fichier/clean-occurrence-fichier.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ReeditionPersistenceImplTest {

    @Autowired
    private ReeditionPersistenceImpl reeditionPersistenceImpl;

    @Test
    void findOccurrencesFichiers_with_codenv_should_return_results() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(gf -> "T".equals(gf.getCodenv())));
    }

    @Test
    void findOccurrencesFichiers_with_codenv_and_codorg_should_filter_results() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(gf -> "750".equals(gf.getCodorg())));
    }

    @Test
    void findOccurrencesFichiers_with_all_filters_should_return_specific_result() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");
        filters.setCodcom("RDEH");
        filters.setCodfic("L02");
        filters.setRefimp("%V90%");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        GenFic firstResult = results.get(0);
        assertEquals("T", firstResult.getCodenv());
        assertEquals("750", firstResult.getCodorg());
        assertEquals("SNV2", firstResult.getCodapp());
        assertEquals("240523-00", firstResult.getPercod());
        assertEquals("RDEH", firstResult.getCodcom());
        assertEquals("L02", firstResult.getCodfic());
    }

    @Test
    void findOccurrencesFichiers_with_codprd_should_filter_by_product() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodprd("SNV2");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertTrue(results.stream().allMatch(gf -> "SNV2".equals(gf.getCodprd())));
    }

    @Test
    void findOccurrencesFichiers_with_codsta_should_filter_by_status() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodsta("T");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(gf -> "T".equals(gf.getFicsta())));
    }

    @Test
    void findOccurrencesFichiers_with_non_existing_codenv_should_return_empty() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("INVALID");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void findOccurrencesFichiers_with_codapp_and_percod_should_filter_correctly() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().allMatch(gf ->
            "SNV2".equals(gf.getCodapp()) && "240523-00".equals(gf.getPercod())
        ));
    }

    @Test
    void findOccurrencesFichiers_should_populate_all_required_fields() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");

        List<GenFic> results = reeditionPersistenceImpl.findOccurrencesFichiers(filters);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        GenFic genFic = results.get(0);
        assertNotNull(genFic.getCodenv());
        assertNotNull(genFic.getCodorg());
        assertNotNull(genFic.getCodapp());
        assertNotNull(genFic.getPercod());
        assertNotNull(genFic.getCodcom());
        assertNotNull(genFic.getCodfic());
        assertNotNull(genFic.getNumcom());
        assertNotNull(genFic.getFicsta());
        assertNotNull(genFic.getDappcr());
    }

    @Test
    void findOccurrencesFichiersWithMaxSizeCheck_with_valid_filters_should_return_empty_message() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));

        String errorMessage = reeditionPersistenceImpl.findOccurrencesFichiersWithMaxSizeCheck(filters);

        assertNotNull(errorMessage);
        assertTrue(errorMessage.isEmpty());
    }

    @Test
    void findOccurrencesFichiersWithMaxSizeCheck_with_specific_filters_should_not_exceed_limit() {
        OccurrencesFichiersFiltersInput filters = new OccurrencesFichiersFiltersInput();
        filters.setCodenv("T");
        filters.setCodorg(Collections.singletonList("750"));
        filters.setCodapp("SNV2");
        filters.setPercod("240523-00");

        String errorMessage = reeditionPersistenceImpl.findOccurrencesFichiersWithMaxSizeCheck(filters);

        assertNotNull(errorMessage);
        assertTrue(errorMessage.isEmpty());
    }

    @Test
    void search_occ_app_by_fic_should_be_ok() {
        SearchOccAppByFicQuery query = new SearchOccAppByFicQuery();
        query.setCodenv("T");
        query.setCodapp("SNV2");
        query.setCodorg("750");
        query.setPercod("240523-00");
        query.setCodfic("L02");
        query.setCodcom("RDEH");
        query.setNumcom("00");
        SearchOccAppByFicPayloadDTO result = reeditionPersistenceImpl.searchOccAppByFic(query);
        assertNotNull(result);
        assertEquals("Fichier Test 1", result.getLibfic());
    }
}
