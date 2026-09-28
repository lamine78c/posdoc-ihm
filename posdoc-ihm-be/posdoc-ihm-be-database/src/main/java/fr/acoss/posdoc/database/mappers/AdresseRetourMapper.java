package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.AdresseRetourEntity;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(uses = FichierMapper.class)
public interface AdresseRetourMapper {

  AdresseRetourMapper INSTANCE = Mappers.getMapper(AdresseRetourMapper.class);

  @Mapping(source = "adresseRetourEntity.id.code", target = "code")
  @Mapping(source = "adresseRetourEntity.id.codeOrganisme", target = "codeOrganisme")
  AdresseRetour entityToDomain(final AdresseRetourEntity adresseRetourEntity);

  @Mapping(source="adresseRetour.code",target="id.code")
  @Mapping(source="adresseRetour.codeOrganisme",target="id.codeOrganisme")
  AdresseRetourEntity domainToEntity(final AdresseRetour adresseRetour);

}
