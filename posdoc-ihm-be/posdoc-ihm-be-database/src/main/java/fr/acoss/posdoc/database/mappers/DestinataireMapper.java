package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.DestinataireCompositeId;
import fr.acoss.posdoc.database.entities.DestinataireEntity;
import fr.acoss.posdoc.domain.destinataire.model.CodeDestinataireCodeOrg;
import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface DestinataireMapper {

  DestinataireMapper INSTANCE = Mappers.getMapper(DestinataireMapper.class);

  @Mapping(source = "destinataireEntity.id.code", target = "code")
  @Mapping(source = "destinataireEntity.id.codeOrg", target = "codeOrg")
  @Mapping(source = "destinataireEntity.libelle", target = "libelle")
  @Mapping(source = "destinataireEntity.refPri", target = "refPri")
  Destinataire entityToDomain(final DestinataireEntity destinataireEntity);

  @Mapping(source = "destinataire.code", target = "id.code")
  @Mapping(source = "destinataire.codeOrg", target = "id.codeOrg")
  @Mapping(source = "destinataire.libelle", target = "libelle")
  @Mapping(source = "destinataire.refPri", target = "refPri")
  DestinataireEntity domainToEntity(final Destinataire destinataire);

  @Mapping(source = "destinataireCompositeIdModel.code", target = "code")
  @Mapping(source = "destinataireCompositeIdModel.codeOrg", target = "codeOrg")
  DestinataireCompositeId domainToEntity(final DestinataireCompositeIdModel destinataireCompositeIdModel);

  @Mapping(source = "map.code", target = "code")
  @Mapping(source = "map.codeOrg", target = "codeOrg")
  CodeDestinataireCodeOrg mapToCodeDestinataireCodeOrg(Map<String, String> map);
}
