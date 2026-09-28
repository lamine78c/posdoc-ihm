package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.help.model.CreateHelpDTO;
import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.domain.help.model.HelpDTO;
import fr.acoss.posdoc.domain.help.model.UpdateHelpDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface HelpMapper {

    HelpMapper INSTANCE = Mappers.getMapper(HelpMapper.class);

    HelpDTO domaineToDTO(final Help help);

    Help inputDTOToDomain(final CreateHelpDTO createHelpDTO);

    Help inputDTOToDomain(final UpdateHelpDTO updateHelpDTO);
}