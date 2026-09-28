package fr.acoss.posdoc.domain.joblock.primary;

import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.secondary.JobLockPersistence;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


public class JobLockService {
    private final JobLockPersistence jobLockPersistence;
    private static final Logger LOGGER = LoggerFactory.getLogger(JobLockService.class);

    public JobLockService(final JobLockPersistence jobLockPersistence) {
        this.jobLockPersistence = jobLockPersistence;
    }

    public JobLock create(JobLock jobLock) {
        if(this.jobLockPersistence.existsById(jobLock.getName())) {
            LOGGER.error("{} déjà pris", jobLock.getName());
            return null;
        }
        try {
            return this.jobLockPersistence.create(jobLock);
        } catch (CustomExceptionMessage e) {
            LOGGER.error("Erreur lors de la création du verrou {}", jobLock.getName(), e);
            return null;
        }
    }

    public void delete(String id) {
        try {
            this.jobLockPersistence.delete(id);
        } catch (CustomExceptionMessage e) {
            LOGGER.error("Erreur lors de la suppression du verrou {}", id, e);
        }
    }

    public void unlockForce(String name, int days) { this.jobLockPersistence.unlockForce(name, days); }
}
