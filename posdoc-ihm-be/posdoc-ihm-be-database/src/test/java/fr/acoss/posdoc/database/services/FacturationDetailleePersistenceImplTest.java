package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/facturation-detaillee/insert-facturation-detaillee.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/facturation-detaillee/clean-facturation-detaillee.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class FacturationDetailleePersistenceImplTest {
    @Autowired
    private FacturationDetailleePersistenceImpl facturationDetailleePersistenceImpl;

    @Autowired
    private OrganismePersistenceImpl organismePersistenceImpl;

    @Autowired
    private TarposPersistenceImpl tarposPersistenceImpl;

    @Autowired
    private EnvironnementPersistenceImpl environnementPersistenceImpl;

    @Autowired
    private ApplicationPersistenceImpl applicationPersistenceImpl;

    @Test
    void test_searchFacturationDetaillee() {
        SearchFacturationDetailleeQuery query = new SearchFacturationDetailleeQuery();
        query.setDfiexpDeb("2023-01-12");
        query.setDfiexpFin("2024-12-20");
        query.setCodorgs(List.of("42C", "971"));
        query.setCodclis(List.of("UCN", "UR971"));
        query.setTyptars(List.of("DOM", "DD"));
        query.setShowTotal(false);
        var dtoWithoutCodenv = facturationDetailleePersistenceImpl.searchFacturationDetaillee(query);
        List<FacturationDetaillee> responseWithoutCodenv = dtoWithoutCodenv.getFacturationDetailleeList();

        assertEquals(2, responseWithoutCodenv.size());
        assertEquals("42C", responseWithoutCodenv.get(0).getCodorg());
        assertEquals("DOM", responseWithoutCodenv.get(0).getTyptar());
        assertEquals("971", responseWithoutCodenv.get(1).getCodorg());
        assertEquals("DD,DOM", responseWithoutCodenv.get(1).getTyptar());
        assertEquals("25,4", responseWithoutCodenv.get(1).getNbplis());
        assertEquals("365789,2640", responseWithoutCodenv.get(1).getCoutot());

        query.setCodenv("T");
        var dtoWithCodenv = facturationDetailleePersistenceImpl.searchFacturationDetaillee(query);
        List<FacturationDetaillee> responseWithCodenv = dtoWithCodenv.getFacturationDetailleeList();

        assertEquals(1, responseWithCodenv.size());
        assertEquals("42C", responseWithCodenv.get(0).getCodorg());
    }

    @Test
    void test_searchTotalFacturationDetaillee() {
        SearchFacturationDetailleeQuery query = new SearchFacturationDetailleeQuery();
        query.setDfiexpDeb("2023-01-12");
        query.setDfiexpFin("2024-12-20");
        query.setCodorgs(List.of("42C", "971"));
        query.setCodclis(List.of("UCN", "UR971"));
        query.setTyptars(List.of("DOM", "DD"));
        query.setShowTotal(true);
        var dto = facturationDetailleePersistenceImpl.searchFacturationDetaillee(query);
        List<FacturationDetaillee> response = dto.getFacturationDetailleeList();

        assertEquals(1, response.size());
        FacturationDetaillee total = response.get(0);
        assertEquals("Total", total.getCodfic());
        assertEquals(20122, total.getPagfic());
        assertEquals("DOM,DD,DOM", total.getTyptar());
        assertEquals("11,25,4", total.getNbplis());
        assertEquals("4719,365789,2640", total.getCoutot());
    }

    @Test
    void findCodeOrganismesByTypeR_ReturnsListOfCodes() {
        List<String> response = organismePersistenceImpl.findCodeOrganismesByTypeR();

        assertEquals(2, response.size());
        assertEquals("42C", response.get(0));
        assertEquals("971", response.get(1));
    }

    @Test
    void findCodeEnv_ReturnsListOfCodes() {
        List<String> response = environnementPersistenceImpl.findCodeEnv();

        assertEquals(2, response.size());
        assertEquals("P", response.get(0));
    }

    @Test
    void findCodeApp_ReturnsListOfCodes() {
        List<String> response = applicationPersistenceImpl.findCodeApp();

        assertEquals(2, response.size());
        assertEquals("CES", response.get(0));
    }

    @Test
    void findCodeApp_RetursnListOfCodes() {
        String codenv = "T";
        List<String> codorgs = List.of("42C");
        List<String> response = applicationPersistenceImpl.findCodeAppByEnvOrgs(codenv, codorgs);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("CES", response.get(0));
    }

    @Test
    void findTyptarFromGentar_ReturnsListOfTyptars() {
        List<String> response = facturationDetailleePersistenceImpl.findTyptarFromGentar();

        assertEquals(1, response.size());
        assertEquals("DOM", response.get(0));
    }

    @Test
    void test_searchConsolidationFacturation() {
        SearchConsolidationFacturationQuery query = new SearchConsolidationFacturationQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("42C"));
        query.setCodapp("CES");
        query.setPercod("230106-00");

        ConsolidationFacturationDTO dto = facturationDetailleePersistenceImpl.searchConsolidationFacturation(query);
        List<ConsolidationFacturation> response = dto.getConsolidationFacturationList();
        assertEquals(1, response.size());
        assertEquals("DOM", response.get(0).getTyptar());
        assertEquals(18954, response.get(0).getPlific());
        assertEquals("", dto.getMessage());

        query.setCodorg(List.of("00L"));
        query.setCodapp("MAS");
        query.setPercod("230331-00");
        query.setCodcom("MAS4");
        query.setCodfic("M4001");

        dto = facturationDetailleePersistenceImpl.searchConsolidationFacturation(query);
        response = dto.getConsolidationFacturationList();
        assertEquals(1, response.size());
        assertEquals("INTEGR", response.get(0).getCodsit());
        assertEquals("4719", response.get(0).getCoutot());
        assertEquals("", dto.getMessage());
    }

    @Test
    void test_updateConsolidationFacturation() {
        GenTar gentar = new GenTar();
        gentar.setCodenv("T");
        gentar.setCodorg("42C");
        gentar.setCodapp("CES");
        gentar.setPercod("230106-00");
        gentar.setCodcom("IPVT");
        gentar.setNumcom("00");
        gentar.setCodfic("CV02A");
        gentar.setTyptar("DOM");
        gentar.setNbplis(20);
        gentar.setCoutot(8580);
        facturationDetailleePersistenceImpl.updateConsolidationFacturation(gentar);
    }

    @Test
    void test_deleteConsolidationFacturation() {
        GenTar gentar = new GenTar();
        gentar.setCodenv("T");
        gentar.setCodorg("42C");
        gentar.setCodapp("CES");
        gentar.setPercod("230106-00");
        gentar.setCodcom("IPVT");
        gentar.setNumcom("00");
        gentar.setCodfic("CV02A");
        gentar.setTyptar("DOM");
        gentar.setNbplis(20);
        gentar.setCoutot(8580);
        facturationDetailleePersistenceImpl.deleteConsolidationFacturation(gentar);

        SearchConsolidationFacturationQuery query = new SearchConsolidationFacturationQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("42C"));
        query.setCodapp("CES");
        query.setPercod("230106-00");
        ConsolidationFacturationDTO dto = facturationDetailleePersistenceImpl.searchConsolidationFacturation(query);
        List<ConsolidationFacturation> response = dto.getConsolidationFacturationList();

        assertEquals(0, response.size());
    }

    @Test
    void test_recalculate_coutot_and_plific() {
        SearchConsolidationFacturationQuery query = new SearchConsolidationFacturationQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("42C"));
        query.setCodapp("CES");
        query.setPercod("230106-00");
        query.setCodcom("IPVT");
        query.setCodfic("CV02A");
        facturationDetailleePersistenceImpl.recalculateCout(query);
        facturationDetailleePersistenceImpl.recalculatePlific(query);
        ConsolidationFacturationDTO dto = facturationDetailleePersistenceImpl.searchConsolidationFacturation(query);
        List<ConsolidationFacturation> response = dto.getConsolidationFacturationList();

        assertEquals(1, response.size());
        assertEquals("DOM", response.get(0).getTyptar());
        assertEquals("5830", response.get(0).getCoutot());
        assertEquals(11, response.get(0).getPlific());
    }

    @Test
    void test_recalculate_coutot_and_plific_with_mas() {
        SearchConsolidationFacturationQuery query = new SearchConsolidationFacturationQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("00L"));
        query.setCodapp("MAS");
        query.setPercod("230331-00");
        query.setCodcom("MAS4");
        query.setCodfic("M4001");
        facturationDetailleePersistenceImpl.recalculateCout(query);
        facturationDetailleePersistenceImpl.recalculatePlific(query);
        ConsolidationFacturationDTO dto = facturationDetailleePersistenceImpl.searchConsolidationFacturation(query);
        List<ConsolidationFacturation> response = dto.getConsolidationFacturationList();

        assertEquals(1, response.size());
        assertEquals("DOM", response.get(0).getTyptar());
        assertEquals("5830", response.get(0).getCoutot());
        assertEquals(11, response.get(0).getPlific());
    }
}