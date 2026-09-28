package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.domain.commande.model.CodLibCommandeDTO;
import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import fr.acoss.posdoc.domain.commande.primary.CommandeService;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.CommandeMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCommandeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateCommandesInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayCommandeCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CommandeDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CommandeForComparePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateCommandePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class CommandeResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(CommandeResolver.class);
    private static final CommandeMapper MAPPER = CommandeMapper.INSTANCE;

    private final CommandePersistence commandePersistence;
    private final CommandeService commandeService;
    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    public CommandeResolver(final CommandePersistence commandePersistence, final CommandeService commandeService) {
        this.commandePersistence = commandePersistence;
        this.commandeService = commandeService;
    }

    public List<CommandeForComparePayloadDTO> compareCommandes(List<String> codesEnv, List<String> codesOrg, List<String> codesApp) {
        return MAPPER.commandesForCompareToPayloadDTO(commandePersistence.compareCommandes(codesEnv, codesOrg, codesApp));
    }

    List<String> getDistinctApplications() {
        return commandePersistence.findDistinctApplications();
    }

    List<String> getDistinctEnvsByApp(String app) {
        return commandePersistence.findDistinctEnvsByApp(app);
    }

    List<String> getDistinctCommByAppEnv(String app, List<String> envs) {
        return commandePersistence.findDistinctCommByAppEnv(app, envs);
    }

    List<String> getDistinctOrg(List<String> codeEnv, String codeApp, String codeCom, String codeFic) {
        return commandeService.getDistincOrg(codeEnv, codeApp, codeCom, codeFic);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Commandes", action = Action.UPDATE)
    public CreateOrUpdateCommandePayloadDTO updateCommande(
            final CreateOrUpdateCommandeInputDTO commandeInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateCommande: {}", commandeInputDTO);
        }
        return MAPPER.domainToPayloadDTO(commandeService
                .updateCommande(MAPPER.inputDTOToDomain(commandeInputDTO)));
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Commandes", action = Action.CREATE)
    public List<CreateOrUpdateCommandePayloadDTO> createCommandes(final CreateOrUpdateCommandesInputDTO createsDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createCommandes: {}", createsDTO);
        }

        var commandes = createsDTO.getCommandes().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return commandeService.createCommandes(commandes).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Commandes", action = Action.DELETE)
    public DeletePayloadDTO deleteCommandes(final DeleteByArrayCommandeCompositeIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteCommandes: {}", deleteDTO);
        }

        List<CommandeComposite> deletes = new ArrayList<>();

        deleteDTO.getIds().forEach(e -> deletes.add(new CommandeComposite(e.getCodenv(), e.getCodorg(), e.getCodapp(), e.getCode())));

        commandeService.deleteCommandes(deletes);

        return new DeletePayloadDTO(true);
    }

    public List<String> getDistinctEnvsFromCommande() {
        return commandePersistence.findDistinctEnvironnements();
    }

    List<String> getDistOrgByEnvFromCommande(List<String> envs) {
        return commandePersistence.findDistOrgByEnv(envs);
    }

    List<String> getDistAppByEnvOrgFromCommande(List<String> envs, List<String> orgs) {
        return commandePersistence.findDistAppByEnvOrg(envs, orgs);
    }

    List<String> getDistOrgByEnvsAndAppsFromCommande(List<String> envs, List<String> apps) {
        return commandePersistence.findDistOrgByEnvsAndAppsFromCommande(envs, apps);
    }

    List<String> getDistAppByEnvsFromCommande(List<String> envs) {
        return commandePersistence.findDistAppByEnvsFromCommande(envs);
    }

    CommandeDTO getPreselectedCommande(List<String> envs, List<String> orgs, String app) {
        List<Commande> result = commandePersistence.getPreselectedCommande(envs, orgs, app);
        if (result.size() > maxSize) {
            return  new CommandeDTO(
                    new ArrayList<>(),
                    StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize
            );
        }
        return new CommandeDTO(
                result.stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList()),
                StringUtils.EMPTY
        );
    }

    List<CreateOrUpdateCommandePayloadDTO> getCommandesByEnvsOrgsApps(List<String> envs, List<String> orgs, String app) {
        return commandePersistence.getCommandesByEnvsOrgsApps(envs, orgs, app).stream()
                .map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    List<CodLibCommandeDTO> getCodLibCommandeByEnvOrgApp(CommandeFiltersPayload filters) {
        return commandePersistence.getCodLibCommandeByEnvOrgApp(filters);
    }
}
