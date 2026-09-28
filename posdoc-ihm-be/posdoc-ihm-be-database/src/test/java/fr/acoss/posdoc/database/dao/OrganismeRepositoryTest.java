package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.OrganismeEntity;
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
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/organisme-repository/insert-organisme-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/organisme-repository/clean-organisme-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class OrganismeRepositoryTest {

    @Autowired
    private OrganismeRepository organismeRepository;

    private static OrganismeEntity findByCode(List<OrganismeEntity> organismes, String code) {
        return organismes.stream()
                .filter(o -> code.equals(o.getCode()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findOrganismes_returnsAllOrganismes_orderedByCode() {
        final List<OrganismeEntity> organismes = organismeRepository.findOrganismes();

        assertEquals(6, organismes.size());
        assertEquals(List.of("100", "210", "750", "800", "850", "900"),
                organismes.stream().map(OrganismeEntity::getCode).collect(Collectors.toList()));
    }

    @Test
    @Transactional
    void findOrganismes_setsIsNotAuthorisedToBeDeletedFalse_whenOrganismeHasNeitherAppNorDestinataire() {
        final var organisme = findByCode(organismeRepository.findOrganismes(), "210");
        assertFalse(organisme.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findOrganismes_setsIsNotAuthorisedToBeDeletedTrue_whenOrganismeHasOnlyDestinataire() {
        final var organismes = organismeRepository.findOrganismes();
        assertTrue(findByCode(organismes, "750").getIsNotAuthorisedToBeDeleted());
        assertTrue(findByCode(organismes, "100").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findOrganismes_setsIsNotAuthorisedToBeDeletedTrue_whenOrganismeHasOnlyApplication() {
        final var organisme = findByCode(organismeRepository.findOrganismes(), "800");
        assertTrue(organisme.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findOrganismes_setsIsNotAuthorisedToBeDeletedTrue_whenOrganismeHasBothAppAndDestinataire() {
        final var organisme = findByCode(organismeRepository.findOrganismes(), "900");
        assertTrue(organisme.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findOrganismes_returnsCorrectScalarFields_forOrganismeWithChildren() {
        final var organisme = findByCode(organismeRepository.findOrganismes(), "750");

        assertEquals("750", organisme.getCode());
        assertEquals("URSSAF ILE DE FRANCE", organisme.getLibelle());
        assertEquals("R", organisme.getType());
        assertEquals("117", organisme.getCodeRegion());
        assertNotNull(organisme.getCodeSite());
    }

    @Test
    @Transactional
    void findOrganismes_doesNotDuplicate_whenOrganismeHasMultipleAppsOrDestinataires() {
        final var organismes = organismeRepository.findOrganismes();

        final long count850 = organismes.stream()
                .filter(o -> "850".equals(o.getCode()))
                .count();
        assertEquals(1, count850);

        assertTrue(findByCode(organismes, "850").getIsNotAuthorisedToBeDeleted());
    }
}
