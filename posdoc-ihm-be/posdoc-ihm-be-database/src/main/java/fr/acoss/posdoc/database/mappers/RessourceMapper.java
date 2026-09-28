package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.RessourceEntity;
import fr.acoss.posdoc.domain.ressource.model.Ressource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RessourceMapper {

  RessourceMapper INSTANCE = Mappers.getMapper(RessourceMapper.class);

  @Mapping(source = "ressourceEntity.id.codeEnvironnement", target = "codeEnvironnement")
  @Mapping(source = "ressourceEntity.id.codeOrganisme", target = "codeOrganisme")
  @Mapping(source = "ressourceEntity.id.codeApplication", target = "codeApplication")
  @Mapping(source = "ressourceEntity.id.codeGamme", target = "codeGamme")
  @Mapping(source = "ressourceEntity.id.codeSite", target = "codeSite")
  @Mapping(source = "ressourceEntity.id.codeRessource", target = "codeRessource")
  Ressource entityToDomain(final RessourceEntity ressourceEntity);

  @Mapping(source="ressource.codeEnvironnement",target="id.codeEnvironnement")
  @Mapping(source="ressource.codeOrganisme",target="id.codeOrganisme")
  @Mapping(source="ressource.codeApplication",target="id.codeApplication")
  @Mapping(source="ressource.codeGamme",target="id.codeGamme")
  @Mapping(source="ressource.codeSite",target="id.codeSite")
  @Mapping(source="ressource.codeRessource",target="id.codeRessource")
  RessourceEntity domainToEntity(final Ressource ressource);

}
