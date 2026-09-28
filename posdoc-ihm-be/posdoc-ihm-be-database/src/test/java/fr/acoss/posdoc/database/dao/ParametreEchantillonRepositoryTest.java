package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.entities.ParametreEchantillonEntity;
import fr.acoss.posdoc.types.TypeEchantillon;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/parametre-echantillon-repository/insert-parametre-echantillon-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/parametre-echantillon-repository/clean-parametre-echantillon-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ParametreEchantillonRepositoryTest {

    @Autowired
    private ParametreEchantillonRepository parametreEchantillonRepository;

    private static ParametreEchantillonEntity findByReference(List<ParametreEchantillonEntity> parametres, String reference) {
        return parametres.stream()
                .filter(p -> reference.equals(p.getReference()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void selectAll_returnsAllParametresEchantillon() {
        final List<ParametreEchantillonEntity> parametres = parametreEchantillonRepository.selectAll();

        assertEquals(4, parametres.size());
        assertEquals(Set.of("E01", "E02", "E03", "E04"),
                parametres.stream().map(ParametreEchantillonEntity::getReference).collect(Collectors.toSet()));
    }

    @Test
    @Transactional
    void selectAll_setsIsNotAuthorisedToBeDeletedFalse_whenParametreHasNoFichier() {
        final var parametres = parametreEchantillonRepository.selectAll();
        assertFalse(findByReference(parametres, "E01").getIsNotAuthorisedToBeDeleted());
        assertFalse(findByReference(parametres, "E04").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void selectAll_setsIsNotAuthorisedToBeDeletedTrue_whenParametreHasOneFichier() {
        final var parametre = findByReference(parametreEchantillonRepository.selectAll(), "E02");
        assertTrue(parametre.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void selectAll_returnsCorrectScalarFields() {
        final var parametre = findByReference(parametreEchantillonRepository.selectAll(), "E02");

        assertEquals("E02", parametre.getReference());
        assertEquals(TypeEchantillon.PAGE, parametre.getType());
        assertNull(parametre.getNombreLots());
        assertEquals(5, parametre.getNombrePages());
        assertTrue(parametre.getRandom());
        assertEquals("formule E02", parametre.getFormule());
    }

    @Test
    @Transactional
    void selectAll_doesNotDuplicate_whenParametreHasMultipleFichiers() {
        final var parametres = parametreEchantillonRepository.selectAll();

        final long countE03 = parametres.stream()
                .filter(p -> "E03".equals(p.getReference()))
                .count();
        assertEquals(1, countE03);

        assertTrue(findByReference(parametres, "E03").getIsNotAuthorisedToBeDeleted());
    }
}
