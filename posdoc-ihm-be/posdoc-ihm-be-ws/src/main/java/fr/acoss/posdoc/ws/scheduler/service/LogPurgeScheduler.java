package fr.acoss.posdoc.ws.scheduler.service;

import fr.acoss.posdoc.domain.history.primary.HistoryService;
import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.net.UnknownHostException;

@Service
public class LogPurgeScheduler extends AbstractLockedJobRunner {
    private final UtiLogService utiLogService;
    private final HistoryService historyService;
    @Value("${scheduler.log.purge.retention-days-utilog}")
    private int daysUtilog;
    @Value("${scheduler.log.purge.retention-days-myslog}")
    private int daysMyslog;
    @Value("${scheduler.log.purge.retention-days-lock}")
    private int daysLocked;
    @Value("${scheduler.log.purge.batch-size}")
    private int batchSize;
    private static final String NAME_PURGE_LOG = "PURGE_LOG";

    public LogPurgeScheduler(final UtiLogService utiLogService, final HistoryService historyService, final JobLockService jobLockService) {
        super(jobLockService);
        this.utiLogService = utiLogService;
        this.historyService = historyService;
    }

    public void purge() throws UnknownHostException {
        this.runLockedJob(NAME_PURGE_LOG, daysLocked);
    }

    @Override
    @Transactional
    protected void runJob() {
        // purger dans l'ordre
        this.historyService.purge(daysMyslog, batchSize);
        this.utiLogService.purgeRowNotInMyslog(daysUtilog, batchSize);
    }
}
