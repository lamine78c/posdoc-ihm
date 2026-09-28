package fr.acoss.posdoc.ws.scheduler.service;

import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.primary.JobLockService;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.LocalDateTime;

public abstract class AbstractLockedJobRunner {

    protected final JobLockService jobLockService;

    protected AbstractLockedJobRunner(final JobLockService jobLockService) {
        this.jobLockService = jobLockService;
    }

    protected abstract void runJob();

    public void runLockedJob(String jobName, int daysLocked) throws UnknownHostException {

        this.jobLockService.unlockForce(jobName, daysLocked);

        String hostname = InetAddress.getLocalHost().getHostName();

        JobLock jobLock = new JobLock();
        jobLock.setName(jobName);
        jobLock.setServer(hostname);
        jobLock.setDate(LocalDateTime.now());

        execute(jobLock, this::runJob);
    }

    private void execute(JobLock jobLock, Runnable job) {
        jobLock = this.jobLockService.create(jobLock);
        if (jobLock == null) {
            return;
        }
        try {
            job.run();
        } finally {
            this.jobLockService.delete(jobLock.getName());
        }
    }
}
