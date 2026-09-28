package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.genpli.model.SearchPliQueryInput;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/genpli/insert-suivi-au-pli.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/genpli/clean-suivi-au-pli.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class GenPliPersistenceImplTest {
  @Autowired
  private GenPliPersistenceImpl genPliPersistence;

  @Test
  void should_search_ok() {
    SearchPliQueryInput query = new SearchPliQueryInput();
    query.setDtdeb("2023-12-07");
    query.setDtfin("2023-12-08");
    query.setNumpli("02335475");
    query.setAdress("adres4 adres5 adres6");
    List<SearchPliResult> result = genPliPersistence.searchPliByQuery(query);
    assertEquals(1, result.size());
    assertEquals("CH", result.get(0).getCodgam());
    assertEquals("86302335475002U", result.get(0).getNumpli());
  }

  @Test
  void should_search_no_date_ok() {
    SearchPliQueryInput query = new SearchPliQueryInput();
    query.setAdress("adres4 adres5 adres6");
    List<SearchPliResult> result = genPliPersistence.searchPliByQuery(query);
    assertEquals(1, result.size());
    assertEquals("CH", result.get(0).getCodgam());
  }

  @Test
  void should_search_by_id_ok() {
    String numpli = "86302335475002U";
    SuiviAuPliDetailResult result = genPliPersistence.searchPliByNumpli(numpli);
    assertEquals(numpli, result.getNumpli());
  }

  @Test
  void should_search_cnav_ko() {
    SearchPliQueryInput query = new SearchPliQueryInput();
    query.setDtdeb("2023-12-07");
    query.setDtfin("2023-12-08");
    query.setNumpli("02335475");
    query.setAdress("adres4 adres5 adres6");
    query.setIsCnav(true);
    List<SearchPliResult> result = genPliPersistence.searchPliByQuery(query);
    assertEquals(1, result.size());
    assertEquals("86302335475111Z", result.get(0).getNumpli());
  }
}