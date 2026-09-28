package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.ExemplaireRepository;
import fr.acoss.posdoc.database.entities.ExemplaireEntity;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindExemplaireQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

@ActiveProfiles("test")
class TestExemplaireRepository {

    @Autowired
    private ExemplaireRepository exemplaireRepository;

    @Test
    void test_exemplaireExists() {
        ExemplaireExistsQuery query = new ExemplaireExistsQuery();
        query.setCodenv("T");
        query.setCodorg("750");
        query.setCodapp("SNV2");
        query.setCodcom("RDEH");
        query.setCodfic("L02");
        query.setCodgam("MA");
        query.setNumexe("0");
        query.setCodsit("CIRTIL");
        query.setCodres("MASSI");

        boolean result = exemplaireRepository.exemplaireExists(query);

        assertTrue(result);

        query.setCodenv("I");

        result = exemplaireRepository.ressourceExists(query);

        assertFalse(result);
    }

    @Test
    void test_findExemplaires() {
        FindExemplaireQuery query = new FindExemplaireQuery();
        query.setCodesEnv(List.of("T"));
        query.setCodesOrg(List.of("750"));
        query.setCodesApp(List.of("SNV2", "MAS"));
        query.setCodesCom(List.of("RDEH"));
        query.setCodesFic(List.of("L02"));
        query.setCodesGam(List.of("MA", "FT"));
        query.setCodesSit(List.of("CIRTIL"));
        query.setCodesRes(List.of("MASSI"));
        query.setCodesDes(null);

        List<ExemplaireEntity> result = exemplaireRepository.findExemplaires(query);

        assertFalse(result.isEmpty());
        assertEquals(2, result.size());
    }
}
