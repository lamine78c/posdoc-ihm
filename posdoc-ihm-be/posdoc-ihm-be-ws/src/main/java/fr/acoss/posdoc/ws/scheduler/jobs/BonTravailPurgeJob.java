package fr.acoss.posdoc.ws.scheduler.jobs;

import fr.acoss.posdoc.ws.scheduler.service.BonTravailPurgeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.UnknownHostException;

@Component
public class BonTravailPurgeJob {
    private final BonTravailPurgeService bonTravailPurgeService;

    public BonTravailPurgeJob(final BonTravailPurgeService bonTravailPurgeService) {
        this.bonTravailPurgeService = bonTravailPurgeService;
    }

    /**
     * Purge automatique des bons de travail obsolètes.
     * Par défaut, dimanche à 02:00.
     */
    @Scheduled(cron = "${posdoc.bontravail.purge.cron}", zone = "Europe/Paris")
    public void run() throws UnknownHostException {
        this.bonTravailPurgeService.purge();
    }
}
