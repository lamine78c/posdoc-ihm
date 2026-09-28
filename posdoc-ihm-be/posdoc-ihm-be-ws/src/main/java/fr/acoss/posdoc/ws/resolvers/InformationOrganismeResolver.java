package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.informationorganisme.primary.InformationOrganismeService;
import fr.acoss.posdoc.domain.informationorganisme.secondary.InformationOrganismePersistence;
import fr.acoss.posdoc.ws.mappers.InformationOrganismeMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateInformationOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByIntIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateInformationOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateInformationOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InformationOrganismeResolver extends AbstractResolver {

  private static final Logger LOGGER = LoggerFactory.getLogger(InformationOrganismeResolver.class);

  private static final InformationOrganismeMapper MAPPER = InformationOrganismeMapper.INSTANCE;

  private final InformationOrganismeService informationOrganismeService;

  private final InformationOrganismePersistence informationOrganismePersistence;

  public InformationOrganismeResolver(final InformationOrganismeService informationOrganismeService,
                                      final InformationOrganismePersistence informationOrganismePersistence) {
    this.informationOrganismeService = informationOrganismeService;
    this.informationOrganismePersistence = informationOrganismePersistence;
  }

  public List<CreateOrUpdateInformationOrganismePayloadDTO> createInformationOrganisme(
      final CreateInformationOrganismeInputDTO createDTO) {

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("createInformationOrganisme: {}", createDTO);
    }

    return informationOrganismeService.createInformationOrganisme(MAPPER
        .inputDTOToDomain(createDTO)).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors
        .toList());
  }

  public CreateOrUpdateInformationOrganismePayloadDTO updateInformationOrganisme(
      final UpdateInformationOrganismeInputDTO updateDTO) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("updateInformationOrganisme: {}", updateDTO);
    }

    return MAPPER.domainToPayloadDTO(informationOrganismeService
        .updateInformationOrganisme(MAPPER.inputDTOToDomain(updateDTO)));

  }

  public DeletePayloadDTO deleteInformationOrganisme(
      final DeleteByIntIdInputDTO deleteInformationOrganismeInputDTO) {
    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("deleteInformationOrganisme: {}", deleteInformationOrganismeInputDTO);
    }

    informationOrganismeService.deleteInformationOrganisme(deleteInformationOrganismeInputDTO
        .getId());

    final var deletePayloadDTO = new DeletePayloadDTO();
    deletePayloadDTO.setOk(Boolean.TRUE);

    return deletePayloadDTO;
  }

  public PaginatedDTO informationOrganismes(final QueryParametersInputDTO queryParametersInputDTO) {
    return PA_MAPPER.paginatedToPaginatedDTO(informationOrganismePersistence
        .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
  }

}
