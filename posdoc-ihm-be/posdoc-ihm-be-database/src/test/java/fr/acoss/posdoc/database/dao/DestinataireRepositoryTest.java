package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/destinataire-repository/insert-destinataire-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/destinataire-repository/clean-destinataire-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class DestinataireRepositoryTest {

    @Autowired
    private DestinataireRepository destinataireRepository;

    private static Destinataire findByCode(List<Destinataire> destins, String codeOrg, String code) {
        return destins.stream()
                .filter(d -> codeOrg.equals(d.getCodeOrg()) && code.equals(d.getCode()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findAllDestins_returnsAllDestins() {
        final List<Destinataire> destins = destinataireRepository.findAllDestins();

        assertEquals(4, destins.size());
    }

    @Test
    @Transactional
    void findAllDestins_setsIsNotAuthorisedToBeDeletedFalse_whenDestinHasNoExemplaire() {
        final var destins = destinataireRepository.findAllDestins();

        assertFalse(findByCode(destins, "OR1", "D01").getIsNotAuthorisedToBeDeleted());
        assertFalse(findByCode(destins, "OR2", "D04").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllDestins_setsIsNotAuthorisedToBeDeletedTrue_whenDestinHasOneExemplaire() {
        final var destin = findByCode(destinataireRepository.findAllDestins(), "OR1", "D02");

        assertTrue(destin.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findAllDestins_returnsCorrectScalarFields() {
        final var destins = destinataireRepository.findAllDestins();

        final var d02 = findByCode(destins, "OR1", "D02");
        assertEquals("OR1", d02.getCodeOrg());
        assertEquals("D02", d02.getCode());
        assertEquals("DEST AVEC UN EXEMPLAIRE", d02.getLibelle());
        assertEquals("REF-D02", d02.getRefPri());

        final var d03 = findByCode(destins, "OR1", "D03");
        assertNull(d03.getRefPri());
    }

    @Test
    @Transactional
    void findAllDestins_doesNotDuplicate_whenDestinHasMultipleExemplaires() {
        final var destins = destinataireRepository.findAllDestins();

        final long countD03 = destins.stream()
                .filter(d -> "OR1".equals(d.getCodeOrg()) && "D03".equals(d.getCode()))
                .count();
        assertEquals(1, countD03);

        assertTrue(findByCode(destins, "OR1", "D03").getIsNotAuthorisedToBeDeleted());
    }
}
