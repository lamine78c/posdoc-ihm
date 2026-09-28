package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.HelpEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HelpRepository extends GenericRepository<HelpEntity, Integer> {
    List<HelpEntity> findByPath(String path);

    @Query(value = "SELECT * FROM help h WHERE h.path = :path AND h.state = CAST(:state AS help_typestate)", nativeQuery = true)
    Optional<HelpEntity> findAllByPathAndState(@Param("path") String path, @Param("state") String state);
}
