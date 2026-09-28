package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvsOrgsAppProfilsQuery;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;
import fr.acoss.posdoc.domain.ressource.primary.RessourceService;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.RessourceMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateRessourceInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayRessourceCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRessourcePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class RessourceResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(RessourceResolver.class);
    private static final RessourceMapper MAPPER = RessourceMapper.INSTANCE;

    private final RessourcePersistence ressourcePersistence;

    private final RessourceService ressourceService;

    private final ParametrePersistence parametrePersistence;

    public RessourceResolver(final RessourceService ressourceService, final RessourcePersistence ressourcePersistence,
                             final ParametrePersistence parametrePersistence) {
        this.ressourcePersistence = ressourcePersistence;
        this.ressourceService = ressourceService;
        this.parametrePersistence = parametrePersistence;
    }

    public List<CreateOrUpdateRessourcePayloadDTO> allRessources() {
        return ressourcePersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateRessourcePayloadDTO> getRessourcesByOrgGam(List<String> codesOrg, List<String> codesGam) {
        return ressourcePersistence.findByListOrgGam(codesOrg, codesGam).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateRessourcePayloadDTO> getRessourcesGam(final SearchByEnvsOrgsAppProfilsQuery query) {
        return ressourcePersistence.findByAppEnv(query).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<RessourceGamSitRes> getRessourcesGamSitRes(final SearchRessourceByEnvOrgAppProfilQuery query) {
        String genericOrganisme = parametrePersistence.getValueByCode(ParamsUtils.OGUORG);

        return ressourcePersistence.findGamSitResByEnvOrgAppProfil(query, genericOrganisme);
    }

    @Historisable(form = "Administration > Fabrication > Ressources", action = Action.CREATE)
    public CreateOrUpdateRessourcePayloadDTO createRessource(final CreateOrUpdateRessourceInputDTO createDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createRessource: {}", createDTO);
        }

        return MAPPER.domainToPayloadDTO(ressourceService
                .createRessource(MAPPER.inputDTOToDomain(createDTO)));
    }

    @Historisable(form = "Administration > Fabrication > Ressources", action = Action.UPDATE)
    public CreateOrUpdateRessourcePayloadDTO updateRessource(final CreateOrUpdateRessourceInputDTO updateDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateRessource: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(ressourceService
                .updateRessource(MAPPER.inputDTOToDomain(updateDTO)));

    }

    @Historisable(form = "Administration > Fabrication > Ressources", action = Action.DELETE)
    public DeletePayloadDTO deleteRessources(final DeleteByArrayRessourceCompositeIdInputDTO deletesDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteClients: {}", deletesDTO);
        }

        List<RessourceCompositeIdModel> deletes = new ArrayList<>();

        deletesDTO.getIds().forEach(e -> deletes.add(new RessourceCompositeIdModel(e.getCodeEnvironnement(), e.getCodeOrganisme(), e.getCodeApplication(), e.getCodeGamme(), e.getCodeSite(), e.getCodeRessource())));

        ressourceService.deleteRessources(deletes);
        return new DeletePayloadDTO(true);
    }

}
