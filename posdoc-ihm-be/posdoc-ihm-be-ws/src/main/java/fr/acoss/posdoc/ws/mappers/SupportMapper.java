package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.support.model.Support;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateSupportInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateSupportPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.SupportDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface SupportMapper {

  SupportMapper INSTANCE = Mappers.getMapper(SupportMapper.class);

  SupportDTO domainToDTO(final Support support);

  CreateOrUpdateSupportPayloadDTO domainToPayloadDTO(final Support supportDTO);

  Support inputDTOToDomain(final CreateOrUpdateSupportInputDTO createDTO);

}
