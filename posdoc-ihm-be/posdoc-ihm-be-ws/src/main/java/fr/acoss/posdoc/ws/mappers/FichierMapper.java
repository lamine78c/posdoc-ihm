package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.fichier.model.ComFichProdInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvAppRefImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvDocImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFichierInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteFichierInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.ComFichProdEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.EnvAppRefImpEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.EnvDocImpEnGroupInFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.FichierDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface FichierMapper {

    FichierMapper INSTANCE = Mappers.getMapper(FichierMapper.class);

    FichierDTO domainToDTO(final Fichier fichier);

    Fichier inputDTOToDomain(final CreateOrUpdateFichierInputDTO fichier);

    FichierComposite inputDTOToDomain(final DeleteFichierInputDTO fichierComposite);

    List<Fichier> inputsDTOToDomains(List<CreateOrUpdateFichierInputDTO> fichier);

    CreateOrUpdateFichierPayloadDTO domainToPayloadDTO(final Fichier fichier);

    List<CreateOrUpdateFichierPayloadDTO> domainToPayloadDTO(List<Fichier> fichier);

    List<EnvAppRefImpEnGroupInFichierPayloadDTO> domainSearchToPayloadDTO(List<EnvAppRefImpInFichier> envAppRefImpInFichier);

    List<ComFichProdEnGroupInFichierPayloadDTO> domainProdToPayloadDTO(List<ComFichProdInFichier> comFichProdInFichier);

    List<EnvDocImpEnGroupInFichierPayloadDTO> domainSearchByPramsToPayloadDTO(List<EnvDocImpInFichier> envDocImpInFichier);
}
