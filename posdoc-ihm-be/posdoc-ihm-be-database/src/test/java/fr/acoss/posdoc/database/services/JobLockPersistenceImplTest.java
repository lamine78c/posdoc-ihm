package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.joblock.model.JobLock;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/joblock/insert-joblock.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/joblock/clean-joblock.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class JobLockPersistenceImplTest {

  @Autowired
  JobLockPersistenceImpl jobLockPersistence;

  @Test
  void test_create_ko() {
    JobLock jobLock = new JobLock();
    jobLock.setName("purge_log2");
    jobLock.setServer("appli02");
    jobLock.setDate(LocalDateTime.now());
    jobLockPersistence.create(jobLock);
    JobLock duplicate = new JobLock();
    jobLock.setName("purge_log2");
    jobLock.setServer("appli02");
    jobLock.setDate(LocalDateTime.now());
    assertThrows(DataAccessException.class, () -> jobLockPersistence.create(duplicate));
  }

  @Test
  void test_create_ok() {
    String name = "job_test";
    String server = "appli01";
    JobLock jobLock = new JobLock();
    jobLock.setName(name);
    jobLock.setServer(server);
    jobLock.setDate(LocalDateTime.now());
    JobLock newJobLock = jobLockPersistence.create(jobLock);
    assertEquals(server, newJobLock.getServer());
  }

  @Test
  void test_unlockForce_ok() {
    String name = "job_test";
    String server = "appli01";
    JobLock jobLock = new JobLock();
    jobLock.setName(name);
    jobLock.setServer(server);
    jobLock.setDate(LocalDateTime.now());
    JobLock newJobLock = jobLockPersistence.create(jobLock);
    assertTrue(jobLockPersistence.existsById(name));
    assertEquals(server, newJobLock.getServer());
  }

  @Test
  void test_unlockForce_ko() {
    String name = "job_test2";
    String server = "appli01";
    JobLock jobLock = new JobLock();
    jobLock.setName(name);
    jobLock.setServer(server);
    jobLock.setDate(LocalDateTime.now());
    jobLockPersistence.create(jobLock);
    assertTrue(jobLockPersistence.existsById(name));
    jobLockPersistence.unlockForce(name, 1);
    assertTrue(jobLockPersistence.existsById(name));
  }
}