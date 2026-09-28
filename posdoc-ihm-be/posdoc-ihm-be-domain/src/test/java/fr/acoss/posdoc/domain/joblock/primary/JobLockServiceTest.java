package fr.acoss.posdoc.domain.joblock.primary;

import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.secondary.JobLockPersistence;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobLockServiceTest {

  @Mock
  private JobLockPersistence jobLockPersistence;
  private JobLockService jobLockService;

  @BeforeEach
  public void setUp() {
    jobLockService = new JobLockService(jobLockPersistence);
  }

  @Test
  void test_create_exists() {
    String name = "job_test2";
    String server = "appli01";
    JobLock jobLock = new JobLock();
    jobLock.setName(name);
    jobLock.setServer(server);
    jobLock.setDate(LocalDateTime.now());
    when(jobLockPersistence.existsById(Mockito.any(String.class))).thenReturn(Boolean.TRUE);
    JobLock result = jobLockService.create(jobLock);
    verify(jobLockPersistence).existsById(name);
    verify(jobLockPersistence, never()).create(jobLock);
    assertNull(result);
  }

  @Test
  void test_create_ko() {
    String name = "job_test2";
    String server = "appli01";
    JobLock jobLock = new JobLock();
    jobLock.setName(name);
    jobLock.setServer(server);
    jobLock.setDate(LocalDateTime.now());
    when(jobLockPersistence.existsById(Mockito.any(String.class))).thenReturn(Boolean.FALSE);
    when(jobLockPersistence.create(Mockito.any(JobLock.class))).thenThrow(new CustomExceptionMessage("error"));
    JobLock result = jobLockService.create(jobLock);
    verify(jobLockPersistence).existsById(name);
    assertNull(result);
  }

  @Test
  void test_delete_ok() {
    String id = "job_test";
    assertDoesNotThrow(() -> jobLockService.delete(id));
    verify(jobLockPersistence).delete(id);
  }

  @Test
  void test_delete_catchesException() {
    String id = "job_test";
    doThrow(new CustomExceptionMessage("erreur delete")).when(jobLockPersistence).delete(id);
    assertDoesNotThrow(() -> jobLockService.delete(id));
    verify(jobLockPersistence).delete(id);
  }

  @Test
  void test_unlockForce_ok() {
    String id = "job_test";
    int days = 1;
    jobLockService.unlockForce(id, days);
    verify(jobLockPersistence).unlockForce(id, days);
  }
}