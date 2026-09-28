package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/notfic/insert-notfic.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/notfic/clean-notfic.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class NotficPersistenceImplTest {
    @Autowired
    private NotficPersistenceImpl notficPersistenceImpl;

    @Test
    void test_findNotficByParams() {
        SearchNotficQuery query = new SearchNotficQuery();
        query.setCodnot("COM 167");
        query.setCodenv("T");
        query.setCodorg(List.of("780"));
        query.setCodapp("SNV2");
        query.setCodcom("PD11");
        List<NotficFichier> response = notficPersistenceImpl.findNotficByParam(query);

        assertEquals(1, response.size());
        assertEquals("PD24T", response.get(0).getCodeProd());
        assertEquals("PD24A08", response.get(0).getRefImprime());
    }

    @Test
    void test_updateNotfic() {
        UpdateNotficsPayload query = new UpdateNotficsPayload();
        query.setCodnot("NAT 1034 T");
        query.setCodenv("T");
        query.setCodorg("780");
        query.setCodapp("SNV2");
        query.setCodcom("PD16");
        query.setCodfic("L01");
        query.setDnotid("2025-03-12");
        query.setDnotit("2025-03-13");
        List<NotficFichier> response = notficPersistenceImpl.updateNotfic(query);

        assertEquals(1, response.size());
        assertEquals("2025-03-12", response.get(0).getDnotid());
        assertEquals("2025-03-13", response.get(0).getDnotit());
    }

    @Test
    void test_deleteNotfic() {
        NotFicCompositeId query = new NotFicCompositeId();
        query.setCodenv("T");
        query.setCodorg("780");
        query.setCodapp("SNV2");
        query.setCodcom("PD16");
        query.setCodfic("L01");
        query.setCodnot("NAT 1034 T");
        notficPersistenceImpl.deleteNotfic(query);

        SearchNotficQuery searchQuery = new SearchNotficQuery();
        searchQuery.setCodnot(query.getCodnot());
        List<NotficFichier> response = notficPersistenceImpl.findNotficByParam(searchQuery);

        assertEquals(0, response.size());
    }

    @Test
    void test_affectation_notfic() {
        NotFic notfic = new NotFic();
        notfic.setCodnot("cod not");
        notfic.setCodenv("T");
        notfic.setCodorg("777");
        notfic.setCodapp("SNV2");
        notfic.setCodcom("PD16");
        notfic.setCodfic("L01");
        notfic.setDnotid("2025-03-12");
        notfic.setDnotit("2025-03-13");
        List<NotFic> notFicList = new ArrayList<>();
        notFicList.add(notfic);
        List<NotFic> response = notficPersistenceImpl.affectationNotfic(notFicList);
        assertEquals(1, response.size());
    }

    @Test
    void updateNotfics_withValidPayloads_updatesAllNotfics() {
        UpdateNotficsPayload query1 = new UpdateNotficsPayload();
        query1.setCodnot("NAT 1034 T");
        query1.setCodenv("T");
        query1.setCodorg("780");
        query1.setCodapp("SNV2");
        query1.setCodcom("PD16");
        query1.setCodfic("L01");
        query1.setDnotid("2025-03-12");
        query1.setDnotit("2025-03-13");

        UpdateNotficsPayload query2 = new UpdateNotficsPayload();
        query2.setCodnot("COM 167");
        query2.setCodenv("T");
        query2.setCodorg("780");
        query2.setCodapp("SNV2");
        query2.setCodcom("PD11");
        query2.setCodfic("L00");
        query2.setDnotid("2025-04-12");
        query2.setDnotit("2025-04-13");

        List<UpdateNotficsPayload> queries = List.of(query1, query2);
        List<NotficFichier> response = notficPersistenceImpl.updateNotfics(queries);

        assertEquals(2, response.size());
        assertEquals("2025-03-12", response.get(0).getDnotid());
        assertEquals("2025-03-13", response.get(0).getDnotit());
        assertEquals("2025-04-12", response.get(1).getDnotid());
        assertEquals("2025-04-13", response.get(1).getDnotit());
    }

    @Test
    void updateNotfics_withEmptyList_returnsEmptyList() {
        List<UpdateNotficsPayload> queries = List.of();
        List<NotficFichier> response = notficPersistenceImpl.updateNotfics(queries);

        assertEquals(0, response.size());
    }

    @Test
    void updateNotfics_withNullList_throwsException() {
        assertThrows(NullPointerException.class, () -> notficPersistenceImpl.updateNotfics(null));
    }
}
