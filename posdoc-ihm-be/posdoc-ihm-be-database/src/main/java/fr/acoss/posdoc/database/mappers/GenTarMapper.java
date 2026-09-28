package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenTarEntity;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenTarMapper {

    GenTarMapper INSTANCE = Mappers.getMapper(GenTarMapper.class);

    @Mapping(source = "gentar.codenv", target = "id.c45Codenv")
    @Mapping(source = "gentar.codorg", target = "id.c45Codorg")
    @Mapping(source = "gentar.codapp", target = "id.c45Codapp")
    @Mapping(source = "gentar.percod", target = "id.c45Percod")
    @Mapping(source = "gentar.codcom", target = "id.c45Codcom")
    @Mapping(source = "gentar.numcom", target = "id.c45Numcom")
    @Mapping(source = "gentar.codfic", target = "id.c45Codfic")
    @Mapping(source = "gentar.typtar", target = "id.c45Typtar")
    @Mapping(source = "gentar.nbplis", target = "n45Nbplis")
    @Mapping(source = "gentar.coutot", target = "n45Coutot")
    GenTarEntity domainToEntity(final GenTar gentar);

    @Mapping(source = "gentarEntity.id.c45Codenv", target = "codenv")
    @Mapping(source = "gentarEntity.id.c45Codorg", target = "codorg")
    @Mapping(source = "gentarEntity.id.c45Codapp", target = "codapp")
    @Mapping(source = "gentarEntity.id.c45Percod", target = "percod")
    @Mapping(source = "gentarEntity.id.c45Codcom", target = "codcom")
    @Mapping(source = "gentarEntity.id.c45Numcom", target = "numcom")
    @Mapping(source = "gentarEntity.id.c45Codfic", target = "codfic")
    @Mapping(source = "gentarEntity.id.c45Typtar", target = "typtar")
    @Mapping(source = "gentarEntity.n45Nbplis", target = "nbplis")
    @Mapping(source = "gentarEntity.n45Coutot", target = "coutot")
    GenTar entityToDomain(final GenTarEntity gentarEntity);
}
