package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.VerrouEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface VerrouRepository extends GenericRepository<VerrouEntity, String> {

    @Query(value = "SELECT new VerrouEntity(v.code, v.libelle, v.maxExecution, " +
            "            (CASE WHEN EXISTS (SELECT 1 FROM GammeEntity g WHERE g.codeVerrou = v.code) " +
            "                  THEN true ELSE false END)) " +
            "FROM VerrouEntity v ORDER BY v.code ASC"
    )
    List<VerrouEntity> findAllByOrderByCodeAsc();

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);
}
