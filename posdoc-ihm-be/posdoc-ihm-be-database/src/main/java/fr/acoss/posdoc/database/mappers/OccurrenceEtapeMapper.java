package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationOccurrenceEtape;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface OccurrenceEtapeMapper {

    OccurrenceEtapeMapper INSTANCE = Mappers.getMapper(OccurrenceEtapeMapper.class);

    @Mapping(source = "id.codenv", target = "codenv")
    @Mapping(source = "id.codorg", target = "codorg")
    @Mapping(source = "id.codapp", target = "codapp")
    @Mapping(source = "id.percod", target = "percod")
    @Mapping(source = "id.codcom", target = "codcom")
    @Mapping(source = "id.codfic", target = "codfic")
    @Mapping(source = "refimp", target = "refimp")
    @Mapping(source = "libfic", target = "libfic")
    DetailsMassificationOccurrenceEtape genFicEntityToDetailsMassification(final GenFicEntity genFicEntity);

    @Mapping(source = "codenv", target = "id.codenv")
    @Mapping(source = "codorg", target = "id.codorg")
    @Mapping(source = "codapp", target = "id.codapp")
    @Mapping(source = "percod", target = "id.percod")
    @Mapping(source = "codcom", target = "id.codcom")
    @Mapping(source = "codfic", target = "id.codfic")
    @Mapping(source = "refimp", target = "refimp")
    @Mapping(source = "libfic", target = "libfic")
    GenFicEntity detailsMassificationToGenFicEntity(final DetailsMassificationOccurrenceEtape detailsMassification);
}
