package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import fr.acoss.posdoc.domain.premas.model.Premas;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static fr.acoss.posdoc.types.Statut.INVALIDE;
@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/premas/insert-premas.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/premas/clean-premas.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class PremasPersistenceImplTest {

    @Autowired
    private PremasPersistenceImpl premasPersistence;

    @Test
    void findPremas_ok() {
        FindPremasQuery query = new FindPremasQuery();
        query.setCodenv("p");
        query.setPercod("250101");
        List<Premas> result = premasPersistence.findPremas(query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        query.setCodapp("app");
        result = premasPersistence.findPremas(query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        query.setPresta("C");
        List<String> orgs = new ArrayList<>();
        orgs.add("117");
        query.setCodorgs(orgs);
        result = premasPersistence.findPremas(query);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void getDistinctEnvOrgAppFromPremas_ok() {
        List<DistinctEnvOrgAppModel> result = premasPersistence.getDistinctEnvOrgAppFromPremas();
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());
    }

    @Test
    void invaliderMassifications_single_ok() {
        List<InvalidateMassificationInput> massifications = new ArrayList<>();
        InvalidateMassificationInput input = new InvalidateMassificationInput();
        input.setCodenv("p");
        input.setCodorg("117");
        input.setCodapp("app");
        input.setPercod("250101-00");
        input.setCodcom("com");
        input.setCodfic("l00");
        input.setNumcom("00");
        massifications.add(input);

        FindPremasQuery query = new FindPremasQuery();
        query.setCodenv("p");
        query.setPercod("250101");

        List<Premas> result = premasPersistence.invaliderMassifications(massifications, query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        Premas invalidatedPremas = result.stream()
                .filter(p -> "117".equals(p.getCodorg()) && "l00".equals(p.getCodfic()))
                .findFirst()
                .orElse(null);
        assertNotNull(invalidatedPremas);
        assertEquals(INVALIDE, invalidatedPremas.getPresta());
    }

    @Test
    void invaliderMassifications_multiple_ok() {
        List<InvalidateMassificationInput> massifications = new ArrayList<>();

        InvalidateMassificationInput input1 = new InvalidateMassificationInput();
        input1.setCodenv("p");
        input1.setCodorg("117");
        input1.setCodapp("app");
        input1.setPercod("250101-00");
        input1.setCodcom("com");
        input1.setCodfic("l00");
        input1.setNumcom("00");
        massifications.add(input1);

        InvalidateMassificationInput input2 = new InvalidateMassificationInput();
        input2.setCodenv("p");
        input2.setCodorg("116");
        input2.setCodapp("app");
        input2.setPercod("250101-00");
        input2.setCodcom("com");
        input2.setCodfic("l02");
        input2.setNumcom("00");
        massifications.add(input2);

        FindPremasQuery query = new FindPremasQuery();
        query.setCodenv("p");
        query.setPercod("250101");

        List<Premas> result = premasPersistence.invaliderMassifications(massifications, query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        long invalidatedCount = result.stream()
                .filter(p -> INVALIDE.equals(p.getPresta()))
                .count();
        assertEquals(3, invalidatedCount);
    }

    @Test
    void invaliderMassifications_empty_list() {
        List<InvalidateMassificationInput> massifications = new ArrayList<>();

        FindPremasQuery query = new FindPremasQuery();
        query.setCodenv("p");
        query.setPercod("250101");

        List<Premas> result = premasPersistence.invaliderMassifications(massifications, query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        long invalidatedCount = result.stream()
                .filter(p -> INVALIDE.equals(p.getPresta()))
                .count();
        assertEquals(1, invalidatedCount);
    }

    @Test
    void invaliderMassifications_with_filter_query() {
        List<InvalidateMassificationInput> massifications = new ArrayList<>();
        InvalidateMassificationInput input = new InvalidateMassificationInput();
        input.setCodenv("p");
        input.setCodorg("117");
        input.setCodapp("app");
        input.setPercod("250101-00");
        input.setCodcom("com");
        input.setCodfic("l00");
        input.setNumcom("00");
        massifications.add(input);

        FindPremasQuery query = new FindPremasQuery();
        query.setCodenv("p");
        query.setPercod("250101");
        query.setCodapp("app");

        List<Premas> result = premasPersistence.invaliderMassifications(massifications, query);
        assertFalse(result.isEmpty());
        assertEquals(3, result.size());

        Premas invalidatedPremas = result.stream()
                .filter(p -> "117".equals(p.getCodorg()) && "l00".equals(p.getCodfic()))
                .findFirst()
                .orElse(null);
        assertNotNull(invalidatedPremas);
        assertEquals(INVALIDE, invalidatedPremas.getPresta());
    }
}
