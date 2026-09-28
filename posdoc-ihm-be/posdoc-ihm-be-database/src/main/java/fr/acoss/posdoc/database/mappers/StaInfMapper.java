package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.StaInfEntity;
import fr.acoss.posdoc.domain.stainf.model.StaInf;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface StaInfMapper {

    StaInfMapper INSTANCE = Mappers.getMapper(StaInfMapper.class);

    @Mapping(source = "staInfEntity.id.statut", target = "statut")
    @Mapping(source = "staInfEntity.id.codinf", target = "codinf")
    StaInf entityToDomain(final StaInfEntity staInfEntity);

    @Mapping(source = "staInf.statut", target = "id.statut")
    @Mapping(source = "staInf.codinf", target = "id.codinf")
    StaInfEntity domainToEntity(final StaInf staInf);
}
