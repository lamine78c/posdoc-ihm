package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/gentar/insert-gentar.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/gentar/clean-gentar.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class GenTarPersistenceImplTest {

  @Autowired
  private GenTarPersistenceImpl genTarPersistence;

  @Test
  void search_facturations_by_fic_mas_should_be_ok() {
    SearchFacturationsByFichierInput query = new SearchFacturationsByFichierInput();
    query.setCodenv("T");
    query.setCodapp("MAS");
    query.setCodorg("00L");
    query.setPercod("230331-00");
    query.setCodfic("M4001");
    query.setCodcom("MAS4");
    query.setNumcom("00");
    SearchFacturationsByFichierPayloadDTO result = genTarPersistence.searchFacturationsByFichier(query);
    assertNotNull(result);
    assertEquals(2, result.getFacturations().size());
    assertEquals(3, result.getFichiersMas().size());
  }

  @Test
  void search_facturations_by_fic_should_be_ok() {
    SearchFacturationsByFichierInput query = new SearchFacturationsByFichierInput();
    query.setCodenv("T");
    query.setCodapp("CES");
    query.setCodorg("42C");
    query.setPercod("230331-00");
    query.setCodfic("CV02A");
    query.setCodcom("IPVT");
    query.setNumcom("00");
    SearchFacturationsByFichierPayloadDTO result = genTarPersistence.searchFacturationsByFichier(query);
    assertNotNull(result);
    assertEquals(2, result.getFacturations().size());
    assertNull(result.getFichiersMas());
  }
}