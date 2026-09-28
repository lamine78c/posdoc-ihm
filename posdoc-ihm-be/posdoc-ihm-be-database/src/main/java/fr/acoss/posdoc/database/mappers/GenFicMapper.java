package fr.acoss.posdoc.database.mappers;


import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.expedition.model.Expedition;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenFicMapper {

  GenFicMapper INSTANCE = Mappers.getMapper(GenFicMapper.class);

  @Mapping(source = "genFicEntity.id.codenv", target = "codenv")
  @Mapping(source = "genFicEntity.id.codorg", target = "codorg")
  @Mapping(source = "genFicEntity.id.codapp", target = "codapp")
  @Mapping(source = "genFicEntity.id.percod", target = "percod")
  @Mapping(source = "genFicEntity.id.codcom", target = "codcom")
  @Mapping(source = "genFicEntity.id.numcom", target = "numcom")
  @Mapping(source = "genFicEntity.id.codfic", target = "codfic")
  GenFic entityToDomain(final GenFicEntity genFicEntity);

  @Mapping(source = "genFic.codenv", target = "id.codenv")
  @Mapping(source = "genFic.codorg", target = "id.codorg")
  @Mapping(source = "genFic.codapp", target = "id.codapp")
  @Mapping(source = "genFic.percod", target = "id.percod")
  @Mapping(source = "genFic.codcom", target = "id.codcom")
  @Mapping(source = "genFic.numcom", target = "id.numcom")
  @Mapping(source = "genFic.codfic", target = "id.codfic")
  GenFicEntity domainToEntity(final GenFic genFic);

  @Mapping(source = "id.codcom", target = "codcom")
  @Mapping(source = "id.codfic", target = "codfic")
  @Mapping(source = "id.numcom", target = "numcom")
  @Mapping(source = "id.codenv", target = "codenv")
  @Mapping(source = "id.codorg", target = "codorg")
  @Mapping(source = "id.codapp", target = "codapp")
  @Mapping(source = "id.percod", target = "percod")
  Expedition genFicEntityToExpedition(final GenFicEntity genFicEntity);

  @Mapping(source = "codcom", target = "id.codcom")
  @Mapping(source = "codfic", target = "id.codfic")
  @Mapping(source = "numcom", target = "id.numcom")
  @Mapping(source = "codenv", target = "id.codenv")
  @Mapping(source = "codorg", target = "id.codorg")
  @Mapping(source = "codapp", target = "id.codapp")
  @Mapping(source = "percod", target = "id.percod")
  GenFicEntity expeditionTogenFicEntity(final Expedition expedition);

  @Mapping(source = "id.codcom", target = "codcom")
  @Mapping(source = "id.codfic", target = "codfic")
  @Mapping(source = "id.numcom", target = "numcom")
  @Mapping(source = "id.codenv", target = "codenv")
  @Mapping(source = "id.codorg", target = "codorg")
  @Mapping(source = "id.codapp", target = "codapp")
  @Mapping(source = "id.percod", target = "percod")
  BonTravailUpdateDTO entityToDomainBonTravail(final GenFicEntity genFicEntity);

  @Mapping(source = "id.codeFich", target = "id.codfic")
  @Mapping(source = "id.codeCom", target = "id.codcom")
  @Mapping(source = "id.codeEnv", target = "id.codenv")
  @Mapping(source = "id.codeOrg", target = "id.codorg")
  @Mapping(source = "id.codeApp", target = "id.codapp")
  @Mapping(source = "libFichier", target = "libfic")
  @Mapping(source = "typeFormat", target = "typfor")
  @Mapping(source = "typeSupport", target = "typsup")
  @Mapping(source = "typeMultif", target = "typmul")
  @Mapping(source = "refSupport", target = "refsup")
  @Mapping(source = "refFormat", target = "reffor")
  @Mapping(source = "refImprime", target = "refimp")
  @Mapping(source = "refech", target = "refech")
  @Mapping(source = "page", target = "maxpag")
  @Mapping(source = "codeProd", target = "codprd")
  @Mapping(source = "typeSig", target = "typsig")
  @Mapping(source = "codeClient", target = "codcli")
  @Mapping(source = "refTri", target = "reftri")
  @Mapping(source = "nbrRep", target = "nbrrep")
  @Mapping(source = "refecl", target = "refecl")
  @Mapping(source = "ficAtt", target = "ficatt")
  @Mapping(source = "repExp", target = "repexp")
  @Mapping(source = "ediver", target = "ediver")
  @Mapping(source = "cbadre", target = "cbadre")
  @Mapping(source = "banimp", target = "banimp")
  @Mapping(source = "appbac", target = "appbac")
  @Mapping(source = "specim", target = "specim")
  GenFicEntity entityFichierToEntityGenFic(final FichierEntity fichierEntity);
}
