package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.profile.primary.ProfileService;
import fr.acoss.posdoc.domain.profile.secondary.ProfilePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ProfileMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateProfileInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateProfilePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProfileResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileResolver.class);
    private static final ProfileMapper MAPPER = ProfileMapper.INSTANCE;

    private final ProfilePersistence profilePersistence;

    private final ProfileService profileService;

    public ProfileResolver(final ProfilePersistence profilePersistence, final ProfileService profileService) {
        this.profilePersistence = profilePersistence;
        this.profileService = profileService;
    }

    public CreateOrUpdateProfilePayloadDTO profile(String id) {
        return MAPPER.domainToPayloadDTO(profilePersistence.getProfile(id));
    }

    public List<CreateOrUpdateProfilePayloadDTO> allProfiles() {
        return profilePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Habilitations", action = Action.CREATE)
    public CreateOrUpdateProfilePayloadDTO createProfile(final CreateOrUpdateProfileInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createProfile: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(profileService.createProfile(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Habilitations", action = Action.UPDATE)
    public CreateOrUpdateProfilePayloadDTO updateProfile(final CreateOrUpdateProfileInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateProfile: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(profileService.updateProfile(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Administration > Habilitations", action = Action.DELETE)
    public DeletePayloadDTO deleteProfile(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteProfile: {}", deleteDTO);
        }

        profileService.deleteProfile(deleteDTO.getId());

        return new DeletePayloadDTO(Boolean.TRUE);
    }
}