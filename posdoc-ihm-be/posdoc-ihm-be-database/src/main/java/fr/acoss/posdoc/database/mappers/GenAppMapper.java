package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenAppEntity;
import fr.acoss.posdoc.domain.genapp.model.GenApp;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenAppMapper {

  GenAppMapper INSTANCE = Mappers.getMapper(GenAppMapper.class);

  @Mapping(source = "genAppEntity.id.codeEnv", target = "codeEnv")
  @Mapping(source = "genAppEntity.id.codeOrg", target = "codeOrg")
  @Mapping(source = "genAppEntity.id.codeApp", target = "codeApp")
  @Mapping(source = "genAppEntity.id.perCod", target = "perCod")
  @Mapping(source = "genAppEntity.appsta", target = "appsta")
  @Mapping(source = "genAppEntity.appinf", target = "appinf")
  @Mapping(source = "genAppEntity.arefec", target = "arefec")
  @Mapping(source = "genAppEntity.dapplc", target = "dapplc")
  @Mapping(source = "genAppEntity.dappld", target = "dappld")
  @Mapping(source = "genAppEntity.dapplt", target = "dapplt")
  @Mapping(source = "genAppEntity.dappls", target = "dappls")
  @Mapping(source = "genAppEntity.dapplh", target = "dapplh")
  @Mapping(source = "genAppEntity.typref", target = "typref")
  @Mapping(source = "genAppEntity.manuel", target = "manuel")
  @Mapping(source = "genAppEntity.sitori", target = "sitori")
  GenApp entityToDomain(final GenAppEntity genAppEntity);

  @Mapping(source = "genApp.codeEnv", target = "id.codeEnv")
  @Mapping(source = "genApp.codeOrg", target = "id.codeOrg")
  @Mapping(source = "genApp.codeApp", target = "id.codeApp")
  @Mapping(source = "genApp.perCod", target = "id.perCod")
  @Mapping(source = "genApp.appsta", target = "appsta")
  @Mapping(source = "genApp.appinf", target = "appinf")
  @Mapping(source = "genApp.arefec", target = "arefec")
  @Mapping(source = "genApp.dapplc", target = "dapplc")
  @Mapping(source = "genApp.dappld", target = "dappld")
  @Mapping(source = "genApp.dapplt", target = "dapplt")
  @Mapping(source = "genApp.dappls", target = "dappls")
  @Mapping(source = "genApp.dapplh", target = "dapplh")
  @Mapping(source = "genApp.typref", target = "typref")
  @Mapping(source = "genApp.manuel", target = "manuel")
  @Mapping(source = "genApp.sitori", target = "sitori")
  GenAppEntity domainToEntity(final GenApp genApp);

}
