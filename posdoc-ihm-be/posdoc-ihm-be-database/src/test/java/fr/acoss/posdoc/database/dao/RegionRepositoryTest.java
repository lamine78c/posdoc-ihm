package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.RegionEntity;
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
@Sql(scripts = {"classpath:sql/region-repository/insert-region-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/region-repository/clean-region-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class RegionRepositoryTest {

    @Autowired
    private RegionRepository regionRepository;

    private static RegionEntity findByCode(List<RegionEntity> regions, String code) {
        return regions.stream()
                .filter(r -> code.equals(r.getCode()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsAllRegions_orderedByCode() {
        final List<RegionEntity> regions = regionRepository.findAllByOrderByCodeAsc();

        assertEquals(4, regions.size());
        assertEquals(List.of("R01", "R02", "R03", "R04"),
                regions.stream().map(RegionEntity::getCode).collect(Collectors.toList()));
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedFalse_whenRegionHasNoOrganisme() {
        final var regions = regionRepository.findAllByOrderByCodeAsc();

        assertFalse(findByCode(regions, "R01").getIsNotAuthorisedToBeDeleted());
        assertFalse(findByCode(regions, "R04").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedTrue_whenRegionHasOneOrganisme() {
        final var region = findByCode(regionRepository.findAllByOrderByCodeAsc(), "R02");

        assertTrue(region.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsCorrectScalarFields() {
        final var region = findByCode(regionRepository.findAllByOrderByCodeAsc(), "R02");

        assertEquals("R02", region.getCode());
        assertEquals("REGION AVEC UN ORGANISME", region.getLibelle());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_doesNotDuplicate_whenRegionHasMultipleOrganismes() {
        final var regions = regionRepository.findAllByOrderByCodeAsc();

        final long countR03 = regions.stream()
                .filter(r -> "R03".equals(r.getCode()))
                .count();
        assertEquals(1, countR03);

        assertTrue(findByCode(regions, "R03").getIsNotAuthorisedToBeDeleted());
    }
}
