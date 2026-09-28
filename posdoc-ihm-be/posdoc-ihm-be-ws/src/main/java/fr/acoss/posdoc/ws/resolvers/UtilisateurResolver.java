package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.utilisateur.primary.UtilisateurService;
import fr.acoss.posdoc.domain.utilisateur.secondary.UtilisateurPersistence;
import fr.acoss.posdoc.ws.mappers.UtilisateurMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.*;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateUtilisateurPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UtilisateurResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(UtilisateurResolver.class);

    private static final UtilisateurMapper MAPPER = UtilisateurMapper.INSTANCE;

    private final UtilisateurPersistence utilisateurPersistence;

    private final UtilisateurService utilisateurService;

    public UtilisateurResolver(final UtilisateurPersistence utilisateurPersistence, final UtilisateurService utilisateurService) {
        this.utilisateurPersistence = utilisateurPersistence;
        this.utilisateurService = utilisateurService;
    }

    public PaginatedDTO utilisateurs(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(utilisateurPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public CreateOrUpdateUtilisateurPayloadDTO createUtilisateur(final CreateOrUpdateUtilisateurInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createUtilisateur: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(utilisateurService.createUtilisateur(MAPPER.inputDTOToDomain(createDTO)));
    }

    public CreateOrUpdateUtilisateurPayloadDTO updateUtilisateur(final CreateOrUpdateUtilisateurInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateUtilisateur: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(utilisateurService.updateUtilisateur(MAPPER.inputDTOToDomain(updateDTO)));
    }

    public DeletePayloadDTO deleteUtilisateur(final DeleteByStringIdInputDTO deleteDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteUtilisateur: {}", deleteDTO);
        }

        utilisateurService.deleteUtilisateur(deleteDTO.getId());

        return new DeletePayloadDTO(Boolean.TRUE);
    }

    public DeletePayloadDTO deleteUtilisateurs(final DeleteByArrayStringIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteUtilisateur: {}", deletesDTO);
        }
        utilisateurService.deleteUtilisateurs(deletesDTO.getIds());
        return new DeletePayloadDTO(true);
    }

    public List<CreateOrUpdateUtilisateurPayloadDTO> updateUtilisateurs(final UpdateUtilisateursInputDTO updatesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updatesUtilisateurs: {}", updatesDTO);
        }

        var utilisateurs = updatesDTO.getUtilisateurs().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return utilisateurService.updateUtilisateurs(utilisateurs).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }
}