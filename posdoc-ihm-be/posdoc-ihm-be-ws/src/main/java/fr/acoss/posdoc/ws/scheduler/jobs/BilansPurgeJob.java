package fr.acoss.posdoc.ws.scheduler.jobs;

import fr.acoss.posdoc.ws.scheduler.service.BilansPurgeService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.net.UnknownHostException;

/**
 * Job planifié pour la purge automatique des bilans de massification obsolètes.
 *
 */
@Component
public class BilansPurgeJob {
    private final BilansPurgeService bilansPurgeService;

    public BilansPurgeJob(final BilansPurgeService bilansPurgeService) {
        this.bilansPurgeService = bilansPurgeService;
    }

    /**
     * Purge automatique des bilans obsolètes.
     * Par défaut, s'exécute tous les dimanches à 1h00 du matin.
     *
     * Configuration via la propriété posdoc.bilan.purge.cron
     */
    @Scheduled(cron = "${posdoc.bilan.purge.cron:0 0 1 * * 0}", zone = "Europe/Paris")
    public void run() throws UnknownHostException {
        this.bilansPurgeService.purge();
    }
}
