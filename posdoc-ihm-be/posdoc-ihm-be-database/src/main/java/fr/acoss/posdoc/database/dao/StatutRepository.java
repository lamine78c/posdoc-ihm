package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.StatutEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatutRepository extends GenericRepository<StatutEntity, String> {

    @Query(value = "SELECT DISTINCT new fr.acoss.posdoc.database.entities.StatutEntity(s.code, s.libelle) FROM StatutEntity s ORDER BY s.code ASC")
    List<StatutEntity> findAllStatutOrderByCodeAsc();
}
