package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.MultifEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface MultifRepository extends GenericRepository<MultifEntity, String> {
    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query(value = "SELECT new MultifEntity(m.code, m.libelle, " +
            " (CASE WHEN EXISTS (SELECT 1 FROM FichierEntity f WHERE f.typeMultif = m.code) THEN true ELSE false END)) " +
            " FROM MultifEntity m " +
            " ORDER BY m.code ASC"
    )
    List<MultifEntity> selectAll();
}
