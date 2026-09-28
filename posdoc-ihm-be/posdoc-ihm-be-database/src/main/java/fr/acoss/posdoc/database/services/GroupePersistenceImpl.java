package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.GroupeRepository;
import fr.acoss.posdoc.database.entities.GroupeEntity;
import fr.acoss.posdoc.database.mappers.GroupeMapper;
import fr.acoss.posdoc.domain.groupe.model.Groupe;
import fr.acoss.posdoc.domain.groupe.secondary.GroupePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class GroupePersistenceImpl
    extends AbstractObjectPersistence<GroupeEntity, String, Groupe>
    implements GroupePersistence {

  private static final GroupeMapper GROUPE_MAPPER = GroupeMapper.INSTANCE;

  private final GroupeRepository groupeRepository;

  public GroupePersistenceImpl(GroupeRepository groupeRepository) {
    this.groupeRepository = groupeRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GroupeEntity> getSpecificationExecutor() {
    return groupeRepository;
  }

  @Override
  protected JpaRepository<GroupeEntity, String> getRepository() {
    return groupeRepository;
  }

  @Override
  protected Function<GroupeEntity, Groupe> entityToDomainFunction() {
    return GROUPE_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Groupe, GroupeEntity> domainToEntityFunction() {
    return GROUPE_MAPPER::domainToEntity;
  }

}
