package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.dao.ParametreRepository;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import fr.acoss.posdoc.domain.genfic.model.ReeditionMassification;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

@ActiveProfiles("test")
class FicRepositoryTest {

    @Autowired
    private GenFicRepository genFicRepository;

    @Autowired
    private ParametreRepository parametreRepository;

    @Test
    @Transactional
    void test_searchReeditionParMassification() {
        List<String> codorgs = new ArrayList<>();
        codorgs.add("750");
        String masgam = parametreRepository.getValueByCode("MASGAM");
        String masapp = parametreRepository.getValueByCode("MASAPP");
        SearchReeditionParMassificationQuery searchReeditionQuery = new SearchReeditionParMassificationQuery();
        searchReeditionQuery.setCodorg(codorgs);
        searchReeditionQuery.setMasgam(masgam);
        searchReeditionQuery.setMasapp(masapp);
        searchReeditionQuery.setCodenv("T");
        searchReeditionQuery.setPeriode("240523-00");
        searchReeditionQuery.setCodcom("RDEH");

        List<ReeditionMassification> result = genFicRepository.searchReeditionParMassification(searchReeditionQuery );

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void test_findGenfic() {
        SearchExpeditionQuery query = new SearchExpeditionQuery();
        query.setCodenv("T");
        query.setCodorg(List.of("750"));
        query.setCodapp("SNV2");
        List<Map<String, String>> result = genFicRepository.findGenficInnerJoinGentar(query);
        assertTrue(result.isEmpty());
    }
}
