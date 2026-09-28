package fr.acoss.posdoc.ws.scheduler.jobs;

import fr.acoss.posdoc.ws.scheduler.service.LogPurgeScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.UnknownHostException;

@Component
public class PurgeJob {
    private final LogPurgeScheduler logPurgeScheduler;

    public PurgeJob(final LogPurgeScheduler logPurgeScheduler) {
        this.logPurgeScheduler = logPurgeScheduler;
    }

    @Scheduled(cron = "${scheduler.log.purge.cron}", zone = "Europe/Paris")
    public void run() throws UnknownHostException {
        this.logPurgeScheduler.purge();
    }
}
