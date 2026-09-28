package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.domain.commande.model.Commande;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CommandeMapper {

  CommandeMapper INSTANCE = Mappers.getMapper(CommandeMapper.class);

  @Mapping(source = "commandeEntity.id.codenv", target = "codenv")
  @Mapping(source = "commandeEntity.id.codorg", target = "codorg")
  @Mapping(source = "commandeEntity.id.codapp", target = "codapp")
  @Mapping(source = "commandeEntity.id.code", target = "code")
  Commande entityToDomain(final CommandeEntity commandeEntity);

  @Mapping(source="commande.codenv",target="id.codenv")
  @Mapping(source="commande.codorg",target="id.codorg")
  @Mapping(source="commande.codapp",target="id.codapp")
  @Mapping(source="commande.code",target="id.code")
  CommandeEntity domainToEntity(final Commande commande);
}
