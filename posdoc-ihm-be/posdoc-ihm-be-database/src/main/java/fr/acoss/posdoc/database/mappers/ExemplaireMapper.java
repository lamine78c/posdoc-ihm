package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ExemplaireEntity;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface ExemplaireMapper {

  ExemplaireMapper INSTANCE = Mappers.getMapper(ExemplaireMapper.class);

  @Mapping(source = "exemplaireEntity.id.codenv", target = "codenv")
  @Mapping(source = "exemplaireEntity.id.codorg", target = "codorg")
  @Mapping(source = "exemplaireEntity.id.codapp", target = "codapp")
  @Mapping(source = "exemplaireEntity.id.codcom", target = "codcom")
  @Mapping(source = "exemplaireEntity.id.codfic", target = "codfic")
  @Mapping(source = "exemplaireEntity.id.codgam", target = "codgam")
  @Mapping(source = "exemplaireEntity.id.numexe", target = "numexe")
  Exemplaire entityToDomain(final ExemplaireEntity exemplaireEntity);

  @Mapping(source="exemplaire.codenv",target="id.codenv")
  @Mapping(source="exemplaire.codorg",target="id.codorg")
  @Mapping(source="exemplaire.codapp",target="id.codapp")
  @Mapping(source="exemplaire.codcom",target="id.codcom")
  @Mapping(source="exemplaire.codfic",target="id.codfic")
  @Mapping(source="exemplaire.codgam",target="id.codgam")
  @Mapping(source="exemplaire.numexe",target="id.numexe")
  ExemplaireEntity domainToEntity(final Exemplaire exemplaire);

  ExemplaireFichier mapToExemplaireFichier(final Map<String, String> map);
}
