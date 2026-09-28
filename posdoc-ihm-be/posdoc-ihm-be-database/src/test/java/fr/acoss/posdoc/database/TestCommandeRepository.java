package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.CommandeRepository;
import fr.acoss.posdoc.database.entities.CommandeCompositeId;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestCommandeRepository {

    @Autowired
    private CommandeRepository commandeRepository;


    @Test
    @Transactional
    void testCompareCommandeRepository() {
        final var all = commandeRepository.compareCommandes(
                List.of("T", "N"), List.of("510", "100"), List.of("SNV2", "TEST")
        );

        assertNotNull(all);
        assertFalse(all.isEmpty());

        assertEquals(1, all.size());
        assertEquals("SNV2", all.get(0).get("application"));
        assertEquals("100", all.get(0).get("organisme"));
        assertEquals("217", all.get(0).get("codereg"));
        assertEquals("TY25", all.get(0).get("sorthelper"));
        assertEquals(List.of("T"), Arrays.asList(all.get(0).get("environnements").split(",")));
    }

    @Test
    void findCommandesByAppTest() {
        final var results = commandeRepository.findCommandesByApp(
                "T", List.of("750", "100"), List.of("SNV2")
        );
        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals(true, results.get(0).getIsNotAuthorisedToBeDeleted());
        assertEquals(true, results.get(1).getIsNotAuthorisedToBeDeleted());
    }

    @Test
    void findAllByIdTest() {
        final var results = commandeRepository.findAllById(
                List.of(new CommandeCompositeId("T", "750", "SNV2", "RDEH"))
        );
        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void getDistinctApplicationTest() {
        final var results = commandeRepository.getDistinctApplication();
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void existsByCodeTest() {
        boolean results = commandeRepository.existsByCode("RDEH");
        assertTrue(results);

        results = commandeRepository.existsByCode("RZEH");
        assertFalse(results);
    }

    @Test
    void findDistinctEnvsByAppTest() {
        final var results = commandeRepository.findDistinctEnvsByApp("SNV2");
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void findDistinctCommByAppEnvTest() {
        final var results = commandeRepository.findDistinctCommByAppEnv("SNV2", List.of("T", "N"));
        assertNotNull(results);
        assertEquals(3, results.size());
    }

    @Test
    void deleteByIdInTest() {
        final CommandeCompositeId id = new CommandeCompositeId("T", "750", "SNV2", "RDEH");
        var commande = commandeRepository.findById(id);
        assertTrue(commande.isPresent());
        commandeRepository.deleteByIdIn(List.of(id));
        commande = commandeRepository.findById(id);
        assertFalse(commande.isPresent());
    }

    @Test
    void applicationExistInCommandeTest() {
        boolean results = commandeRepository.applicationExistInCommande("SNV2", "117", "N");
        assertFalse(results);

        results = commandeRepository.applicationExistInCommande("SNV2", "750", "N");
        assertTrue(results);
    }

    @Test
    void findCommandByPropTest() {
        final var results = commandeRepository.findCommandByProp(List.of("T", "N"), "SNV2", "RDEH");
        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void getDistinctEnvironnementTest() {
        final var results = commandeRepository.getDistinctEnvironnement();
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void findDistOrgByEnvTest() {
        final var results = commandeRepository.findDistOrgByEnv(List.of("T", "N"));
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void findDistAppByEnvOrgTest() {
        final var results = commandeRepository.findDistAppByEnvOrg(List.of("T", "N"), List.of("750", "100"));
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void findDistOrgByEnvsAndAppsFromCommandeTest() {
        final var results = commandeRepository.findDistOrgByEnvsAndAppsFromCommande(
                List.of("T", "N"), List.of("SNV2", "TEST")
        );
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void findDistAppByEnvsFromCommandeTest() {
        final var results = commandeRepository.findDistAppByEnvsFromCommande(List.of("T", "N"));
        assertNotNull(results);
        assertEquals(2, results.size());
    }

    @Test
    void getCommandesByEnvsOrgsAppsTest() {
        final var results = commandeRepository.getCommandesByEnvsOrgsApps(
                List.of("T", "N"), List.of("750", "100"), "SNV2"
        );
        assertNotNull(results);
        assertEquals(3, results.size());
    }

    @Test
    void findPreselectedCommandeTest() {
        final var results = commandeRepository.findPreselectedCommande(
                List.of("T", "N"), List.of("750", "100"), "SNV2"
        );
        assertNotNull(results);
        assertEquals(3, results.size());
    }

    @Test
    void getCodLibCommandeByEnvOrgAppTest() {
        final var results = commandeRepository.getCodLibCommandeByEnvOrgApp(
                new CommandeFiltersPayload("T", "750", "SNV2")
        );
        assertNotNull(results);
        assertEquals(1, results.size());
    }
}
