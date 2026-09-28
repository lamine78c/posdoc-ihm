package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichierCodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireRessource;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ExemplairePersistenceImplTest {

  @Autowired
  private ExemplairePersistence exemplairePersistence;

  @Test
  void findDistFicByEnvOrgAppCom_shouldReturnMappedDTOs_whenResultsArePresent() {
    List<String> codesEnv = new ArrayList<>();
    codesEnv.add("I");
    codesEnv.add("P");
    List<String> codesOrg = new ArrayList<>();
    codesOrg.add("010");
    codesOrg.add("973");
    List<String> codesApp = new ArrayList<>();
    codesApp.add("SNV2");
    List<String> codesCom = new ArrayList<>();
    codesCom.add("EI02");
    final var query = new ExemplaireByFilterQuery();
    query.setCodesEnv(codesEnv);
    query.setCodesOrg(codesOrg);
    query.setCodesApp(codesApp);
    query.setCodesCom(codesCom);

    List<ExemplaireFichierCodficRefimpCodprdDTO> response = exemplairePersistence.findDistFicByEnvOrgAppCom(query);

    assertNotNull(response);

    assertEquals(2, response.size());
    assertEquals("L01", response.get(0).getCodfic());
    assertEquals("QD14", response.get(0).getRefImprime());
    assertEquals("QD14E", response.get(0).getCodeProd());
    assertEquals("L02", response.get(1).getCodfic());
    assertEquals("V90R", response.get(1).getRefImprime());
    assertEquals("PC52C", response.get(1).getCodeProd());
  }

  @Test
  void findDistFicByEnvOrgAppCom_shouldReturnEmptyList_whenNoResultsArePresent() {
    ExemplaireByFilterQuery query = new ExemplaireByFilterQuery();

    List<ExemplaireFichierCodficRefimpCodprdDTO> result = exemplairePersistence.findDistFicByEnvOrgAppCom(query);

    assertNotNull(result);
    assertEquals(0, result.size());
  }

  @Test
  void test_getParametresEditionByRessources() {
    ExemplaireByRessourceQuery query = new ExemplaireByRessourceQuery();
    query.setCodenv("T");
    query.setCodorgs(List.of("010", "750"));
    query.setCodapp("SNV2");
    query.setCodcom("RDEH");
    query.setCodfics(List.of("L02"));
    query.setRessources(List.of("MA/CIRTIL/MASSI", "FT/CIRTIL/MASSI"));
    query.setIsRessourcesAbsentes(true);
    List<ExemplaireByResource> result = exemplairePersistence.getParametresEditionByRessource(query, "OGUORG");

    assertNotNull(result);
    assertEquals(1, result.size());
    assertEquals("RECTO-SIMPLE", result.get(0).getMessage());
    List<ExemplaireRessource> ressources = result.get(0).getRessources();
    assertEquals(1, ressources.size());
    assertEquals("MASSI", ressources.get(0).getCodres());
    assertEquals("CIRTIL", ressources.get(0).getCodsit());
    assertEquals(true, ressources.get(0).getEtat());
    assertEquals("DESTI", ressources.get(0).getCoddes());
  }

  @Test
  void getParametresEditionByRessources_shouldNotReturnGenericRessource_whenOrganismeSiteDiffers() {
    ExemplaireByRessourceQuery query = new ExemplaireByRessourceQuery();
    query.setCodenv("T");
    query.setCodorgs(List.of("117", "770", "780"));
    query.setCodapp("SNV2");
    query.setCodcom("AZAZ");
    query.setCodfics(List.of("NC29"));
    query.setRessources(List.of("MA/CIRTIL/AZTEST1"));
    query.setIsRessourcesAbsentes(true);
    List<ExemplaireByResource> result = exemplairePersistence.getParametresEditionByRessource(query, "999");

    assertNotNull(result);
    assertEquals(3, result.size());

    // 117 (CIRTIL) : la ressource générique CIRTIL est proposée, exemplaire existant
    ExemplaireByResource org117 = result.get(0);
    assertEquals("117", org117.getCodorg());
    assertEquals(1, org117.getRessources().size());
    assertEquals(true, org117.getRessources().get(0).getExemplaireExists());

    // 770 (CIRSO) : exemplaire déjà créé sur la ressource CIRTIL -> reste visible pour suppression
    ExemplaireByResource org770 = result.get(1);
    assertEquals("770", org770.getCodorg());
    assertEquals(1, org770.getRessources().size());
    assertEquals(true, org770.getRessources().get(0).getExemplaireExists());

    // 780 (CIRSO) : pas d'exemplaire -> la ressource générique CIRTIL ne doit pas être proposée
    ExemplaireByResource org780 = result.get(2);
    assertEquals("780", org780.getCodorg());
    assertEquals(0, org780.getRessources().size());
  }

  @Test
  void test_getNumexeFromExemplaire() {
    ExemplaireComposite id = new ExemplaireComposite();
    id.setCodenv("P");
    id.setCodorg("010");
    id.setCodapp("SNV2");
    id.setCodcom("EI02");
    id.setCodfic("L02");
    id.setCodgam("ST");
    String codres = "MASSI";
    String codsit = "CIRTIL";
    String numexe = exemplairePersistence.getNumexeFromExemplaire(id, codres, codsit);

    assertNotNull(numexe);
    assertEquals("01", numexe);
  }

}
