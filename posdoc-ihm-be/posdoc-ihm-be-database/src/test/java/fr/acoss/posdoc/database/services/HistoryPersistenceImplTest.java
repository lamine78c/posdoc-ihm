package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.history.model.FindHistoryByQuery;
import fr.acoss.posdoc.domain.history.model.History;
import fr.acoss.posdoc.types.MyslogAction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/history/insert-myslog.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/history/clean-myslog.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class HistoryPersistenceImplTest {
  @Autowired
  private HistoryPersistenceImpl historyPersistence;

  @Test
  void should_select_all_ok() {
    List<History> result = historyPersistence.selectAll();
    assertEquals(3, result.size());
  }

  @Test
  void test_find_history_by_query_should_be_ok() {
    final FindHistoryByQuery query = new FindHistoryByQuery();
    query.setDtdeb("2025-06-12 00:00:00");
    query.setDtfin("2025-06-13 23:59:59");
    query.setAction(MyslogAction.INSERT);
    List<History> result = historyPersistence.findHistoryByQuery(query);
    assertEquals(3, result.size());
  }

  @Test
  void test_find_distinct_user_should_be_ok() {
    List<String> result = historyPersistence.findDistinctUser();
    assertEquals(1, result.size());
  }

  @Test
  void test_find_distinct_entity_should_be_ok() {
    List<String> result = historyPersistence.findDistinctEntity();
    assertEquals(1, result.size());
  }

  @Test
  void test_find_history_by_codulo_should_be_ok() {
    final Integer codulo= 1234;
    List<History> result = historyPersistence.findHistoryByCodulo(codulo);
    assertEquals(2, result.size());
  }

  @Test
  void test_purge() {
    List<Integer> ids = historyPersistence.findRowToPurge(366, 1000);
    LocalDate today = LocalDate.now();
    LocalDate dateInLog = LocalDate.of(2025, 6, 12);
    if(dateInLog.isAfter(today.minusDays(366))) {
      assertEquals(0, ids.size());
    } else {
      assertEquals(3, ids.size());
    }
  }
}