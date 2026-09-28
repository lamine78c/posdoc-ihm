package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.expedition.model.Expedition;
import fr.acoss.posdoc.domain.expedition.model.ExpeditionPayloadDTO;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ExpeditionTest extends AbstractGraphqlTest {

  @Test
  void get_expeditions_ok() throws IOException {
    SearchExpeditionQuery query = new SearchExpeditionQuery();
    query.setCodenv("T");
    query.setCodorg(List.of("42C"));
    query.setCodapp("CES");
    query.setIsNotNullDfiexp(true);
    final var variables = new ObjectMapper().createObjectNode();
    variables.set("searchExpeditionQuery", new ObjectMapper().valueToTree(query));
    final var response = graphQLTestTemplate.perform("graphql-requests/expedition/get-expedition.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    ExpeditionPayloadDTO res = response.get("$.data.getExpeditions", ExpeditionPayloadDTO.class);
    List<Expedition> expeditionList = res.getExpeditionList();
    assertEquals(1, expeditionList.size());
  }

}