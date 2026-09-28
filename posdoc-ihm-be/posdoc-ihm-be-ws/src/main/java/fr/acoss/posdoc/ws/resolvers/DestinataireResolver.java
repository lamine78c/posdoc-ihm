package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.destinataire.model.CodeDestinataireCodeOrg;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireToAddNewExemplaire;
import fr.acoss.posdoc.domain.destinataire.primary.DestinataireService;
import fr.acoss.posdoc.domain.destinataire.secondary.DestinatairePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.DestinataireMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateDestinatairesEnMasseInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateDestinataireInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayDestinataireCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateDestinatairePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DestinataireResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(DestinataireResolver.class);

    private static final DestinataireMapper MAPPER = DestinataireMapper.INSTANCE;

    private final DestinatairePersistence destinatairePersistence;

    private final DestinataireService destinataireService;

    public DestinataireResolver(DestinatairePersistence destinatairePersistence, DestinataireService destinataireService) {
        this.destinatairePersistence = destinatairePersistence;
        this.destinataireService = destinataireService;
    }

    public List<CreateOrUpdateDestinatairePayloadDTO> allDestinataires() {
        return destinatairePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Destinataires", action = Action.UPDATE)
    public CreateOrUpdateDestinatairePayloadDTO updateDestinataire(final CreateOrUpdateDestinataireInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateDestinataire: {}", updateDTO);
        }
        return MAPPER.domainToPayloadDTO(destinataireService.updateDestinataire(MAPPER.inputDTOToDomain(updateDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Destinataires", action = Action.CREATE)
    public List<CreateOrUpdateDestinatairePayloadDTO> createDestinataires(final CreateDestinatairesEnMasseInputDTO createsDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createDestinataires: {}", createsDTO);
        }
        var destinataires = createsDTO.getDestinataires().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return destinataireService.createDestinataires(destinataires).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<DestinataireToAddNewExemplaire> getDestinatairesToAddNewExemplaire(final String codeOrg) {
        return destinatairePersistence.getDestinatairesToAddNewExemplaire(codeOrg);
    }

    public List<String> getDestinatairesByOrgs(final List<String> orgs) {
        return destinatairePersistence.getDestinatairesByOrgs(orgs);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Destinataires", action = Action.DELETE)
    public DeletePayloadDTO deleteDestinataires(final DeleteByArrayDestinataireCompositeIdInputDTO deleteDTO) {

        List<DestinataireCompositeIdModel> listDestinataireCompositeIdModel = new ArrayList<>();

        deleteDTO.getIds().forEach(e -> listDestinataireCompositeIdModel.add(MAPPER.inputDTOToDomain(e)));

        destinataireService.deleteDestinataires(listDestinataireCompositeIdModel);

        return new DeletePayloadDTO(true);
    }

    public List<CodeDestinataireCodeOrg> findAllCodeDestinsAndCodeOrg() {
        return destinatairePersistence.findAllCodeDestinsAndCodeOrg();
    }
}
