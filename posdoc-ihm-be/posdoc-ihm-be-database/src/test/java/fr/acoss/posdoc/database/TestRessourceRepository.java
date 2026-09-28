package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.RessourceRepository;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;
import fr.acoss.posdoc.types.Constantes;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestRessourceRepository {

  @Autowired
  private RessourceRepository ressourceRepository;

  @Test
  @Transactional
  void test_ressourcerepository() {
    final var all = ressourceRepository.findAll();
    assertNotNull(all);
    assertFalse(all.isEmpty());
  }

  @Test
  void findGamSitResByEnvOrgAppProfil_shouldReturnGenericRessourcesOfTheSiteOfTheOrganisme() {
    // L'organisme 117 est sur le site CIRTIL : seule la ressource générique de ce site est proposée
    SearchRessourceByEnvOrgAppProfilQuery query =
        new SearchRessourceByEnvOrgAppProfilQuery("T", "117", "SNV2", false);

    List<RessourceGamSitRes> result = ressourceRepository.findGamSitResByEnvOrgAppProfil(query, Constantes.GENERIC_ORGANISME);

    assertNotNull(result);
    assertEquals(1, result.size());
    assertGamSitRes(result.get(0), "MA", "CIRTIL", "AZTEST1");
  }

  @Test
  void findGamSitResByEnvOrgAppProfil_shouldIgnoreGenericRessourcesOfAnotherSite() {
    // L'organisme 770 est sur le site CIRSO : la ressource générique du site CIRTIL est écartée
    SearchRessourceByEnvOrgAppProfilQuery query =
        new SearchRessourceByEnvOrgAppProfilQuery("T", "770", "SNV2", false);

    List<RessourceGamSitRes> result = ressourceRepository.findGamSitResByEnvOrgAppProfil(query, Constantes.GENERIC_ORGANISME);

    assertNotNull(result);
    assertEquals(1, result.size());
    assertGamSitRes(result.get(0), "VG", "CIRSO", "GENRES");
  }

  @Test
  void findGamSitResByEnvOrgAppProfil_shouldNotRestrictTheSite_whenTheOrganismeHasNoSite() {
    // L'organisme 750 n'a pas de site : ses ressources et toutes les génériques sont proposées,
    // comme l'autorise le contrôle fait à la création d'un exemplaire
    SearchRessourceByEnvOrgAppProfilQuery query =
        new SearchRessourceByEnvOrgAppProfilQuery("T", "750", "SNV2", false);

    List<RessourceGamSitRes> result = ressourceRepository.findGamSitResByEnvOrgAppProfil(query, Constantes.GENERIC_ORGANISME);

    assertNotNull(result);
    assertEquals(3, result.size());
    assertGamSitRes(result.get(0), "MA", "CIRTIL", "AZTEST1");
    assertGamSitRes(result.get(1), "MA", "CIRTIL", "MASSI");
    assertGamSitRes(result.get(2), "VG", "CIRSO", "GENRES");
  }

  @Test
  void findGamSitResByEnvOrgAppProfil_shouldReturnEmptyList_whenNoRessourceMatchesEnvOrgApp() {
    SearchRessourceByEnvOrgAppProfilQuery query =
        new SearchRessourceByEnvOrgAppProfilQuery("D", "117", "SNV2", false);

    List<RessourceGamSitRes> result = ressourceRepository.findGamSitResByEnvOrgAppProfil(query, Constantes.GENERIC_ORGANISME);

    assertNotNull(result);
    assertEquals(0, result.size());
  }

  private void assertGamSitRes(RessourceGamSitRes actual, String codgam, String codsit, String codres) {
    assertEquals(codgam, actual.getCodgam());
    assertEquals(codsit, actual.getCodsit());
    assertEquals(codres, actual.getCodres());
  }
}
