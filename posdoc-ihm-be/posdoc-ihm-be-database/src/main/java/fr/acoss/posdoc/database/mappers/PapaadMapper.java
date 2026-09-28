package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.PapaadEntity;
import fr.acoss.posdoc.domain.papaad.model.Papaad;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface PapaadMapper {

  PapaadMapper INSTANCE = Mappers.getMapper(PapaadMapper.class);

  @Mapping(source = "papaadEntity.id.codeCommande", target = "codeCommande")
  @Mapping(source = "papaadEntity.id.codeFichier", target = "codeFichier")
  @Mapping(source = "papaadEntity.id.codeNotif", target = "codeNotif")
  Papaad entityToDomain(final PapaadEntity papaadEntity);

  @Mapping(source="papaad.codeCommande",target="id.codeCommande")
  @Mapping(source="papaad.codeFichier",target="id.codeFichier")
  @Mapping(source="papaad.codeNotif",target="id.codeNotif")
  PapaadEntity domainToEntity(final Papaad papaad);


}
