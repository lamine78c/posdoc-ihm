package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.GenEtpRepository;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.types.GenEtpType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

@ActiveProfiles("test")
class TestGenEtpRepository {

    @Autowired
    private GenEtpRepository genEtpRepository;

    @Test
    void test_searchOccurrenceEtape() {
        List<String> codorgs = new ArrayList<>();
        codorgs.add("750");
        OccurrenceEtapePayload payload = new OccurrenceEtapePayload();
        payload.setCodenv("T");
        payload.setCodorg(codorgs);
        payload.setCodapp("SNV2");
        payload.setPercod("240523-00");
        payload.setCodcom("RDEH");
        payload.setCodsit(null);
        payload.setCodfic("L02");
        payload.setCodgam("FT");
        payload.setCodres("codres");
        payload.setCodser(null);
        payload.setTypetp(GenEtpType.DIS);
        payload.setStatut(null);
        payload.setCodver(null);
        payload.setTypdat("Début");
        payload.setDatdeb("2023-02-19 17:38:13");
        payload.setDatfin("2024-09-16 23:40:13");

        List<GenEtp> result = genEtpRepository.searchOccurrenceEtape(payload, List.of(payload.getTypetp()));

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getId());

        payload.setCodorg(codorgs);
        payload.setStatut("S");
        payload.setTypetp(GenEtpType.FIN);

        result = genEtpRepository.searchOccurrenceEtapeWithTypdatDatdebDatfin(payload, List.of(payload.getTypetp()), payload.getDatdeb(), payload.getDatfin());

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getId());
    }
}
