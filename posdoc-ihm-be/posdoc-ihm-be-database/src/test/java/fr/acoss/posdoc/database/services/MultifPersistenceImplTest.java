package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.MultifRepository;
import fr.acoss.posdoc.domain.multif.model.Multif;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/multif/insert-multif.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/multif/clean-multif.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class MultifPersistenceImplTest {

    @Autowired
    private MultifPersistenceImpl multifPersistence;

    @Autowired
    private MultifRepository multifRepository;

    @Test
    void selectAll_should_return_all_multifs_with_deletion_flag() {
        List<Multif> result = multifPersistence.selectAll();

        assertNotNull(result);
        assertEquals(3, result.size());

        // Multif 'X' est référencé par un fichier → isNotAuthorisedToBeDeleted = true
        Multif multifX = result.stream()
                .filter(m -> "X".equals(m.getCode()))
                .findFirst()
                .orElse(null);
        assertNotNull(multifX);
        assertEquals("Multif Test X", multifX.getLibelle());
        assertTrue(multifX.getIsNotAuthorisedToBeDeleted());

        // Multif 'Y' n'est pas référencé → isNotAuthorisedToBeDeleted = false
        Multif multifY = result.stream()
                .filter(m -> "Y".equals(m.getCode()))
                .findFirst()
                .orElse(null);
        assertNotNull(multifY);
        assertFalse(multifY.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void create_should_insert_new_multif() {
        Multif newMultif = new Multif();
        newMultif.setCode("W");
        newMultif.setLibelle("Nouveau Multif W");

        Multif created = multifPersistence.create(newMultif);

        assertNotNull(created);
        assertEquals("W", created.getCode());
        assertEquals("Nouveau Multif W", created.getLibelle());
        assertTrue(multifRepository.findById("W").isPresent());
    }

    @Test
    @Transactional
    void update_should_modify_existing_multif() {
        Multif toUpdate = new Multif();
        toUpdate.setCode("X");
        toUpdate.setLibelle("Multif Test X - Modifié");

        Multif updated = multifPersistence.update(toUpdate);

        assertNotNull(updated);
        assertEquals("X", updated.getCode());
        assertEquals("Multif Test X - Modifié", updated.getLibelle());
        assertEquals("Multif Test X - Modifié", multifRepository.findById("X").orElseThrow().getLibelle());
    }

    @Test
    @Transactional
    void deleteAll_should_remove_multifs_by_codes() {
        assertTrue(multifRepository.findById("Y").isPresent());
        assertTrue(multifRepository.findById("Z").isPresent());

        multifPersistence.deleteAll(List.of("Y", "Z"));

        assertFalse(multifRepository.findById("Y").isPresent());
        assertFalse(multifRepository.findById("Z").isPresent());
        assertTrue(multifRepository.findById("X").isPresent());
    }

    @Test
    void exists_should_return_true_for_existing_multif() {
        assertTrue(multifPersistence.exists("X"));
        assertFalse(multifPersistence.exists("UNKNOWN"));
    }
}
