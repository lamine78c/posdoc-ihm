package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import fr.acoss.posdoc.domain.premas.model.Premas;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static fr.acoss.posdoc.types.Statut.INVALIDE;
@Sql(scripts = {"classpath:sql/premas/insert-premas.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/premas/clean-premas.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class PremasResolverTest extends AbstractGraphqlTest {

  @Test
  void findPremas_ok() throws IOException {
    FindPremasQuery query = new FindPremasQuery();
    query.setCodenv("p");
    query.setPercod("250101");
    final var variables = new ObjectMapper().createObjectNode();
    variables.set("findPremasInput", new ObjectMapper().valueToTree(query));
    final var response = graphQLTestTemplate.perform("graphql-requests/premas/find-premas.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Premas> res = response.getList("$.data.findPremas", Premas.class);
    assertEquals(3, res.size());
  }

  @Test
  void getDistinctEnvOrgApp_ok() throws IOException {
    final var response = graphQLTestTemplate.perform("graphql-requests/premas/get-distinct-env-org-app.graphql", null);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<DistinctEnvOrgAppModel> res = response.getList("$.data.getDistinctEnvOrgAppFromPremas", DistinctEnvOrgAppModel.class);
    assertEquals(3, res.size());
  }

  @Test
  void invaliderMassifications_single_ok() throws IOException {
    List<InvalidateMassificationInput> massifications = new ArrayList<>();
    InvalidateMassificationInput input = new InvalidateMassificationInput();
    input.setCodenv("p");
    input.setCodorg("117");
    input.setCodapp("app");
    input.setPercod("250101-00");
    input.setCodcom("com");
    input.setCodfic("l00");
    input.setNumcom("00");
    massifications.add(input);

    FindPremasQuery query = new FindPremasQuery();
    query.setCodenv("p");
    query.setPercod("250101");

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("massifications", new ObjectMapper().valueToTree(massifications));
    variables.set("query", new ObjectMapper().valueToTree(query));

    final var response = graphQLTestTemplate.perform("graphql-requests/premas/invalidate-massifications.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Premas> res = response.getList("$.data.invaliderMassifications", Premas.class);
    assertNotNull(res);
    assertEquals(3, res.size());
    // Vérifier que la massification ciblée a bien été invalidée (presta='I')
    Premas invalidatedPremas = res.stream()
            .filter(p -> "117".equals(p.getCodorg()) && "l00".equals(p.getCodfic()))
            .findFirst()
            .orElse(null);
    assertNotNull(invalidatedPremas);
    assertEquals(INVALIDE, invalidatedPremas.getPresta());
  }

  @Test
  void invaliderMassifications_multiple_ok() throws IOException {
    List<InvalidateMassificationInput> massifications = new ArrayList<>();

    InvalidateMassificationInput input1 = new InvalidateMassificationInput();
    input1.setCodenv("p");
    input1.setCodorg("117");
    input1.setCodapp("app");
    input1.setPercod("250101-00");
    input1.setCodcom("com");
    input1.setCodfic("l00");
    input1.setNumcom("00");
    massifications.add(input1);

    InvalidateMassificationInput input2 = new InvalidateMassificationInput();
    input2.setCodenv("p");
    input2.setCodorg("116");
    input2.setCodapp("app");
    input2.setPercod("250101-00");
    input2.setCodcom("com");
    input2.setCodfic("l02");
    input2.setNumcom("00");
    massifications.add(input2);

    FindPremasQuery query = new FindPremasQuery();
    query.setCodenv("p");
    query.setPercod("250101");

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("massifications", new ObjectMapper().valueToTree(massifications));
    variables.set("query", new ObjectMapper().valueToTree(query));

    final var response = graphQLTestTemplate.perform("graphql-requests/premas/invalidate-massifications.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Premas> res = response.getList("$.data.invaliderMassifications", Premas.class);
    assertNotNull(res);
    assertEquals(3, res.size());
    long invalidatedCount = res.stream()
            .filter(p -> INVALIDE.equals(p.getPresta()))
            .count();
    assertEquals(3, invalidatedCount);
  }

  @Test
  void invaliderMassifications_empty_list() throws IOException {
    List<InvalidateMassificationInput> massifications = new ArrayList<>();

    FindPremasQuery query = new FindPremasQuery();
    query.setCodenv("p");
    query.setPercod("250101");

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("massifications", new ObjectMapper().valueToTree(massifications));
    variables.set("query", new ObjectMapper().valueToTree(query));

    final var response = graphQLTestTemplate.perform("graphql-requests/premas/invalidate-massifications.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Premas> res = response.getList("$.data.invaliderMassifications", Premas.class);
    assertNotNull(res);
    assertEquals(3, res.size());
    long invalidatedCount = res.stream()
            .filter(p -> INVALIDE.equals(p.getPresta()))
            .count();
    assertEquals(1, invalidatedCount);
  }

  @Test
  void invaliderMassifications_with_filter_query() throws IOException {
    List<InvalidateMassificationInput> massifications = new ArrayList<>();
    InvalidateMassificationInput input = new InvalidateMassificationInput();
    input.setCodenv("p");
    input.setCodorg("117");
    input.setCodapp("app");
    input.setPercod("250101-00");
    input.setCodcom("com");
    input.setCodfic("l00");
    input.setNumcom("00");
    massifications.add(input);

    FindPremasQuery query = new FindPremasQuery();
    query.setCodenv("p");
    query.setPercod("250101");
    query.setCodapp("app");

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("massifications", new ObjectMapper().valueToTree(massifications));
    variables.set("query", new ObjectMapper().valueToTree(query));

    final var response = graphQLTestTemplate.perform("graphql-requests/premas/invalidate-massifications.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Premas> res = response.getList("$.data.invaliderMassifications", Premas.class);
    assertNotNull(res);
    assertEquals(3, res.size());
    Premas invalidatedPremas = res.stream()
            .filter(p -> "117".equals(p.getCodorg()) && "l00".equals(p.getCodfic()))
            .findFirst()
            .orElse(null);
    assertNotNull(invalidatedPremas);
    assertEquals(INVALIDE, invalidatedPremas.getPresta());
  }

}