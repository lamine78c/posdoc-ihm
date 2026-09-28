package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.HisProEntity;
import fr.acoss.posdoc.domain.hispro.model.HisPro;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HisProMapper {

  HisProMapper INSTANCE = Mappers.getMapper(HisProMapper.class);

  @Mapping(source = "hisProEntity.id.codeEnv", target = "codeEnv")
  @Mapping(source = "hisProEntity.id.codeOrg", target = "codeOrg")
  @Mapping(source = "hisProEntity.id.codeApp", target = "codeApp")
  @Mapping(source = "hisProEntity.id.perCod", target = "perCod")
  @Mapping(source = "hisProEntity.id.codeCom", target = "codeCom")
  @Mapping(source = "hisProEntity.id.numCom", target = "numCom")
  @Mapping(source = "hisProEntity.id.codeFic", target = "codeFic")
  @Mapping(source = "hisProEntity.id.codeGam", target = "codeGam")
  @Mapping(source = "hisProEntity.proSta", target = "proSta")
  @Mapping(source = "hisProEntity.proInf", target = "proInf")
  @Mapping(source = "hisProEntity.prefec", target = "prefec")
  @Mapping(source = "hisProEntity.dprodc", target = "dprodc")
  @Mapping(source = "hisProEntity.dprodd", target = "dprodd")
  @Mapping(source = "hisProEntity.dprodt", target = "dprodt")
  @Mapping(source = "hisProEntity.dprods", target = "dprods")
  @Mapping(source = "hisProEntity.dprodh", target = "dprodh")
  @Mapping(source = "hisProEntity.pagFic", target = "pagFic")
  @Mapping(source = "hisProEntity.pliFic", target = "pliFic")
  @Mapping(source = "hisProEntity.rejFic", target = "rejFic")
  HisPro entityToDomain(final HisProEntity hisProEntity);

  @Mapping(source = "hisPro.codeEnv", target = "id.codeEnv")
  @Mapping(source = "hisPro.codeOrg", target = "id.codeOrg")
  @Mapping(source = "hisPro.codeApp", target = "id.codeApp")
  @Mapping(source = "hisPro.perCod", target = "id.perCod")
  @Mapping(source = "hisPro.codeCom", target = "id.codeCom")
  @Mapping(source = "hisPro.numCom", target = "id.numCom")
  @Mapping(source = "hisPro.codeFic", target = "id.codeFic")
  @Mapping(source = "hisPro.codeGam", target = "id.codeGam")
  @Mapping(source = "hisPro.proSta", target = "proSta")
  @Mapping(source = "hisPro.proInf", target = "proInf")
  @Mapping(source = "hisPro.prefec", target = "prefec")
  @Mapping(source = "hisPro.dprodc", target = "dprodc")
  @Mapping(source = "hisPro.dprodd", target = "dprodd")
  @Mapping(source = "hisPro.dprodt", target = "dprodt")
  @Mapping(source = "hisPro.dprods", target = "dprods")
  @Mapping(source = "hisPro.dprodh", target = "dprodh")
  @Mapping(source = "hisPro.pagFic", target = "pagFic")
  @Mapping(source = "hisPro.pliFic", target = "pliFic")
  @Mapping(source = "hisPro.rejFic", target = "rejFic")
  HisProEntity domainToEntity(final HisPro hisPro);

}
