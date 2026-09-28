package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.genetp.model.EnvOrgsQuery;
import fr.acoss.posdoc.domain.genetp.model.ResGamSit;
import fr.acoss.posdoc.domain.genetp.model.RessGammSite;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesDTO;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesSearchQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;


@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/volumes-traites/insert-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/volumes-traites/clean-volumes-traites.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class VolumesTraitesPersistenceImplTest {
    @Autowired
    private GenEtpPersistenceImpl genEtpPersistence;

    @Test
    void testDoSearchVolumesTraites() {
        VolumesTraitesSearchQuery query = new VolumesTraitesSearchQuery();
        query.setCodEnv("P");
        List<String> orgs = new ArrayList<>();
        orgs.add("750");
        query.setCodOrgs(orgs);
        query.setFromDate("2014-01-01 00:00:00");
        query.setToDate("2025-02-25 23:59:59");
        List<RessGammSite> resGamSitList = new ArrayList<>();
        resGamSitList.add(new RessGammSite("COLI-ORG", "FT", "CIRSO"));
        query.setResGamSitList(resGamSitList);

        VolumesTraitesDTO response = genEtpPersistence.getVolumesTraitesByCriteres(query);
        assertEquals(2, response.getVolumesTraitesList().size());
        assertEquals(20, response.getVolumesTraitesList().get(0).getSumpagfic());
    }

    @Test
    void testGetDistinctEnvs() {
        List<String> response = genEtpPersistence.getDistinctEnvs();
        assertEquals(1, response.size());
    }

    @Test
    void testGetDistinctOrgs() {
        List<String> response = genEtpPersistence.getDistinctOrgs();
        assertEquals(1, response.size());
    }

    @Test
    void testGetGamSitResByEnvOrgs() {
        EnvOrgsQuery query = new EnvOrgsQuery();
        query.setCodeEnv("P");
        query.setCodesOrg(List.of("750"));
        List<ResGamSit> response = genEtpPersistence.getGamSitResByEnvOrgs(query);
        assertEquals(1, response.size());
    }
}
