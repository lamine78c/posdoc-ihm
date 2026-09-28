package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateAdresseRetourInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateAdresseRetourPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.AdresseRetourDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface AdresseRetourMapper {

  AdresseRetourMapper INSTANCE = Mappers.getMapper(AdresseRetourMapper.class);

  AdresseRetourDTO domainToDTO(final AdresseRetour adresseRetour);

  @Mapping(target = "code", ignore = false)
  AdresseRetour inputDTOToDomain(final CreateOrUpdateAdresseRetourInputDTO createTarifDTO);


  CreateOrUpdateAdresseRetourPayloadDTO domainToPayloadDTO(final AdresseRetour adresseRetour);

}
