package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ParametreEchantillonEntity;
import fr.acoss.posdoc.domain.parametre.echantillon.model.ParametreEchantillon;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreEchantillonMapper {

  ParametreEchantillonMapper INSTANCE = Mappers.getMapper(ParametreEchantillonMapper.class);

  ParametreEchantillon entityToDomain(final ParametreEchantillonEntity parametreEchantillonEntity);

  ParametreEchantillonEntity domainToEntity(final ParametreEchantillon parametreEchantillon);

}
