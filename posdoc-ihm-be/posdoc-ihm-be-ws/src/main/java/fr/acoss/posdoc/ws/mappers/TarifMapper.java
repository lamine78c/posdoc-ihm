package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.tarif.model.DeleteTarif;
import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateTarifDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteTarifInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateTarifDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateTarifPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.TarifDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TarifMapper {

  TarifMapper INSTANCE = Mappers.getMapper(TarifMapper.class);

  TarifDTO domainToDTO(final Tarif tarif);

  @Mapping(target = "numero", ignore = true)
  Tarif inputDTOToDomain(final CreateTarifDTO createTarifDTO);

  Tarif inputDTOToDomain(final UpdateTarifDTO updateTarifDTO);

  DeleteTarif inputDTOToDomain(final DeleteTarifInputDTO deleteTarifInputDTO);

  CreateOrUpdateTarifPayloadDTO domainToPayloadDTO(final Tarif tarif);

}
