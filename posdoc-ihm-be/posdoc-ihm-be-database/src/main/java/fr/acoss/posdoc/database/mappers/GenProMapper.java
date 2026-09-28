package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenProEntity;
import fr.acoss.posdoc.domain.genpro.model.GenPro;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenProMapper {

  GenProMapper INSTANCE = Mappers.getMapper(GenProMapper.class);

  @Mapping(source = "genProEntity.id.codeEnv", target = "codeEnv")
  @Mapping(source = "genProEntity.id.codeOrg", target = "codeOrg")
  @Mapping(source = "genProEntity.id.codeApp", target = "codeApp")
  @Mapping(source = "genProEntity.id.perCod", target = "perCod")
  @Mapping(source = "genProEntity.id.codeCom", target = "codeCom")
  @Mapping(source = "genProEntity.id.numCom", target = "numCom")
  @Mapping(source = "genProEntity.id.codeFic", target = "codeFic")
  @Mapping(source = "genProEntity.id.codeGam", target = "codeGam")
  @Mapping(source = "genProEntity.proSta", target = "proSta")
  @Mapping(source = "genProEntity.proInf", target = "proInf")
  @Mapping(source = "genProEntity.prefec", target = "prefec")
  @Mapping(source = "genProEntity.dprodc", target = "dprodc")
  @Mapping(source = "genProEntity.dprodd", target = "dprodd")
  @Mapping(source = "genProEntity.dprodt", target = "dprodt")
  @Mapping(source = "genProEntity.dprods", target = "dprods")
  @Mapping(source = "genProEntity.dprodh", target = "dprodh")
  @Mapping(source = "genProEntity.pagFic", target = "pagFic")
  @Mapping(source = "genProEntity.pliFic", target = "pliFic")
  @Mapping(source = "genProEntity.rejFic", target = "rejFic")
  GenPro entityToDomain(final GenProEntity genProEntity);

  @Mapping(source = "genPro.codeEnv", target = "id.codeEnv")
  @Mapping(source = "genPro.codeOrg", target = "id.codeOrg")
  @Mapping(source = "genPro.codeApp", target = "id.codeApp")
  @Mapping(source = "genPro.perCod", target = "id.perCod")
  @Mapping(source = "genPro.codeCom", target = "id.codeCom")
  @Mapping(source = "genPro.numCom", target = "id.numCom")
  @Mapping(source = "genPro.codeFic", target = "id.codeFic")
  @Mapping(source = "genPro.codeGam", target = "id.codeGam")
  @Mapping(source = "genPro.proSta", target = "proSta")
  @Mapping(source = "genPro.proInf", target = "proInf")
  @Mapping(source = "genPro.prefec", target = "prefec")
  @Mapping(source = "genPro.dprodc", target = "dprodc")
  @Mapping(source = "genPro.dprodd", target = "dprodd")
  @Mapping(source = "genPro.dprodt", target = "dprodt")
  @Mapping(source = "genPro.dprods", target = "dprods")
  @Mapping(source = "genPro.dprodh", target = "dprodh")
  @Mapping(source = "genPro.pagFic", target = "pagFic")
  @Mapping(source = "genPro.pliFic", target = "pliFic")
  @Mapping(source = "genPro.rejFic", target = "rejFic")
  GenProEntity domainToEntity(final GenPro genPro);

}
