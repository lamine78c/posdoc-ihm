package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQuery;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/utilog/insert-utilog.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/utilog/clean-utilog.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class UtilogPersistenceImplTest {
  @Autowired
  private UtiLogPersistenceImpl utiLogPersistence;

  @Test
  void test_find_history_by_query_should_be_ok() {
    final FindUtiLogByQuery query = new FindUtiLogByQuery();
    query.setDtdeb("2025-06-12 00:00:00");
    query.setDtfin("2025-06-13 23:59:59");
    List<UtiLog> result = utiLogPersistence.findUtiLogByQuery(query);
    assertEquals(1, result.size());
  }

  @Test
  void test_find_distinct_user_should_be_ok() {
    List<String> result = utiLogPersistence.findDistinctUser();
    assertEquals(1, result.size());
  }

  @Test
  void test_find_distinct_action_should_be_ok() {
    List<String> result = utiLogPersistence.findDistinctAction();
    assertEquals(1, result.size());
  }

  @Test
  void test_find_distinct_form_id_should_be_ok() {
    List<String> result = utiLogPersistence.findDistinctFormId();
    assertEquals(1, result.size());
  }

  @Test
  void test_purge() {
    List<Integer> ids = utiLogPersistence.findRowNotInMyslogToPurge(366, 1000);
    LocalDate today = LocalDate.now();
    LocalDate dateInUtiLog = LocalDate.of(2025, 6, 12);
    if(dateInUtiLog.isAfter(today.minusDays(366))) {
      assertEquals(0, ids.size());
    } else {
      assertEquals(1, ids.size());
    }
  }
}