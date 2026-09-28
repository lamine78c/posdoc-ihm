package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.OrganiClientCompositeId;
import fr.acoss.posdoc.database.entities.OrganiClientEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganiClientRepository extends GenericRepository<OrganiClientEntity, OrganiClientCompositeId> {


}
