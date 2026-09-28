package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.gendoc.model.DocDematerialise;
import fr.acoss.posdoc.domain.gendoc.model.DocVideoInformationDetail;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.text.ParseException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/generation-document/insert-generation-documents.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/generation-document/clean-generation-documents.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class GenDocPersistenceImplTest {

  public static final String DATDEM_EXIST = "20240201";
  public static final Integer NUMDEM_EXIST = 1001;
  public static final String DATDEM_NOT_EXIST = "20250101";
  public static final Integer NUMDEM_NOT_EXIST = 9999;
  public static final String CODDOC = "RSCAE";
  public static final String  REFDEM = "REST_F20190830_31129";
  public static final String TYPACt = "0";
  public static final String CODE_SITE = "SITE_A";


  @Autowired
  private GenDocPersistenceImpl genDocPersistenceImpl;

  @Test
  void findByVideoInfoDetailCriteres_Found() {

    SearchDocVideoInfoDetailQuery query = new SearchDocVideoInfoDetailQuery();
    query.setDatdem(DATDEM_EXIST);
    query.setNumdem(NUMDEM_EXIST);

    // Exécution de la méthode de service à tester findByVideoInfoDetailCriteres
    DocVideoInformationDetail result = genDocPersistenceImpl.findByVideoInfoDetailCriteres(query);

    assertNotNull(result);
    assertEquals(CODDOC, result.getCoddoc());
    assertEquals(REFDEM, result.getRefdem());
    assertEquals(TYPACt, result.getTypact());
    assertTrue(result.getImprim());
    assertEquals(CODE_SITE, result.getCodeSiteDematerialisation());
  }

  @Test
  void findByVideoInfoDetailCriteres_NotFound() {
    SearchDocVideoInfoDetailQuery query = new SearchDocVideoInfoDetailQuery();
    query.setDatdem(DATDEM_NOT_EXIST); // Date inexistante
    query.setNumdem(NUMDEM_NOT_EXIST); // Numéro inexistant

    DocVideoInformationDetail result = genDocPersistenceImpl.findByVideoInfoDetailCriteres(query);

    assertNull(result);
  }

  @Test
  void findByVideoInfoDetailCriteres_WithInvalidDatdemChars() {
    SearchDocVideoInfoDetailQuery query = new SearchDocVideoInfoDetailQuery();
    query.setDatdem("2024abcd"); // Datdem non valid
    query.setNumdem(NUMDEM_EXIST);
    try {
      DocVideoInformationDetail result = genDocPersistenceImpl.findByVideoInfoDetailCriteres(query);
      assertNull(result);
    } catch (Exception e) {
      assertTrue(e instanceof IllegalArgumentException || e instanceof ParseException);
    }
  }

  @Test
  void getDocsDematerialises_ok() {
    SearchDocDemQuery query = new SearchDocDemQuery();
    query.setDate("2024-05-23");
    query.setCodapp("PNR");
    query.setCodorgs(List.of("117", "001"));
    query.setCoddoc("RSCAE");
    query.setTypact("0");
    query.setDocsta("S");
    List<DocDematerialise> result = genDocPersistenceImpl.findByCriteres(query);
    assertNotNull(result);
    assertEquals(1, result.size());
  }
}