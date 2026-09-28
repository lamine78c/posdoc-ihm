package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeForCompare;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCommandeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CommandeForComparePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCommandePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.CommandeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface CommandeMapper {

  CommandeMapper INSTANCE = Mappers.getMapper(CommandeMapper.class);

  CommandeDTO domainToDTO(final Commande commande);

  CommandeEntity domainToEntity(final Commande commande);

  @Mapping(target = "codenv", ignore = false)
  @Mapping(target = "codorg", ignore = false)
  @Mapping(target = "codapp", ignore = false)
  @Mapping(target = "code", ignore = false)
  Commande inputDTOToDomain(final CreateOrUpdateCommandeInputDTO commandeInputDTO);

  CreateOrUpdateCommandePayloadDTO domainToPayloadDTO(final Commande commande);

  CommandeForComparePayloadDTO commandeForCompareToPayloadDTO(final CommandeForCompare commandeForCompare);
  List<CommandeForComparePayloadDTO> commandesForCompareToPayloadDTO(final List<CommandeForCompare> commandeForCompare);
}
