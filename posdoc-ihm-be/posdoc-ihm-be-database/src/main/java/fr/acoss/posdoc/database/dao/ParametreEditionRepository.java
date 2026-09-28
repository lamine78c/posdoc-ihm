package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ParametreEditionEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ParametreEditionRepository extends GenericRepository<ParametreEditionEntity, String> {

    @Query("select p from ParametreEditionEntity p order by p.reference ASC")
    List<ParametreEditionEntity> selectAll();
    @Transactional
    void deleteByReferenceIn(Iterable<String> codes);

    @Query("select distinct type from ParametreEditionEntity where type in (:formatCodes)")
    List<String> formatsExistsInparametresEditions(@Param("formatCodes") List<String> formatCodes);
}
