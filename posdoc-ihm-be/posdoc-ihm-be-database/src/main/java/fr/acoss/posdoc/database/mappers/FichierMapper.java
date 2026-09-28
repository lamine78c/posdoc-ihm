package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FichierMapper {

  FichierMapper INSTANCE = Mappers.getMapper(FichierMapper.class);

  @Mapping(source = "fichierEntity.id.codeEnv", target = "codeEnv")
  @Mapping(source = "fichierEntity.id.codeOrg", target = "codeOrg")
  @Mapping(source = "fichierEntity.id.codeApp", target = "codeApp")
  @Mapping(source = "fichierEntity.id.codeCom", target = "codeCom")
  @Mapping(source = "fichierEntity.id.codeFich", target = "codeFich")
  @Mapping(target = "exemplaires", ignore = true)
  @Mapping(target = "isNotAuthorisedToBeDeleted", ignore = true)
  Fichier entityToDomain(final FichierEntity fichierEntity);

  @Mapping(source="fichier.codeEnv",target="id.codeEnv")
  @Mapping(source="fichier.codeOrg",target="id.codeOrg")
  @Mapping(source="fichier.codeApp",target="id.codeApp")
  @Mapping(source="fichier.codeCom",target="id.codeCom")
  @Mapping(source="fichier.codeFich",target="id.codeFich")
  FichierEntity domainToEntity(final Fichier fichier);

  FichierCompositeId domainToEntity(final FichierComposite fichierComposite);

  void updateEntity(Fichier fichier, @MappingTarget FichierEntity fichierEntity);
}
