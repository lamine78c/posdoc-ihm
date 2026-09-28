package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.SiteCNPEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/sitecnp-repository/insert-sitecnp-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/sitecnp-repository/clean-sitecnp-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class SiteCNPRepositoryTest {

    @Autowired
    private SiteCNPRepository siteCNPRepository;

    private static SiteCNPEntity findByCode(List<SiteCNPEntity> sites, String code) {
        return sites.stream()
                .filter(s -> code.equals(s.getCode()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsAllSites_orderedByCode() {
        final List<SiteCNPEntity> sites = siteCNPRepository.findAllByOrderByCodeAsc();

        assertEquals(4, sites.size());
        assertEquals(List.of("S01", "S02", "S03", "S04"),
                sites.stream().map(SiteCNPEntity::getCode).collect(Collectors.toList()));
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedFalse_whenSiteHasNoOrganisme() {
        final var sites = siteCNPRepository.findAllByOrderByCodeAsc();

        assertFalse(findByCode(sites, "S01").getIsNotAuthorisedToBeDeleted());
        assertFalse(findByCode(sites, "S04").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedTrue_whenSiteHasOneOrganisme() {
        final var site = findByCode(siteCNPRepository.findAllByOrderByCodeAsc(), "S02");

        assertTrue(site.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsCorrectScalarFields() {
        final var site = findByCode(siteCNPRepository.findAllByOrderByCodeAsc(), "S02");

        assertEquals("S02", site.getCode());
        assertEquals("host02", site.getHost());
        assertEquals("user02", site.getUsername());
        assertEquals("pwd02", site.getPassword());
        assertEquals("RES00002", site.getRessourceDelestage());
        assertEquals("002", site.getOrganismeMassification());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_doesNotDuplicate_whenSiteHasMultipleOrganismes() {
        final var sites = siteCNPRepository.findAllByOrderByCodeAsc();

        final long countS03 = sites.stream()
                .filter(s -> "S03".equals(s.getCode()))
                .count();
        assertEquals(1, countS03);

        assertTrue(findByCode(sites, "S03").getIsNotAuthorisedToBeDeleted());
    }
}
