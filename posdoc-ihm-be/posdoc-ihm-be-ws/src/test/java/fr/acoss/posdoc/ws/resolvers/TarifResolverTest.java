package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.TarifRepository;
import fr.acoss.posdoc.database.entities.TarifCompositeId;
import fr.acoss.posdoc.database.entities.TarifEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class TarifResolverTest extends AbstractGraphqlTest {

  @Autowired
  public TarifRepository tarifRepository;

  @Test
  void createTarif_without_datefin() throws IOException {

    final var variables = createVariables("AB",
        "0000",
        "2011-12-03",
        null,
        0.900,
        false);

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables);

    assertNotNull(response);
    assertTrue(response.isOk());
    assertEquals("AB", response.get("$.data.createTarif.type"));
    assertEquals("0000", response.get("$.data.createTarif.numero"));
    assertEquals("2011-12-03", response.get("$.data.createTarif.dateDebut"));
    assertNull(response.get("$.data.createTarif.dateFin"));
    assertEquals("0.9", response.get("$.data.createTarif.coutPli"));
    assertEquals("false", response.get("$.data.createTarif.urgent"));

  }

  @Test
  void createTarif_with_datefin() throws IOException {
    final var variables = createVariables("VF",
            "0000",
        "2011-12-03",
        "2012-05-04",
        0.900,
        false);

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables);

    assertNotNull(response);
    assertTrue(response.isOk());
    assertEquals("VF", response.get("$.data.createTarif.type"));
    assertEquals("0000", response.get("$.data.createTarif.numero"));
    assertEquals("2011-12-03", response.get("$.data.createTarif.dateDebut"));
    assertEquals("2012-05-04", response.get("$.data.createTarif.dateFin"));
    assertEquals("0.9", response.get("$.data.createTarif.coutPli"));
    assertEquals("false", response.get("$.data.createTarif.urgent"));

  }

  @Test
  void createTarif_called_twice_incremented_numero() throws IOException {

    final var variables = createVariables("DC",
        "0000",
        "2011-12-03",
        "2013-11-19",
        0.900,
        false);

    graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql", variables);

    final var variables2 = createVariables("DC",
        "0001",
        "2013-11-20",
        null,
        1.9,
        false);

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables2);

    assertNotNull(response);
    assertTrue(response.isOk());
    assertEquals("DC", response.get("$.data.createTarif.type"));
    assertEquals("0001", response.get("$.data.createTarif.numero"));
    assertEquals("2013-11-20", response.get("$.data.createTarif.dateDebut"));
    assertNull(response.get("$.data.createTarif.dateFin"));
    assertEquals("1.9", response.get("$.data.createTarif.coutPli"));
    assertEquals("false", response.get("$.data.createTarif.urgent"));

  }

  @Test
  void createTarif_already_existing_on_period() throws IOException {
    final var variables = createVariables("CP",
            "0004",
            "2010-12-03",
            "2011-11-19",
            0.900,
            false);

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
            variables);

    assertNotNull(response);
    assertEquals("Un tarif existe déjà sur cette période.", response.get("$.errors[0].message"));
  }


  @Test
  void updateTarif() throws IOException {

    final var variables = createVariables("OP",
        "0000",
        "2011-12-03",
        "2012-05-04",
        0.900,
        false);

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables);

    assertNotNull(response);
    assertTrue(response.isOk());

    //Mise à jour de la date de fin
    final var variablesUpdate = createVariables("OP",
        "0000",
        "2011-12-03",
        "2015-06-23",
        0.900,
        false);

    final var responseUpdate = graphQLTestTemplate.perform("graphql-requests/tarif/update-tarif.graphql",
        variablesUpdate);

    assertNotNull(responseUpdate);
    assertTrue(responseUpdate.isOk());
    assertEquals("OP", responseUpdate.get("$.data.updateTarif.type"));
    assertEquals("0000", responseUpdate.get("$.data.updateTarif.numero"));
    assertEquals("2011-12-03", responseUpdate.get("$.data.updateTarif.dateDebut"));
    assertEquals("2015-06-23", responseUpdate.get("$.data.updateTarif.dateFin"));
    assertEquals("0.9", responseUpdate.get("$.data.updateTarif.coutPli"));
    assertEquals("false", responseUpdate.get("$.data.updateTarif.urgent"));
  }

  @Test
  void deleteTarif() throws IOException {

    final var variables = createVariables("DE",
        "0000",
        "2011-12-01",
        "2012-05-04",
        0.900,
        false);

    final var variables2 = createVariables("DE",
        "0001",
        "2012-05-05",
        null,
        0.900,
        false);

    final var example = new TarifEntity();
    example.setId(new TarifCompositeId("DE", null));

    final var response = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables);

    assertNotNull(response);
    assertTrue(response.isOk());
    assertEquals("DE", response.get("$.data.createTarif.type"));
    assertEquals("0000", response.get("$.data.createTarif.numero"));

    final var response2 = graphQLTestTemplate.perform("graphql-requests/tarif/create-tarif.graphql",
        variables2);

    assertNotNull(response2);
    assertTrue(response2.isOk());
    assertEquals("DE", response2.get("$.data.createTarif.type"));
    assertEquals("0001", response2.get("$.data.createTarif.numero"));

    final var allSaved = tarifRepository.findAll(Example.of(example));
    assertEquals(2, allSaved.size());

    final var variables3 = new ObjectMapper().createObjectNode();
    final var delete = variables3.putObject("var");
    delete.put("type", "DE");
    delete.put("numero", "0000");

    final var deleteResponse = graphQLTestTemplate.perform("graphql-requests/tarif/delete-tarif.graphql",
        variables3);

    assertNotNull(deleteResponse);
    assertTrue(deleteResponse.isOk());
    assertEquals("true", deleteResponse.get("$.data.deleteTarifs.ok"));


    final var variables4 = new ObjectMapper().createObjectNode();
    final var delete2 = variables4.putObject("var");
    delete2.put("type", "DE");
    delete2.put("numero", "0001");

    final var deleteResponse2 = graphQLTestTemplate.perform("graphql-requests/tarif/delete-tarif.graphql",
            variables4);

    assertEquals("true", deleteResponse2.get("$.data.deleteTarifs.ok"));

    final var allDeleted = tarifRepository.findAll(Example.of(example));
    assertTrue(allDeleted.isEmpty());

  }

  public ObjectNode createVariables(final String type, final String numero, final String dateDebut,
                                    final String dateFin, final Double coutPli,
                                    final Boolean urgent) {
    final var variables = new ObjectMapper().createObjectNode();
    final var tarif = variables.putObject("var");
    tarif.put("type", type);
    if (numero != null) {
      tarif.put("numero", numero);
    }
    tarif.put("dateDebut", dateDebut);
    tarif.put("dateFin", dateFin);
    tarif.put("coutPli", coutPli);
    tarif.put("urgent", urgent);
    return variables;
  }

}