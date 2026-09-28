package fr.acoss.posdoc.ws.scheduler;

import fr.acoss.posdoc.domain.history.primary.HistoryService;
import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.ws.scheduler.service.LogPurgeScheduler;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.net.UnknownHostException;

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertThrows;

class LogPurgeSchedulerTest {
    @Test
    void test_purge_ok() throws UnknownHostException {
        UtiLogService utiLogService = Mockito.mock(UtiLogService.class);
        HistoryService historyService = Mockito.mock(HistoryService.class);
        JobLockService jobLockService = Mockito.mock(JobLockService.class);
        LogPurgeScheduler scheduler = new LogPurgeScheduler(utiLogService, historyService, jobLockService);
        JobLock jobLock = new JobLock();
        jobLock.setName("purgejob");
        // verrou créé
        when(jobLockService.create(Mockito.any(JobLock.class))).thenReturn(jobLock);
        scheduler.purge();
        // purge
        Mockito.verify(historyService).purge(Mockito.any(Integer.class), Mockito.any(Integer.class));
        Mockito.verify(utiLogService).purgeRowNotInMyslog(Mockito.any(Integer.class), Mockito.any(Integer.class));
        // verrou supprimé
        Mockito.verify(jobLockService).delete(jobLock.getName());
    }

    @Test
    void test_purge_job_exist() throws UnknownHostException {
        UtiLogService utiLogService = Mockito.mock(UtiLogService.class);
        HistoryService historyService = Mockito.mock(HistoryService.class);
        JobLockService jobLockService = Mockito.mock(JobLockService.class);
        LogPurgeScheduler scheduler = new LogPurgeScheduler(utiLogService, historyService, jobLockService);
        // verrou existe
        when(jobLockService.create(Mockito.any(JobLock.class))).thenReturn(null);
        scheduler.purge();
        // pas de purge
        Mockito.verify(historyService, Mockito.never()).purge(Mockito.anyInt(), Mockito.anyInt());
        Mockito.verify(utiLogService, Mockito.never()).purgeRowNotInMyslog(Mockito.anyInt(), Mockito.anyInt());
        // pas de suppression verrou
        Mockito.verify(jobLockService, Mockito.never()).delete(Mockito.any(String.class));
    }

    @Test
    void test_purge_error_myslog() {
        UtiLogService utiLogService = Mockito.mock(UtiLogService.class);
        HistoryService historyService = Mockito.mock(HistoryService.class);
        JobLockService jobLockService = Mockito.mock(JobLockService.class);
        LogPurgeScheduler scheduler = new LogPurgeScheduler(utiLogService, historyService, jobLockService);
        JobLock jobLock = new JobLock();
        jobLock.setName("purgejob");
        // verrou créé
        when(jobLockService.create(Mockito.any(JobLock.class))).thenReturn(jobLock);
        // erreur purge myslog
        Mockito.doThrow(new CustomExceptionMessage("Erreur sur la purge du myslog"))
                .when(historyService)
                .purge(Mockito.anyInt(), Mockito.anyInt());
        assertThrows(CustomExceptionMessage.class, scheduler::purge);
        // pas de purge utilog
        Mockito.verify(utiLogService, Mockito.never()).purgeRowNotInMyslog(Mockito.anyInt(), Mockito.anyInt());
        // verrou supprimé malgré l’exception
        Mockito.verify(jobLockService).delete(jobLock.getName());
    }

    @Test
    void test_purge_error_utilog() {
        UtiLogService utiLogService = Mockito.mock(UtiLogService.class);
        HistoryService historyService = Mockito.mock(HistoryService.class);
        JobLockService jobLockService = Mockito.mock(JobLockService.class);
        LogPurgeScheduler scheduler = new LogPurgeScheduler(utiLogService, historyService, jobLockService);
        JobLock jobLock = new JobLock();
        jobLock.setName("purgejob");
        // verrou créé
        when(jobLockService.create(Mockito.any(JobLock.class))).thenReturn(jobLock);
        // erreur purge utilog
        Mockito.doThrow(new CustomExceptionMessage("Erreur sur la purge du utilog"))
                .when(utiLogService)
                .purgeRowNotInMyslog(Mockito.anyInt(), Mockito.anyInt());
        assertThrows(CustomExceptionMessage.class, scheduler::purge);
        // purge myslog
        Mockito.verify(historyService).purge(Mockito.any(Integer.class), Mockito.any(Integer.class));
        // verrou supprimé malgré l’exception
        Mockito.verify(jobLockService).delete(Mockito.any(String.class));
    }
}
