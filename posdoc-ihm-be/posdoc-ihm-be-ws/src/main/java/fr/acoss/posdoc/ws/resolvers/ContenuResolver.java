package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.contenu.model.ContenuForAccueil;
import fr.acoss.posdoc.domain.contenu.primary.ContenuService;
import fr.acoss.posdoc.domain.contenu.secondary.ContenuPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ContenuMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateContenuInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateContenuPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ContenuResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ContenuResolver.class);

    private static final ContenuMapper MAPPER = ContenuMapper.INSTANCE;

    private final ContenuService contenuService;

    private final ContenuPersistence contenuPersistence;

    public ContenuResolver(final ContenuService contenuService,
                           final ContenuPersistence contenuPersistence) {
        this.contenuService = contenuService;
        this.contenuPersistence = contenuPersistence;
    }


    public List<CreateOrUpdateContenuPayloadDTO> allContenus() {
        return contenuPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<ContenuForAccueil> getContenusForAccueil(List<String> userOrganismes) {
        return contenuPersistence.getContenusForAccueil(userOrganismes);
    }

    //vu avec helena la create et l'update peuvent avoir la même Action : UPDATE
    @Historisable(form = "Administration > Contenu > Pages d'accueil", action = Action.UPDATE)
    public CreateOrUpdateContenuPayloadDTO createContenu(final CreateOrUpdateContenuInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createContenu: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(contenuService
                .createContenu(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Contenu  > Pages d'accueil", action = Action.DELETE)
    public DeletePayloadDTO deleteContenu(final Integer deleteId) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteContenu: {}", deleteId);
        }

        contenuService.deleteContrenu(deleteId);

        return new DeletePayloadDTO();
    }
}
