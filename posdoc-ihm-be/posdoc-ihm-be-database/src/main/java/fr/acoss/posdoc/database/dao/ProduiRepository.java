package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ProduiCompositeId;
import fr.acoss.posdoc.database.entities.ProduiEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduiRepository extends GenericRepository<ProduiEntity, ProduiCompositeId> {

    @Query("select distinct p.id.codapp from ProduiEntity p where p.id.codgam in (:gammeCodes)")
    List<String> gammesExistsInProduits(@Param("gammeCodes") List<String> gammeCodes);
}
