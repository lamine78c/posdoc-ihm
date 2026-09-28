package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.InformationOrganismeEntity;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface InformationOrganismeRepository
    extends GenericRepository<InformationOrganismeEntity, Integer> {

  @Transactional
  void deleteAllByIdIn(final List<Integer> ids);

}
