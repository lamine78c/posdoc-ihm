package fr.acoss.posdoc.ws.scheduler;

import fr.acoss.posdoc.ws.scheduler.jobs.PurgeJob;
import fr.acoss.posdoc.ws.scheduler.service.LogPurgeScheduler;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.net.UnknownHostException;

class PurgeJobTest {
    @Test
    void testRunOk() throws UnknownHostException {
        LogPurgeScheduler logPurgeScheduler = Mockito.mock(LogPurgeScheduler.class);
        PurgeJob purgeJob = new PurgeJob(logPurgeScheduler);
        purgeJob.run();
        Mockito.verify(logPurgeScheduler).purge();
    }
}
