package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.notfic.model.FindNoticeDetailsByFichierPayload;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicInput;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.NoticeDetailDTO;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;
import fr.acoss.posdoc.types.MyslogAction;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/notfic/insert-notfic.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/notfic/clean-notfic.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class NotficTest extends AbstractGraphqlTest {

  @Test
  void test_affectation_notfic() throws IOException {

    NotFicInput notfic = new NotFicInput();
    notfic.setCodnot("cod not");
    notfic.setCodenv("T");
    notfic.setCodorg("777");
    notfic.setCodapp("SNV2");
    notfic.setCodcom("PD16");
    notfic.setCodfic("L01");
    notfic.setDnotid("2025-03-12");
    notfic.setDnotit("2025-03-13");
    List<NotFicInput> notFicList = new ArrayList<>();
    notFicList.add(notfic);

    final var variables = new ObjectMapper().createObjectNode();

    variables.set("query", new ObjectMapper().valueToTree(notFicList));

    final var response = graphQLTestTemplate.perform("graphql-requests/notfic/affectation-notfic.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<NotFic> res = response.getList("$.data.affectationNotfic", NotFic.class);
    assertEquals(1, res.size());
  }

  @Test
  void test_update_affectation_notice() throws IOException {
    UpdateNotficsPayload payload = new UpdateNotficsPayload();
    payload.setCodnot("COM 167");
    payload.setCodenv("T");
    payload.setCodorg("780");
    payload.setCodapp("SNV2");
    payload.setCodfic("L00");
    payload.setDnotid("2025-08-11");
    payload.setDnotit("2025-08-12");
    payload.setMaxnot(0);

    List<UpdateNotficsPayload> notFicList = new ArrayList<>();
    notFicList.add(payload);

    final var variables = new ObjectMapper().createObjectNode();

    variables.set("notfics", new ObjectMapper().valueToTree(notFicList));

    final var response = graphQLTestTemplate.perform("graphql-requests/notfic/update-affectation-notfic.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<NotficFichier> res = response.getList("$.data.updateNotfics", NotficFichier.class);
    assertEquals(1, res.size());

    // Check History
    final var historyResponse = graphQLTestTemplate.perform("graphql-requests/history/all-history.graphql", variables);
    assertNotNull(historyResponse);
    assertTrue(historyResponse.isOk());
    List<HistoryEntity> responseList = historyResponse.getList("$.data.allHistory", HistoryEntity.class);
    assertEquals(1, responseList.size());
    assertEquals(MyslogAction.UPDATE, responseList.get(0).getActionUtilisateur());
    assertEquals("Notfic", responseList.get(0).getEntite());
  }

  @Test
  void find_fichiers_for_affectation_notice() throws IOException {
    SearchNotficQuery query = new SearchNotficQuery();
    query.setCodenv("T");
    query.setCodorg(List.of("780"));
    query.setCodapp("SNV2");
    query.setCodnot("COM 167");
    final var variables = new ObjectMapper().createObjectNode();
    variables.set("query", new ObjectMapper().valueToTree(query));
    final var response = graphQLTestTemplate
            .perform("graphql-requests/fichier/find-fichiers-for-affectation-notice.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<NotficFichier> list = response.getList("$.data.findFichiersForAffectationNotice", NotficFichier.class);
    assertEquals(1, list.size());
    assertEquals("PD16", list.get(0).getCodcom());
    assertEquals("L01", list.get(0).getCodfic());
  }

  @Test
  void findNoticesFichiers_withValidPayload_shouldReturnData() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    final var payload = variables.putObject("payload");
    payload.put("codenv", "P");
    payload.putArray("codorg").add("010");
    payload.put("codapp", "SNV2");

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notices-fichiers.graphql", variables);
    assertNotNull(response);

    System.out.println("Response: " + response.getRawResponse().getBody());
    System.out.println("Is OK: " + response.isOk());

    assertTrue(response.isOk());
    String responseStr = response.getRawResponse().getBody();
    assertNotNull(responseStr);
    assertTrue(responseStr.contains("codeProd"));
  }

  @Test
  void findNoticesFichiers_withAllFilters_shouldReturnFilteredData() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    final var payload = variables.putObject("payload");
    payload.put("codenv", "P");
    payload.putArray("codorg").add("010");
    payload.put("codapp", "SNV2");
    payload.put("codcom", "AD04");
    payload.putArray("codfic").add("L00");

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notices-fichiers.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    String responseStr = response.getRawResponse().getBody();
    assertNotNull(responseStr);
    assertTrue(responseStr.contains("findNoticesFichiers"));
    assertTrue(responseStr.contains("AD04"));
  }

  @Test
  void findNoticesFichiers_withEmptyResult_shouldReturnEmptyList() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    final var payload = variables.putObject("payload");
    payload.put("codenv", "X");
    payload.putArray("codorg").add("999");
    payload.put("codapp", "XXX");

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notices-fichiers.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    String responseStr = response.getRawResponse().getBody();
    assertNotNull(responseStr);
    assertTrue(responseStr.contains("findNoticesFichiers"));
  }

  @Test
  void findNoticeDetailsByFichier_withValidPayload_shouldReturnNoticeDetails() throws IOException {
    FindNoticeDetailsByFichierPayload payload = FindNoticeDetailsByFichierPayload.builder()
            .codenv("P")
            .codorg("010")
            .codapp("SNV2")
            .codcom("AD04")
            .codfic("L00")
            .build();

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("payload", new ObjectMapper().valueToTree(payload));

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notice-details-by-fichier.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());

    List<NoticeDetailDTO> noticeDetails = response.getList("$.data.findNoticeDetailsByFichier", NoticeDetailDTO.class);
    assertNotNull(noticeDetails);
  }

  @Test
  void findNoticeDetailsByFichier_withAllFields_shouldMapCorrectly() throws IOException {
    FindNoticeDetailsByFichierPayload payload = FindNoticeDetailsByFichierPayload.builder()
            .codenv("P")
            .codorg("010")
            .codapp("SNV2")
            .codcom("AD04")
            .codfic("L00")
            .build();

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("payload", new ObjectMapper().valueToTree(payload));

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notice-details-by-fichier.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());

    String responseStr = response.getRawResponse().getBody();
    assertNotNull(responseStr);
    assertTrue(responseStr.contains("findNoticeDetailsByFichier"));
  }

  @Test
  void findNoticeDetailsByFichier_withNonExistentFichier_shouldReturnEmptyList() throws IOException {
    FindNoticeDetailsByFichierPayload payload = FindNoticeDetailsByFichierPayload.builder()
            .codenv("X")
            .codorg("999")
            .codapp("XXX")
            .codcom("XXX")
            .codfic("XXX")
            .build();

    final var variables = new ObjectMapper().createObjectNode();
    variables.set("payload", new ObjectMapper().valueToTree(payload));

    final var response = graphQLTestTemplate
            .perform("graphql-requests/notfic/find-notice-details-by-fichier.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());

    List<NoticeDetailDTO> noticeDetails = response.getList("$.data.findNoticeDetailsByFichier", NoticeDetailDTO.class);
    assertNotNull(noticeDetails);
  }
}