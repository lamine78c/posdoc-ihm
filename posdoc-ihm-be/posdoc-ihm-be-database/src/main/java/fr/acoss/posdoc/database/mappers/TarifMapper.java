package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.TarifEntity;
import fr.acoss.posdoc.domain.tarif.model.Tarif;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TarifMapper {

  TarifMapper INSTANCE = Mappers.getMapper(TarifMapper.class);

  @Mapping(source = "tarifEntity.id.type", target = "type")
  @Mapping(source = "tarifEntity.id.numero", target = "numero")
  Tarif entityToDomain(final TarifEntity tarifEntity);

  @Mapping(source="tarif.type",target="id.type")
  @Mapping(source="tarif.numero",target="id.numero")
  TarifEntity domainToEntity(final Tarif tarif);

}
