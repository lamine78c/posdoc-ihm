package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.profile.model.Profile;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateProfileInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProfilePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ProfileDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ProfileMapper {

    ProfileMapper INSTANCE = Mappers.getMapper(ProfileMapper.class);

    ProfileDTO domainToDTO(final Profile profile);

    Profile inputDTOToDomain(final CreateOrUpdateProfileInputDTO inputDTO);

    CreateOrUpdateProfilePayloadDTO domainToPayloadDTO(final Profile profile);
}
