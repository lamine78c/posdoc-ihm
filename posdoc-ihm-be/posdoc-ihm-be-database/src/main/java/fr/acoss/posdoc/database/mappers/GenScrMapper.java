package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenScrEntity;
import fr.acoss.posdoc.domain.genscr.model.GenScr;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenScrMapper {

  GenScrMapper INSTANCE = Mappers.getMapper(GenScrMapper.class);

  GenScr entityToDomain(final GenScrEntity genScrEntity);

  GenScrEntity domainToEntity(final GenScr genScr);

}
