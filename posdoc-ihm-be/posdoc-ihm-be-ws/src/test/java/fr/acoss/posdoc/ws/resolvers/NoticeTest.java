package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.notice.model.Notice;
import fr.acoss.posdoc.domain.notice.model.NoticeOccurrenceApplication;
import fr.acoss.posdoc.domain.notice.model.SearchNoticesOccurrenceApplicationQuery;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/notice/insert-notice.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/notice/clean-notice.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class NoticeTest extends AbstractGraphqlTest {

  private void getAllAndCheckTest(final String graphqlResource, final String path, final int expected) throws IOException {
    final var response = graphQLTestTemplate.perform(graphqlResource, null);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Notice> res = response.getList(path, Notice.class);
    assertEquals(expected, res.size());
  }

  @Test
  void get_all_notices_should_be_ok() throws IOException {
    getAllAndCheckTest("graphql-requests/notice/all-notices.graphql", "$.data.allNotices", 6);
  }

  @Test
  void get_all_active_notices_should_be_ok() throws IOException {
    getAllAndCheckTest("graphql-requests/notice/all-active-notices.graphql", "$.data.allActiveNotices", 4);
  }

  @Test
  void get_all_expired_notices_should_be_ok() throws IOException {
    getAllAndCheckTest("graphql-requests/notice/all-expired-notices.graphql", "$.data.allExpiredNotices", 2);
  }

  @Test
  void create_notice_should_be_ok() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    final var noticePayload = variables.putObject("noticePayload");
    noticePayload.put("codnot", "NEW01");
    noticePayload.put("libnot", "Nouvelle Notice Test");
    noticePayload.put("fornot", "ED7");
    noticePayload.put("poinot", 25);
    noticePayload.put("pornot", "N");
    noticePayload.put("dnotir", "2025-06-01");
    noticePayload.put("perime", 0);
    noticePayload.put("codsit", "CIRSO");

    final var response = graphQLTestTemplate.perform("graphql-requests/notice/create-notice.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Notice> res = response.getList("$.data.createNotice", Notice.class);
    assertNotNull(res);

    Notice createdNotice = res.stream()
        .filter(n -> "NEW01".equals(n.getCodnot()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("Notice NEW01 not found in result"));

    assertEquals("NEW01", createdNotice.getCodnot());
    assertEquals("Nouvelle Notice Test", createdNotice.getLibnot());
    assertEquals(null, createdNotice.getCodsit());
  }

  @Test
  void update_notice_should_be_ok() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    final var noticePayload = variables.putObject("noticePayload");
    noticePayload.put("codnot", "CNAV");
    noticePayload.put("libnot", "Notice CNAV Modifiée");
    noticePayload.put("fornot", "ED1");
    noticePayload.put("poinot", 15);
    noticePayload.put("pornot", "N");
    noticePayload.put("dnotir", "2024-10-10");
    noticePayload.put("perime", 0);
    noticePayload.put("codsit", "CIRSO");

    final var response = graphQLTestTemplate.perform("graphql-requests/notice/update-notice.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Notice> res = response.getList("$.data.updateNotice", Notice.class);
    assertNotNull(res);

    Notice updatedNotice = res.stream()
        .filter(n -> "CNAV".equals(n.getCodnot()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("Notice CNAV not found in result"));

    assertEquals("Notice CNAV Modifiée", updatedNotice.getLibnot());
    assertEquals(0, updatedNotice.getPoinot().compareTo(new java.math.BigDecimal(15)));
    assertEquals(null, updatedNotice.getCodsit());
  }

  @Test
  void delete_notice_should_be_ok() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    variables.put("codnot", "TODLT");

    final var response = graphQLTestTemplate.perform("graphql-requests/notice/delete-notice.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());
    List<Notice> res = response.getList("$.data.deleteNotice", Notice.class);
    assertNotNull(res);

    boolean isDeleted = res.stream().noneMatch(n -> "TODLT".equals(n.getCodnot()));
    assertTrue(isDeleted, "Notice TODLT should be deleted from the active notices list");
  }

  @Test
  void getNoticesOccurrenceApplication_should_be_ok() throws IOException {
    final var variables = new ObjectMapper().createObjectNode();
    variables.set("query", new ObjectMapper().valueToTree(this.getQuery("P", "117", "SNV2", "251031-00", "AD04", "L00", "00")));

    final var response = graphQLTestTemplate.perform("graphql-requests/notice/notices-occurrence-application.graphql", variables);
    assertNotNull(response);
    assertTrue(response.isOk());

    List<NoticeOccurrenceApplication> responseList = response.getList("$.data.getNoticesOccurrenceApplication", NoticeOccurrenceApplication.class);

    assertEquals(1, responseList.size());
    assertEquals("CNAV", responseList.get(0).getCodnot());
    assertEquals("CIRSO", responseList.get(0).getCodsit());
  }

  private SearchNoticesOccurrenceApplicationQuery getQuery(String codenv, String codorg, String codapp, String percod, String codcom, String codfic, String numcom) {
    SearchNoticesOccurrenceApplicationQuery query = new SearchNoticesOccurrenceApplicationQuery();
    query.setCodenv(codenv);
    query.setCodorg(codorg);
    query.setCodapp(codapp);
    query.setPercod(percod);
    query.setCodcom(codcom);
    query.setCodfic(codfic);
    query.setNumcom(numcom);

    return query;
  }

}