package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateExemplaireInputDTO;
import fr.acoss.posdoc.ws.resolvers.query.ExemplaireDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ExemplaireMapper {

  ExemplaireMapper INSTANCE = Mappers.getMapper(ExemplaireMapper.class);

  ExemplaireDTO domainToDTO(final Exemplaire exemplaire);

  @Mapping(target = "codenv", ignore = false)
  Exemplaire inputDTOToDomain(final CreateOrUpdateExemplaireInputDTO createTarifDTO);
}
