package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.PapaadCompositeIdEntity;
import fr.acoss.posdoc.database.entities.PapaadEntity;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface PapaadRepository extends GenericRepository<PapaadEntity, PapaadCompositeIdEntity> {

    @Transactional
    void deleteByIdIn(Iterable<PapaadCompositeIdEntity> ids);
}
