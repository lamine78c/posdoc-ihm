package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.PapaadRepository;
import fr.acoss.posdoc.database.entities.PapaadCompositeIdEntity;
import fr.acoss.posdoc.domain.papaad.model.Papaad;
import fr.acoss.posdoc.domain.papaad.model.PapaadCompositeId;
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
@Sql(scripts = {"classpath:sql/papaad/insert-papaad.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/papaad/clean-papaad.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class PapaadPersistenceImplTest {

    @Autowired
    private PapaadPersistenceImpl papaadPersistence;

    @Autowired
    private PapaadRepository papaadRepository;

    @Test
    void selectAll_should_return_all_papaads() {
        List<Papaad> result = papaadPersistence.selectAll();

        assertNotNull(result);
        assertEquals(3, result.size());

        Papaad first = result.stream()
                .filter(p -> "COM1".equals(p.getCodeCommande())
                        && "FIC01".equals(p.getCodeFichier())
                        && "NOT1".equals(p.getCodeNotif()))
                .findFirst()
                .orElse(null);
        assertNotNull(first);
        assertEquals("Papaad Test 1", first.getLibelle());
    }

    @Test
    void exists_should_return_true_for_existing_papaad() {
        assertTrue(papaadPersistence.exists("COM1", "FIC01", "NOT1"));
        assertFalse(papaadPersistence.exists("COM1", "FIC01", "UNKNOWN"));
        assertFalse(papaadPersistence.exists("UNKNOWN", "UNKNOWN", "UNKNOWN"));
    }

    @Test
    @Transactional
    void create_should_insert_new_papaad() {
        Papaad newPapaad = new Papaad();
        newPapaad.setCodeCommande("COM1");
        newPapaad.setCodeFichier("FIC04");
        newPapaad.setCodeNotif("NOT4");
        newPapaad.setLibelle("Nouveau Papaad");
        newPapaad.setPeriode(false);
        newPapaad.setCodeRND("RND4");
        newPapaad.setAppPro("APP1");
        newPapaad.setTypeHas("HAS4");
        newPapaad.setFormat("FMT4");
        newPapaad.setNsTruc(false);
        newPapaad.setImprime(false);
        newPapaad.setHuissier(false);
        newPapaad.setNumNot(false);
        newPapaad.setStrRaf(false);
        newPapaad.setContrat(false);
        newPapaad.setMedele(false);
        newPapaad.setIdtbcc(false);

        Papaad created = papaadPersistence.create(newPapaad);

        assertNotNull(created);
        assertEquals("COM1", created.getCodeCommande());
        assertEquals("FIC04", created.getCodeFichier());
        assertEquals("NOT4", created.getCodeNotif());
        assertEquals("Nouveau Papaad", created.getLibelle());

        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC04", "NOT4")).isPresent());
    }

    @Test
    @Transactional
    void update_should_modify_existing_papaad() {
        Papaad toUpdate = new Papaad();
        toUpdate.setCodeCommande("COM1");
        toUpdate.setCodeFichier("FIC01");
        toUpdate.setCodeNotif("NOT1");
        toUpdate.setLibelle("Papaad Test 1 - Modifié");
        toUpdate.setPeriode(true);
        toUpdate.setCodeRND("RND1");
        toUpdate.setAppPro("APP1");
        toUpdate.setTypeHas("HAS1");
        toUpdate.setFormat("FMT1");
        toUpdate.setNsTruc(false);
        toUpdate.setImprime(false);
        toUpdate.setHuissier(false);
        toUpdate.setNumNot(false);
        toUpdate.setStrRaf(false);
        toUpdate.setContrat(false);
        toUpdate.setMedele(false);
        toUpdate.setIdtbcc(false);

        Papaad updated = papaadPersistence.update(toUpdate);

        assertNotNull(updated);
        assertEquals("Papaad Test 1 - Modifié", updated.getLibelle());
        assertTrue(updated.getPeriode());

        assertEquals("Papaad Test 1 - Modifié",
                papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC01", "NOT1"))
                        .orElseThrow()
                        .getLibelle());
    }

    @Test
    @Transactional
    void updateAll_should_modify_multiple_papaads() {
        Papaad p1 = new Papaad();
        p1.setCodeCommande("COM1");
        p1.setCodeFichier("FIC01");
        p1.setCodeNotif("NOT1");
        p1.setLibelle("Batch 1");
        p1.setPeriode(false);
        p1.setCodeRND("RND1");
        p1.setAppPro("APP1");
        p1.setTypeHas("HAS1");
        p1.setFormat("FMT1");
        p1.setNsTruc(false);
        p1.setImprime(false);
        p1.setHuissier(false);
        p1.setNumNot(false);
        p1.setStrRaf(false);
        p1.setContrat(false);
        p1.setMedele(false);
        p1.setIdtbcc(false);

        Papaad p2 = new Papaad();
        p2.setCodeCommande("COM1");
        p2.setCodeFichier("FIC02");
        p2.setCodeNotif("NOT2");
        p2.setLibelle("Batch 2");
        p2.setPeriode(false);
        p2.setCodeRND("RND2");
        p2.setAppPro("APP1");
        p2.setTypeHas("HAS2");
        p2.setFormat("FMT2");
        p2.setNsTruc(false);
        p2.setImprime(false);
        p2.setHuissier(false);
        p2.setNumNot(false);
        p2.setStrRaf(false);
        p2.setContrat(false);
        p2.setMedele(false);
        p2.setIdtbcc(false);

        List<Papaad> result = papaadPersistence.updateAll(List.of(p1, p2));

        assertNotNull(result);
        assertEquals(2, result.size());

        assertEquals("Batch 1",
                papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC01", "NOT1")).orElseThrow().getLibelle());
        assertEquals("Batch 2",
                papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC02", "NOT2")).orElseThrow().getLibelle());
    }

    @Test
    @Transactional
    void deleteAll_should_remove_papaads_by_composite_ids() {
        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC02", "NOT2")).isPresent());
        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC03", "NOT3")).isPresent());

        List<PapaadCompositeId> toDelete = List.of(
                new PapaadCompositeId("COM1", "FIC02", "NOT2"),
                new PapaadCompositeId("COM1", "FIC03", "NOT3")
        );

        papaadPersistence.deleteAll(toDelete);

        assertFalse(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC02", "NOT2")).isPresent());
        assertFalse(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC03", "NOT3")).isPresent());
        assertTrue(papaadRepository.findById(new PapaadCompositeIdEntity("COM1", "FIC01", "NOT1")).isPresent());
    }
}
