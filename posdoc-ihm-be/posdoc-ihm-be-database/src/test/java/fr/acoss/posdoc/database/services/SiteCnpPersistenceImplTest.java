package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class SiteCnpPersistenceImplTest {

  @Autowired
  private SiteCNPPersistenceImpl siteCNPPersistence;

  @Test
  void test_findAllMasOrgs_ok() {
    List<String> response = siteCNPPersistence.findAllMasOrgs();
    assertEquals(2, response.size());
  }
}
