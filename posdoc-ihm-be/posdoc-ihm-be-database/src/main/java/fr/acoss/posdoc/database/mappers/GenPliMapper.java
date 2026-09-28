package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenPliEntity;
import fr.acoss.posdoc.domain.genpli.model.GenPli;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface GenPliMapper {

  GenPliMapper INSTANCE = Mappers.getMapper(GenPliMapper.class);

  GenPli entityToDomain(final GenPliEntity genPliEntity);

  GenPliEntity domainToEntity(final GenPli genPli);

  SearchPliResult mapToSearchPliResult(final Map<String, String> map);

  SuiviAuPliDetailResult mapToSuiviAuPliDetailResult(final Map<String, String> map);
}
