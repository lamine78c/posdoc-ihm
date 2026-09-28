package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ProduiEntity;
import fr.acoss.posdoc.domain.produi.model.Produi;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProduiMapper {

  ProduiMapper INSTANCE = Mappers.getMapper(ProduiMapper.class);

  Produi entityToDomain(final ProduiEntity produiEntity);

  @Mapping(source="produi.codenv",target="id.codenv")
  @Mapping(source="produi.codorg",target="id.codorg")
  @Mapping(source="produi.codapp",target="id.codapp")
  @Mapping(source="produi.codcom",target="id.codcom")
  @Mapping(source="produi.codfic",target="id.codfic")
  @Mapping(source="produi.codgam",target="id.codgam")
  ProduiEntity domainToEntity(final Produi produi);

}
