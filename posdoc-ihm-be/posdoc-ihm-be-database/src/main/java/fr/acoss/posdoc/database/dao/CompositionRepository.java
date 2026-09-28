package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.CompositionEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface CompositionRepository extends GenericRepository<CompositionEntity, String> {
    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query("select new CompositionEntity(c.code, c.libelle, (CASE WHEN EXISTS (SELECT 1 FROM ImprimeEntity i WHERE i.typeComposition = c.code) THEN true ELSE false END)) " +
            "from CompositionEntity c " +
            "ORDER BY c.code ASC")
    List<CompositionEntity> selectAll();

}
