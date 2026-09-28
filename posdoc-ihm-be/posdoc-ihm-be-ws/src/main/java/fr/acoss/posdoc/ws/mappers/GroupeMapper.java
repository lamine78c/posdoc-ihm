package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.GroupeEntity;
import fr.acoss.posdoc.domain.groupe.model.Groupe;
import fr.acoss.posdoc.ws.resolvers.query.GroupeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GroupeMapper {

  GroupeMapper INSTANCE = Mappers.getMapper(GroupeMapper.class);

  GroupeDTO domainToDTO(final Groupe groupe);
  GroupeEntity domainToEntity(final Groupe groupe);

}
