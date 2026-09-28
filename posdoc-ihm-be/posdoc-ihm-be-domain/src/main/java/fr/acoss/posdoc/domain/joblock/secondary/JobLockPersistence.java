package fr.acoss.posdoc.domain.joblock.secondary;

import fr.acoss.posdoc.domain.joblock.model.JobLock;

public interface JobLockPersistence {

    JobLock create(JobLock jobLock);

    void delete(String id);

    void unlockForce(String id, int days);

    boolean existsById(String id);
}
