package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.JobLockEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface JobLockRepository extends GenericRepository<JobLockEntity, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM JobLockEntity WHERE name = :name AND date <= :dateLimit ")
    void unlockForce(@Param("name") String name, @Param("dateLimit") LocalDateTime dateLimit);

    @Query("SELECT COUNT(name) > 0 FROM JobLockEntity WHERE name = :name AND date <= :dateLimit ")
    boolean existsLockToForceUnlock(@Param("name") String name, @Param("dateLimit") LocalDateTime dateLimit);
}
