package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.VerrouEntity;
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
@Sql(scripts = {"classpath:sql/verrou-repository/insert-verrou-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/verrou-repository/clean-verrou-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class VerrouRepositoryTest {

    @Autowired
    private VerrouRepository verrouRepository;

    private static VerrouEntity findByCode(List<VerrouEntity> verrous, String code) {
        return verrous.stream()
                .filter(v -> code.equals(v.getCode()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsAllVerrous_orderedByCode() {
        final List<VerrouEntity> verrous = verrouRepository.findAllByOrderByCodeAsc();

        assertEquals(4, verrous.size());
        assertEquals(List.of("A", "B", "C", "D"),
                verrous.stream().map(VerrouEntity::getCode).collect(Collectors.toList()));
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedFalse_whenVerrouHasNoGamme() {
        final var verrous = verrouRepository.findAllByOrderByCodeAsc();
        assertFalse(findByCode(verrous, "A").getIsNotAuthorisedToBeDeleted());
        assertFalse(findByCode(verrous, "D").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_setsIsNotAuthorisedToBeDeletedTrue_whenVerrouHasOneGamme() {
        final var verrou = findByCode(verrouRepository.findAllByOrderByCodeAsc(), "B");
        assertTrue(verrou.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_returnsCorrectScalarFields() {
        final var verrou = findByCode(verrouRepository.findAllByOrderByCodeAsc(), "B");

        assertEquals("B", verrou.getCode());
        assertEquals("VERROU AVEC UNE GAMME", verrou.getLibelle());
        assertEquals(5, verrou.getMaxExecution());
    }

    @Test
    @Transactional
    void findAllByOrderByCodeAsc_doesNotDuplicate_whenVerrouHasMultipleGammes() {
        final var verrous = verrouRepository.findAllByOrderByCodeAsc();

        final long countC = verrous.stream()
                .filter(v -> "C".equals(v.getCode()))
                .count();
        assertEquals(1, countC);

        assertTrue(findByCode(verrous, "C").getIsNotAuthorisedToBeDeleted());
    }
}
