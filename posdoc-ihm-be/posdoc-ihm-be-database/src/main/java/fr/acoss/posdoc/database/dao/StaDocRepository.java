package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.StaDocEntity;
import org.springframework.stereotype.Repository;

@Repository
public interface StaDocRepository extends GenericRepository<StaDocEntity, String> {

}
