package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.utilisateur.model.Utilisateur;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateUtilisateurInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateUtilisateurPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.UtilisateurDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UtilisateurMapper {

    UtilisateurMapper INSTANCE = Mappers.getMapper(UtilisateurMapper.class);

    @Mapping(target = "actif", source = "actif", qualifiedByName = "integerToBoolean")
    UtilisateurDTO domainToDTO(final Utilisateur utilisateur);

    @Mapping(target = "actif", source = "actif", qualifiedByName = "booleanToInteger")
    Utilisateur inputDTOToDomain(final CreateOrUpdateUtilisateurInputDTO inputDTO);

    @Mapping(target = "actif", source = "actif", qualifiedByName = "integerToBoolean")
    CreateOrUpdateUtilisateurPayloadDTO domainToPayloadDTO(final Utilisateur utilisateur);

    @Named("booleanToInteger")
    default Integer booleanToInteger(Boolean value) {
        if (value == null) {
            return null;
        }
        return value ? 1 : 0;
    }

    @Named("integerToBoolean")
    default Boolean integerToBoolean(Integer value) {
        if (value == null) {
            return Boolean.FALSE;
        }
        return value != 0;
    }
}
