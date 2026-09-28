package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.NotficEntity;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.NotFicInput;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface NotficMapper {

    NotficMapper INSTANCE = Mappers.getMapper(NotficMapper.class);


    @Mapping(source = "id.codenv", target = "codenv")
    @Mapping(source = "id.codorg", target = "codorg")
    @Mapping(source = "id.codapp", target = "codapp")
    @Mapping(source = "id.codcom", target = "codcom")
    @Mapping(source = "id.codfic", target = "codfic")
    @Mapping(source = "id.codnot", target = "codnot")
    NotFic entityToDomain(final NotficEntity notFicEntity);


    @Mapping(source = "codenv", target = "id.codenv")
    @Mapping(source = "codorg", target = "id.codorg")
    @Mapping(source = "codapp", target = "id.codapp")
    @Mapping(source = "codcom", target = "id.codcom")
    @Mapping(source = "codfic", target = "id.codfic")
    @Mapping(source = "codnot", target = "id.codnot")
    @Mapping(source = "dnotid", target = "dnotid", dateFormat = "yyyy-MM-dd")
    @Mapping(source = "dnotit", target = "dnotit", dateFormat = "yyyy-MM-dd")
    NotficEntity domainToEntity(final NotFic notFic);

    List<NotFic> inputDTOToDomain(final List<NotFicInput> inputList);

    NotFicCompositeId domainToCompositeId(final NotFic notFic);
}
