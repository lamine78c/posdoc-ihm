package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/organi-client/insert-organi-client.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/organi-client/clean-organi-client.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class OrganiClientPersistenceImplTest {
  @Autowired
  private OrganiClientPersistenceImpl organiClientPersistence;

  @Test
  void lister_all() {
    assertEquals(5, organiClientPersistence.findAll().size());
  }


}