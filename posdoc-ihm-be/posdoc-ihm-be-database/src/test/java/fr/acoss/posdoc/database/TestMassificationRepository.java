package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.MassificationRepository;
import fr.acoss.posdoc.database.entities.GenFicEntity;

import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationPayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/massification-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/massification-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

@ActiveProfiles("test")
class TestMassificationRepository {

    @Autowired
    private MassificationRepository massificationRepository;

    @Test
    @Transactional
    void test_searchDetailsMassificationOccurrenceEtape() {
        DetailsMassificationPayload payload = new DetailsMassificationPayload();
        payload.setCodenv("T");
        payload.setCodorg("00L");
        payload.setCodapp("MAS");
        payload.setPercod("230220-00");
        payload.setCodcom("MAS4");
        payload.setNumcom("00");
        payload.setCodfic("M4001");

        List<GenFicEntity> result = massificationRepository.findDetailsMassificationForOccurrenceEtape(payload);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void test_searchForMassification() {
        List<String> codorgs = new ArrayList<>();
        codorgs.add("42C");
        SearchMassificationQuery query = new SearchMassificationQuery();
        query.setCodenv("T");
        query.setCodorgs(codorgs);
        query.setCodapp("CES");
        query.setCodcom("IPVT");
        query.setCodfic("CV02A");
        query.setCodcli("UCN");
        query.setPercod("230106-00");
        query.setMasuti(null);
        query.setCodsit("CIRTIL");

        List<MassificationSearch> result = massificationRepository.searchForMassification(query, "MA");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void test_updateMassification() {
        MassificationUpdate updateQuery = new MassificationUpdate();
        updateQuery.setCodenv("T");
        updateQuery.setCodorg("42C");
        updateQuery.setCodapp("CES");
        updateQuery.setCodcom("IPVT");
        updateQuery.setCodfic("CV02A");
        updateQuery.setPercod("230106-00");
        updateQuery.setNumcom("00");

        massificationRepository.updateMassification("INTEGR", updateQuery);

        MassificationSearch updatedMassification = massificationRepository.findUpdatedMassification(updateQuery, "MA").get(0);

        assertNotEquals("CIRTIL", updatedMassification.getCodsit());
        assertEquals("INTEGR", updatedMassification.getCodsit());
    }
}
