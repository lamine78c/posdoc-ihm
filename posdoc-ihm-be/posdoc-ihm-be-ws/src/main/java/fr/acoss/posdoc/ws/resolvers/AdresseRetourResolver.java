package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetourComposite;
import fr.acoss.posdoc.domain.adresseretour.primary.AdresseRetourService;
import fr.acoss.posdoc.domain.adresseretour.secondary.AdresseRetourPersistence;
import fr.acoss.posdoc.domain.fichier.primary.FichierService;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.AdresseRetourMapper;
import fr.acoss.posdoc.ws.mappers.FichierMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateAdresseRetourInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateAdressesRetourInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFichierInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteAdresseRetourInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayAdresseRetourCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.search.QueryParametersInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateAdresseRetourPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFichierPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.PaginatedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AdresseRetourResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdresseRetourResolver.class);

    private static final AdresseRetourMapper MAPPER = AdresseRetourMapper.INSTANCE;
    private static final FichierMapper FICHIER_MAPPER = FichierMapper.INSTANCE;

    private final AdresseRetourService adresseRetourService;
    private final FichierService fichierService;

    private final AdresseRetourPersistence adresseRetourPersistence;

    public AdresseRetourResolver(final AdresseRetourPersistence adresseRetourPersistence,
                                 final AdresseRetourService adresseRetourService,
                                 final FichierService fichierService) {
        this.adresseRetourPersistence = adresseRetourPersistence;
        this.adresseRetourService = adresseRetourService;
        this.fichierService = fichierService;
    }

    public PaginatedDTO adressesRetour(final QueryParametersInputDTO queryParametersInputDTO) {
        return PA_MAPPER.paginatedToPaginatedDTO(adresseRetourPersistence
                .select(SEARCH_MAPPER.inputDTOToDomain(queryParametersInputDTO)), MAPPER::domainToDTO);
    }

    public List<CreateOrUpdateAdresseRetourPayloadDTO> allAdressesRetour() {
        return adresseRetourPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }


    @Historisable(form = "Gestion Des Fichiers d'Edition > Adresses Retour", action = Action.UPDATE)
    public CreateOrUpdateAdresseRetourPayloadDTO updateAdresseRetour(final CreateOrUpdateAdresseRetourInputDTO updateDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateAdresseRetour: {}", updateDTO);
        }

        return MAPPER.domainToPayloadDTO(adresseRetourService.updateAdresseRetour(MAPPER.inputDTOToDomain(updateDTO)));
    }


    @Historisable(form = "Gestion Des Fichiers d'Edition > Adresses Retour", action = Action.DELETE)
    public DeletePayloadDTO deleteAdressesRetour(final DeleteByArrayAdresseRetourCompositeIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteAdressesRetour: {}", deleteDTO);
        }

        List<AdresseRetourComposite> deletes = new ArrayList<>();

        deleteDTO.getIds().forEach(e -> deletes.add(new AdresseRetourComposite(e.getCode(), e.getCodeOrganisme())));

        adresseRetourService.deleteAdressesRetour(deletes);

        return new DeletePayloadDTO(true);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Adresses Retour", action = Action.CREATE)
    public List<CreateOrUpdateAdresseRetourPayloadDTO> createAdressesRetour(final CreateOrUpdateAdressesRetourInputDTO createsDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createAdressesRetour: {}", createsDTO);
        }

        var adressesRetour = createsDTO.getAdressesRetour().stream().map(MAPPER::inputDTOToDomain).collect(Collectors.toList());
        return adresseRetourService.createAdressesRetour(adressesRetour).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Adresses Retour > Détails", action = Action.UPDATE)
    public List<CreateOrUpdateFichierPayloadDTO> updateFichiersFromAdressesRetour(List<CreateOrUpdateFichierInputDTO> fichiers) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateFichiers: {}", fichiers);
        }
        return FICHIER_MAPPER.domainToPayloadDTO(fichierService.updateAll(FICHIER_MAPPER.inputsDTOToDomains(fichiers)));
    }
}
