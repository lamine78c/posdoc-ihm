package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
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
@Sql(scripts = {"classpath:sql/fichier-repository/insert-fichier-repository.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/fichier-repository/clean-fichier-repository.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class FichierRepositoryTest {

    @Autowired
    private FichierRepository fichierRepository;

    private static Fichier findByCodeFich(List<Fichier> fichiers, String codeFich) {
        return fichiers.stream()
                .filter(f -> codeFich.equals(f.getCodeFich()))
                .findFirst()
                .orElseThrow();
    }

    @Test
    @Transactional
    void findFichiers_returnsAllFichiers_orderedByCodeFichDesc() {
        final List<Fichier> fichiers = fichierRepository.findFichiers();

        assertEquals(6, fichiers.size());
        final List<String> codesOrdered = fichiers.stream()
                .map(Fichier::getCodeFich)
                .collect(Collectors.toList());
        assertEquals(List.of("F0090", "F0050", "F0010", "F0003", "F0002", "F0001"), codesOrdered);
    }

    @Test
    @Transactional
    void findFichiers_setsIsNotAuthorisedToBeDeletedFalse_whenFichierHasNoProduit() {
        final var fichier = findByCodeFich(fichierRepository.findFichiers(), "F0001");
        assertFalse(fichier.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findFichiers_setsIsNotAuthorisedToBeDeletedTrue_whenFichierHasOneProduit() {
        final var fichier = findByCodeFich(fichierRepository.findFichiers(), "F0002");
        assertTrue(fichier.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findFichiers_doesNotDuplicate_whenFichierHasMultipleProduits() {
        final var fichiers = fichierRepository.findFichiers();

        final long countF03 = fichiers.stream()
                .filter(f -> "F0003".equals(f.getCodeFich()))
                .count();
        assertEquals(1, countF03);
        assertTrue(findByCodeFich(fichiers, "F0003").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findFichiers_returnsCorrectScalarFields_forKnownFichier() {
        final var fichier = findByCodeFich(fichierRepository.findFichiers(), "F0002");

        assertEquals("T", fichier.getCodeEnv());
        assertEquals("902", fichier.getCodeOrg());
        assertEquals("AP02", fichier.getCodeApp());
        assertEquals("CM02", fichier.getCodeCom());
        assertEquals("F0002", fichier.getCodeFich());
        assertEquals("FICHIER 1 PRODUIT", fichier.getLibFichier());
        assertEquals("V90R", fichier.getRefImprime());
        assertEquals("PC52C", fichier.getCodeProd());
        assertEquals("661", fichier.getRefFormat());
        assertEquals("V", fichier.getTypeFormat());
        assertEquals("CLI2", fichier.getCodeClient());
        assertEquals("V", fichier.getTypeSig());
        assertEquals("-", fichier.getTypeMultif());
        assertEquals("S", fichier.getTypeSupport());
        assertEquals("301", fichier.getRefSupport());
        assertEquals("DOC2", fichier.getCodeDocument());
        assertNotNull(fichier.getPage());
        assertNotNull(fichier.getEclatement());
    }

    private static SearchFichierFilterQuery query(List<String> codenvs, List<String> codorgs, String codapp, String codcom, String codfic) {
        return new SearchFichierFilterQuery(codenvs, codorgs, codapp, codcom, codfic);
    }

    @Test
    @Transactional
    void findPreselectedFichier_filtersByEnvAndOrg() {
        final List<Fichier> fichiers = fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("904"), null, null, null));

        final List<String> codes = fichiers.stream()
                .map(Fichier::getCodeFich)
                .collect(Collectors.toList());
        assertEquals(List.of("F0010", "F0050", "F0090"), codes);
    }

    @Test
    @Transactional
    void findPreselectedFichier_filtersByApp_whenCodappProvided() {
        final List<Fichier> fichiers = fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("901", "902"), "AP02", null, null));

        assertEquals(1, fichiers.size());
        assertEquals("F0002", fichiers.get(0).getCodeFich());
    }

    @Test
    @Transactional
    void findPreselectedFichier_filtersByCom_whenCodcomProvided() {
        final List<Fichier> fichiers = fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("901", "902", "903"), null, "CM03", null));

        assertEquals(1, fichiers.size());
        assertEquals("F0003", fichiers.get(0).getCodeFich());
    }

    @Test
    @Transactional
    void findPreselectedFichier_setsIsNotAuthorisedToBeDeletedFalse_whenFichierHasNoProduit() {
        final var fichier = findByCodeFich(fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("901"), null, null, null)), "F0001");
        assertFalse(fichier.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findPreselectedFichier_setsIsNotAuthorisedToBeDeletedTrue_whenFichierHasOneProduit() {
        final var fichier = findByCodeFich(fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("902"), null, null, null)), "F0002");
        assertTrue(fichier.getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findPreselectedFichier_doesNotDuplicate_whenFichierHasMultipleProduits() {
        final var fichiers = fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("903"), null, null, null));

        final long countF03 = fichiers.stream()
                .filter(f -> "F0003".equals(f.getCodeFich()))
                .count();
        assertEquals(1, countF03);
        assertTrue(findByCodeFich(fichiers, "F0003").getIsNotAuthorisedToBeDeleted());
    }

    @Test
    @Transactional
    void findPreselectedFichier_ordersByCodeComCodeFichAsc() {
        final List<Fichier> fichiers = fichierRepository.findPreselectedFichier(
                query(List.of("T"), List.of("901", "902", "903", "904"), null, null, null));

        final List<String> codesOrdered = fichiers.stream()
                .map(Fichier::getCodeFich)
                .collect(Collectors.toList());
        assertEquals(List.of("F0001", "F0002", "F0003", "F0010", "F0050", "F0090"), codesOrdered);
    }
}
