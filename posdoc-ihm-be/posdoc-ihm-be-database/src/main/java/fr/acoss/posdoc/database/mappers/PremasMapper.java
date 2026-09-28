package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.PremasEntity;
import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.Premas;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface PremasMapper {

    PremasMapper INSTANCE = Mappers.getMapper(PremasMapper.class);

    @Mapping(source = "id.codenv", target = "codenv")
    @Mapping(source = "id.codorg", target = "codorg")
    @Mapping(source = "id.codapp", target = "codapp")
    @Mapping(source = "id.percod", target = "percod")
    @Mapping(source = "id.codcom", target = "codcom")
    @Mapping(source = "id.codfic", target = "codfic")
    @Mapping(source = "id.numcom", target = "numcom")
    @Mapping(source = "presta", target = "presta")
    @Mapping(source = "dprevc", target = "dprevc")
    @Mapping(source = "dprevt", target = "dprevt")
    @Mapping(source = "dprevi", target = "dprevi")
    Premas entityToDomain(final PremasEntity premasEntity);

    @Mapping(source = "codenv", target = "id.codenv")
    @Mapping(source = "codorg", target = "id.codorg")
    @Mapping(source = "codapp", target = "id.codapp")
    @Mapping(source = "percod", target = "id.percod")
    @Mapping(source = "codcom", target = "id.codcom")
    @Mapping(source = "codfic", target = "id.codfic")
    @Mapping(source = "numcom", target = "id.numcom")
    @Mapping(source = "presta", target = "presta")
    @Mapping(source = "dprevc", target = "dprevc")
    @Mapping(source = "dprevt", target = "dprevt")
    @Mapping(source = "dprevi", target = "dprevi")
    PremasEntity domainToEntity(final Premas preMas);

    DistinctEnvOrgAppModel mapToEnvOrgApp(final Map<String, String> map);
}
