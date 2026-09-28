package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateInformationOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.UpdateInformationOrganismeInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateInformationOrganismePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.InformationOrganismeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.ArrayList;
import java.util.List;

@Mapper(uses = OrganismeMapper.class)
public interface InformationOrganismeMapper {

  InformationOrganismeMapper INSTANCE = Mappers.getMapper(InformationOrganismeMapper.class);

  InformationOrganismeDTO domainToDTO(final InformationOrganisme informationOrganisme);

  @Mapping(source = "informationOrganisme.organisme.code", target = "organismeId")
  CreateOrUpdateInformationOrganismePayloadDTO domainToPayloadDTO(
      final InformationOrganisme informationOrganisme);

  @Mapping(target = "organisme", ignore = true)
  @Mapping(target = "date", ignore = true)
  InformationOrganisme inputDTOToDomain(
      final UpdateInformationOrganismeInputDTO updateInformationOrganismeInputDTO);

  default List<InformationOrganisme> inputDTOToDomain(
      final CreateInformationOrganismeInputDTO createDTO) {

    final List<InformationOrganisme> informationOrganismes = new ArrayList<>();

    for (final String idOrganisme : createDTO.getOrganismeId()) {

      final var infoOrganisme = new InformationOrganisme();
      infoOrganisme.setActif(createDTO.getActif());
      infoOrganisme.setMessage(createDTO.getMessage());

      final var organisme = new Organisme();
      organisme.setCode(idOrganisme);

      infoOrganisme.setOrganisme(organisme);
    }

    return informationOrganismes;

  }

}
