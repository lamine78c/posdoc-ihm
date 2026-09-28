package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genpli.model.SearchPliQueryInput;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/suivi-au-pli/insert-suivi-au-pli.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/suivi-au-pli/clean-suivi-au-pli.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class SuiviAuPliTest extends AbstractGraphqlTest {

  @Test
  void search_pli_non_cnav_should_be_ok() throws IOException {
    SearchPliQueryInput query = new SearchPliQueryInput();
    query.setDtdeb("2023-12-07");
    query.setDtfin("2023-12-07");
    query.setNumpli("02335475");
    query.setAdress("adres4 adres5 adres6");
    query.setIsCnav(false);
    final var variable1 = new ObjectMapper().createObjectNode();
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    variable1.set("query", objectMapper.valueToTree(query));
    final var response = graphQLTestTemplate.perform("graphql-requests/suivi-au-pli/search-pli-by-query.graphql", variable1);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<SearchPliResult> result = response.getList("$.data.searchPliByQuery", SearchPliResult.class);
    assertEquals(1, result.size());
    assertEquals("CH", result.get(0).getCodgam());
  }

  @Test
  void search_pli_no_date_should_be_ok() throws IOException {
    SearchPliQueryInput query = new SearchPliQueryInput();
    query.setAdress("adres4 adres5 adres6");
    final var variable1 = new ObjectMapper().createObjectNode();
    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.registerModule(new JavaTimeModule());
    variable1.set("query", objectMapper.valueToTree(query));
    final var response = graphQLTestTemplate.perform("graphql-requests/suivi-au-pli/search-pli-by-query.graphql", variable1);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<SearchPliResult> result = response.getList("$.data.searchPliByQuery", SearchPliResult.class);
    assertEquals(1, result.size());
    assertEquals("CH", result.get(0).getCodgam());
  }

  @Test
  void search_pli_by_id_should_be_ok() throws IOException {
    final var variable = new ObjectMapper().createObjectNode();
    variable.put("id", "86302335475002U");
    final var response = graphQLTestTemplate.perform("graphql-requests/suivi-au-pli/search-pli-by-id.graphql", variable);
    assertNotNull(response);
    assertTrue(response.isOk());
    SuiviAuPliDetailResult result = response.get("$.data.searchPliByNumpli", SuiviAuPliDetailResult.class);
    assertEquals("86302335475002U", result.getNumpli());
  }
}