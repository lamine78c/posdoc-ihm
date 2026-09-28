package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComFicQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class FichierPersistenceImplTest {

  @Autowired
  private FichierPersistenceImpl fichierPersistence;
  @Autowired
  private FichierRepository fichierRepository;

  @Test
  @Transactional
  void test_updateFicAttByEnvOrgsAppComFic() {

    SearchByEnvOrgsAppComFicQuery query = new SearchByEnvOrgsAppComFicQuery();
    query.setCodenv("D");
    query.setCodorgs(List.of("904"));
    query.setCodapp("SNV2");
    query.setCodcom("RDEH");
    query.setCodfic("L04");
    fichierPersistence.updateFicAttByEnvOrgsAppComFic(query, "message");

    FichierCompositeId id = new FichierCompositeId();
    id.setCodeEnv("D");
    id.setCodeApp("SNV2");
    id.setCodeCom("RDEH");
    id.setCodeOrg("904");
    id.setCodeFich("L04");
    final var fichier = fichierRepository.findById(id);
    assertTrue(fichier.isPresent());
    assertEquals("message", fichier.get().getFicAtt());
  }

  @Test
  void test_findFichiersForAffectationNotice_ok() {
    SearchNotficQuery query = new SearchNotficQuery();
    query.setCodenv("T");
    query.setCodorg(List.of("100"));
    query.setCodapp("SNV2");
    query.setCodnot("COM 167");
    List<NotficFichier> response = fichierPersistence.findFichiersForAffectationNotice(query);
    assertEquals(1, response.size());
  }

  @Test
  void test_findDistOrgNoMasByEnv_ok() {
    SearchFichierFilterQuery query = new SearchFichierFilterQuery();
    query.setCodenvs(List.of("T", "D"));
    List<String> response = fichierPersistence.findDistOrgNoMasByEnv(query);
    assertEquals(6, response.size());
  }

  @Test
  void test_findDistOrgByEnv_ok() {
    SearchFichierFilterQuery query = new SearchFichierFilterQuery();
    query.setCodenvs(List.of("T", "D"));
    List<String> response = fichierPersistence.findDistOrgByEnv(query);
    assertEquals(7, response.size());
  }

  @Test
  void test_updateMessageByIds_ok() {
    List<FichierComposite> ids = new ArrayList<>();
    FichierComposite id1 = new FichierComposite();
    id1.setCodeEnv("D");
    id1.setCodeOrg("904");
    id1.setCodeApp("SNV2");
    id1.setCodeCom("RDEH");
    id1.setCodeFich("L04");
    ids.add(id1);
    FichierComposite id2 = new FichierComposite();
    id2.setCodeEnv("T");
    id2.setCodeOrg("750");
    id2.setCodeApp("SNV2");
    id2.setCodeCom("RDEH");
    id2.setCodeFich("L02");
    ids.add(id2);
    String message = "msg test";
    fichierPersistence.updateFicAttByIds(ids, message);

    FichierCompositeId idFic = new FichierCompositeId();
    idFic.setCodeEnv("T");
    idFic.setCodeApp("SNV2");
    idFic.setCodeCom("RDEH");
    idFic.setCodeOrg("750");
    idFic.setCodeFich("L02");
    var fichier = fichierRepository.findById(idFic);
    assertTrue(fichier.isPresent());
    assertEquals(message, fichier.get().getFicAtt());

    idFic.setCodeEnv("D");
    idFic.setCodeApp("SNV2");
    idFic.setCodeCom("RDEH");
    idFic.setCodeOrg("904");
    idFic.setCodeFich("L04");
    fichier = fichierRepository.findById(idFic);
    assertTrue(fichier.isPresent());
    assertEquals(message, fichier.get().getFicAtt());
  }

  @Test
  void test_updateAll_ok() {
    List<Fichier> fichiers = new ArrayList<>();
    Fichier fic = new Fichier();
    fic.setCodeEnv("I");
    fic.setCodeOrg("010");
    fic.setCodeApp("SNV2");
    fic.setCodeCom("EI02");
    fic.setCodeFich("L01");
    fic.setLibFichier("libfic");
    fic.setCodeProd("codpr");
    fic.setRefFormat("reff");
    fic.setTypeFormat("P");
    fic.setTypeMultif("_");
    fic.setRefImprime("refimp");
    fic.setCodeClient("codcli");
    fic.setTypeSig("R");
    fic.setRefSupport("refsup");
    fic.setTypeSupport("S");
    fic.setEclatement(1);
    fic.setPage(10);
    fic.setCodeAdr("codadr2");
    fic.setCodeDocument("coddoc2");

    fichiers.add(fic);
    fichierPersistence.updateAll(fichiers);

    FichierCompositeId idFic = new FichierCompositeId();
    idFic.setCodeEnv("I");
    idFic.setCodeApp("SNV2");
    idFic.setCodeCom("EI02");
    idFic.setCodeOrg("010");
    idFic.setCodeFich("L01");
    Optional<FichierEntity> results = fichierRepository.findById(idFic);
    assertTrue(results.isPresent());
    FichierEntity fic1 = results.get();
    // les champs modifiés
    assertEquals("libfic", fic1.getLibFichier());
    assertEquals("codpr", fic1.getCodeProd());
    assertEquals("reff", fic1.getRefFormat());
    assertEquals("P", fic1.getTypeFormat());
    assertEquals("S", fic1.getTypeSupport());
    assertEquals("refimp", fic1.getRefImprime());
    assertEquals("codcli", fic1.getCodeClient());
    assertEquals("R", fic1.getTypeSig());
    assertEquals("refsup", fic1.getRefSupport());
    assertEquals("codadr2", fic1.getCodeAdr());
    assertEquals("coddoc2", fic1.getCodeDocument());
    assertEquals(1, fic1.getEclatement());
    assertEquals(10, fic1.getPage());
    assertEquals("_", fic1.getTypeMultif());
    // les champs non modifiés
    assertEquals("refech", fic1.getRefech());
    assertEquals("refecl", fic1.getRefecl());
    assertTrue(fic1.isSpecim());
    assertTrue(fic1.isCbadre());
    assertTrue(fic1.isEdiver());
    assertFalse(fic1.isBanimp());
    assertTrue(fic1.isAppbac());
    assertEquals(0, fic1.getNbrRep());
    assertEquals(5, fic1.getRepExp());
    assertEquals("reftri", fic1.getRefTri());
    assertEquals("RECTO-SIMPLE", fic1.getFicAtt());
    assertEquals("codcli", fic1.getCodeClient());
    assertEquals("ve", fic1.getVerLoc());
  }
}
