package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GroupeEntity;
import fr.acoss.posdoc.domain.groupe.model.Groupe;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GroupeMapper {

  GroupeMapper INSTANCE = Mappers.getMapper(GroupeMapper.class);

  Groupe entityToDomain(final GroupeEntity groupeEntity);

  GroupeEntity domainToEntity(final Groupe groupe);

}
