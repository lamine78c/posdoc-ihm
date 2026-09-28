package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.SupportEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface SupportRepository extends GenericRepository<SupportEntity, String> {
    @Transactional
    void deleteByTypeIn(Iterable<String> codes);

    @Query(value = "SELECT new SupportEntity(s.type, s.libelle, s.poids, (COUNT(fich) > 0)) FROM SupportEntity s " +
            "LEFT JOIN FichierEntity fich ON fich.typeSupport = s.type " +
            "GROUP BY s.type ORDER BY s.type ASC"
    )
    List<SupportEntity> selectAll();
}
