package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.FaqEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends GenericRepository<FaqEntity, Integer> {

    @Query("SELECT f FROM FaqEntity f " +
            "WHERE f.path = :path")
    List<FaqEntity> findByPath(@Param("path") String path);

    @Query("SELECT f FROM FaqEntity f " +
            "WHERE createdBy = :userId AND status = 'DRAFT'")
    List<FaqEntity> findByUserId(@Param("userId") String userId);
}
