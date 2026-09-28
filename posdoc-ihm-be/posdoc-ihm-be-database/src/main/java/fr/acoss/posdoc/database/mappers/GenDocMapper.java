package fr.acoss.posdoc.database.mappers;


import fr.acoss.posdoc.database.entities.GenDocEntity;
import fr.acoss.posdoc.domain.gendoc.model.GenDoc;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenDocMapper {

  GenDocMapper INSTANCE = Mappers.getMapper(GenDocMapper.class);

  @Mapping(source = "genDocEntity.id.datdem", target = "datdem")
  @Mapping(source = "genDocEntity.id.numdem", target = "numdem")
  @Mapping(source = "genDocEntity.codenv", target = "codenv")
  @Mapping(source = "genDocEntity.codorg", target = "codorg")
  @Mapping(source = "genDocEntity.codapp", target = "codapp")
  @Mapping(source = "genDocEntity.percod", target = "percod")
  @Mapping(source = "genDocEntity.codcom", target = "codcom")
  @Mapping(source = "genDocEntity.numcom", target = "numcom")
  @Mapping(source = "genDocEntity.codfic", target = "codfic")
  @Mapping(source = "genDocEntity.coddoc", target = "coddoc")
  @Mapping(source = "genDocEntity.refdem", target = "refdem")
  @Mapping(source = "genDocEntity.typact", target = "typact")
  @Mapping(source = "genDocEntity.imprim", target = "imprim")
  @Mapping(source = "genDocEntity.docsta", target = "docsta")
  @Mapping(source = "genDocEntity.docinf", target = "docinf")
  @Mapping(source = "genDocEntity.ddodeb", target = "ddodeb")
  @Mapping(source = "genDocEntity.ddofin", target = "ddofin")
  @Mapping(source = "genDocEntity.ddosus", target = "ddosus")
  @Mapping(source = "genDocEntity.tpscom", target = "tpscom")
  @Mapping(source = "genDocEntity.retour", target = "retour")
  @Mapping(source = "genDocEntity.ddoimp", target = "ddoimp")
  @Mapping(source = "genDocEntity.ddoexp", target = "ddoexp")
  GenDoc entityToDomain(final GenDocEntity genDocEntity);

  @Mapping(source = "genDoc.datdem", target = "id.datdem")
  @Mapping(source = "genDoc.numdem", target = "id.numdem")
  @Mapping(source = "genDoc.codenv", target = "codenv")
  @Mapping(source = "genDoc.codorg", target = "codorg")
  @Mapping(source = "genDoc.codapp", target = "codapp")
  @Mapping(source = "genDoc.percod", target = "percod")
  @Mapping(source = "genDoc.codcom", target = "codcom")
  @Mapping(source = "genDoc.numcom", target = "numcom")
  @Mapping(source = "genDoc.codfic", target = "codfic")
  @Mapping(source = "genDoc.coddoc", target = "coddoc")
  @Mapping(source = "genDoc.refdem", target = "refdem")
  @Mapping(source = "genDoc.typact", target = "typact")
  @Mapping(source = "genDoc.imprim", target = "imprim")
  @Mapping(source = "genDoc.docsta", target = "docsta")
  @Mapping(source = "genDoc.docinf", target = "docinf")
  @Mapping(source = "genDoc.ddodeb", target = "ddodeb")
  @Mapping(source = "genDoc.ddofin", target = "ddofin")
  @Mapping(source = "genDoc.ddosus", target = "ddosus")
  @Mapping(source = "genDoc.tpscom", target = "tpscom")
  @Mapping(source = "genDoc.retour", target = "retour")
  @Mapping(source = "genDoc.ddoimp", target = "ddoimp")
  @Mapping(source = "genDoc.ddoexp", target = "ddoexp")
  GenDocEntity domainToEntity(final GenDoc genDoc);

}
