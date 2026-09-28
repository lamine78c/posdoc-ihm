package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.papaad.model.PapaadCompositeId;
import fr.acoss.posdoc.domain.papaad.primary.PapaadService;
import fr.acoss.posdoc.domain.papaad.secondary.PapaadPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.PapaadMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdatePapaadInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayPapaadCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdatePapaadPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PapaadResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(PapaadResolver.class);

    private static final PapaadMapper MAPPER = PapaadMapper.INSTANCE;

    private final PapaadPersistence papaadPersistence;
    private final PapaadService papaadService;

    public PapaadResolver(final PapaadPersistence papaadPersistence, final PapaadService papaadService) {
        this.papaadPersistence = papaadPersistence;
        this.papaadService = papaadService;
    }

    public List<CreateOrUpdatePapaadPayloadDTO> allPapaads() {
        return papaadPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > PAPAADS", action = Action.CREATE)
    public CreateOrUpdatePapaadPayloadDTO createPapaad(final CreateOrUpdatePapaadInputDTO createDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createPapaad: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(papaadService
                .createPapaad(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > PAPAADS", action = Action.UPDATE)
    public CreateOrUpdatePapaadPayloadDTO updatePapaad(final CreateOrUpdatePapaadInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updatePapaad: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(papaadService
                .updatePapaad(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > PAPAADS", action = Action.DELETE)
    public DeletePayloadDTO deletePapaads(final DeleteByArrayPapaadCompositeIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deletePapaad: {}", deleteDTO);
        }

        List<PapaadCompositeId> deletes = new ArrayList<>();

        deleteDTO.getIds().forEach(e -> deletes.add(new PapaadCompositeId(e.getCodeCommande(), e.getCodeFichier(), e.getCodeNotif())));

        papaadService.deletePapaads(deletes);

        return new DeletePayloadDTO(true);
    }

}
