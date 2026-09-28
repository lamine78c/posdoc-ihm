package fr.acoss.posdoc.ws.mappers;


import fr.acoss.posdoc.domain.parametre.echantillon.model.ParametreEchantillon;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateParametreEchantillonInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateParametreEchantillonPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.ParametreEchantillonDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ParametreEchantillonMapper {

    ParametreEchantillonMapper INSTANCE = Mappers.getMapper(ParametreEchantillonMapper.class);

    ParametreEchantillonDTO domainToDTO(final ParametreEchantillon parametreEchantillon);

    ParametreEchantillon inputDTOToDomain(final CreateOrUpdateParametreEchantillonInputDTO inputDTO);

    CreateOrUpdateParametreEchantillonPayloadDTO domainToPayloadDTO(
            final ParametreEchantillon parametreDistribution);

}
