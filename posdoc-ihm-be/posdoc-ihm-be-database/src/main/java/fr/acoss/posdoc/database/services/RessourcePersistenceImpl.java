package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.OrganismeRepository;
import fr.acoss.posdoc.database.dao.RessourceRepository;
import fr.acoss.posdoc.database.entities.RessourceCompositeId;
import fr.acoss.posdoc.database.entities.RessourceEntity;
import fr.acoss.posdoc.database.mappers.RessourceMapper;
import fr.acoss.posdoc.domain.exemplaire.model.RessourceExistForOrganismeSiteQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvsOrgsAppProfilsQuery;
import fr.acoss.posdoc.domain.ressource.model.FindOrganismesByRessourceQuery;
import fr.acoss.posdoc.domain.ressource.model.Ressource;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RessourcePersistenceImpl extends AbstractObjectPersistence<RessourceEntity, RessourceCompositeId, Ressource>
        implements RessourcePersistence {

    private static final RessourceMapper MAPPER = RessourceMapper.INSTANCE;

    private final RessourceRepository ressourceRepository;
    private final OrganismeRepository organismeRepository;

    public RessourcePersistenceImpl(
            final RessourceRepository ressourceRepository, final OrganismeRepository organismeRepository) {
        this.ressourceRepository = ressourceRepository;
        this.organismeRepository = organismeRepository;
    }

    @Override
    protected JpaSpecificationExecutor<RessourceEntity> getSpecificationExecutor() {
        return ressourceRepository;
    }

    @Override
    protected JpaRepository<RessourceEntity, RessourceCompositeId> getRepository() {
        return ressourceRepository;
    }

    @Override
    protected Function<RessourceEntity, Ressource> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Ressource, RessourceEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Ressource> selectAll() {
        return ressourceRepository.findAllByOrderByIdAsc();
    }

    @Override
    public List<Ressource> findByListOrgGam(final List<String> codesOrg, final List<String> codesGam) {
        return ressourceRepository.findByListOrgGam(!codesOrg.isEmpty() ? codesOrg : null, !codesGam.isEmpty() ? codesGam : null).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Ressource> findByAppEnv(SearchByEnvsOrgsAppProfilsQuery query) {
        if (query.getCodesEnv().isEmpty()) {
            query.setCodesEnv(null);
        }
        List<String> codesSite = null;
        if (query.getCodesOrg().isEmpty()) {
            query.setCodesOrg(null);
        } else {
            codesSite = organismeRepository.findCodesSite(query.getCodesOrg());
        }
        return ressourceRepository.findByAppandEnv(query, codesSite);
    }

    @Override
    public boolean isGenericRessourceHasSpecifiqueOne(String codeOrganisme, Ressource ressource) {
        return ressourceRepository.isGenericRessourceHasSpecifiqueOne(
                codeOrganisme,
                domainToEntityFunction().apply(ressource).getId().getCodeRessource(),
                domainToEntityFunction().apply(ressource).getId().getCodeGamme(),
                domainToEntityFunction().apply(ressource).getId().getCodeApplication(),
                domainToEntityFunction().apply(ressource).getId().getCodeEnvironnement()
        );
    }

    @Override
    public boolean isSpecifiqueRessourceHasGenericOne(String codeOrganisme, Ressource ressource) {
        return ressourceRepository.isSpecifiqueRessourceHasGenericOne(
                codeOrganisme,
                domainToEntityFunction().apply(ressource).getId().getCodeRessource(),
                domainToEntityFunction().apply(ressource).getId().getCodeGamme(),
                domainToEntityFunction().apply(ressource).getId().getCodeApplication(),
                domainToEntityFunction().apply(ressource).getId().getCodeEnvironnement()
        );
    }

    @Override
    public boolean exists(Ressource ressource) {
        return ressourceRepository.existsById(domainToEntityFunction().apply(ressource).getId());
    }

    @Override
    public List<String> gammesExistsInRessources(List<String> gammeCodes) {
        return ressourceRepository.gammesExistsInRessources(gammeCodes);
    }

    @Override
    public List<String> serversExistsInRessources(List<String> serverIds) {
        return ressourceRepository.serversExistsInRessources(serverIds);
    }

    @Override
    public List<String> parametreDistributionsExistsInRessource(List<String> parametreDistributionCodes) {
        return ressourceRepository.parametreDistributionsExistsInRessource(parametreDistributionCodes);
    }

    @Override
    public void deleteAll(List<RessourceCompositeIdModel> ids) {
        List<RessourceCompositeId> deletes = new ArrayList<>();
        ids.forEach(e -> deletes.add(new RessourceCompositeId(e.getCodeEnvironnement(), e.getCodeOrganisme(), e.getCodeApplication(), e.getCodeGamme(), e.getCodeSite(), e.getCodeRessource())));
        ressourceRepository.deleteByIdIn(deletes);
    }

    @Override
    public List<String> findOrganismesByRessource(FindOrganismesByRessourceQuery query) {
        return ressourceRepository.findOrganismesByRessource(query);
    }

    @Override
    public List<RessourceGamSitRes> findGamSitResByEnvOrgAppProfil(SearchRessourceByEnvOrgAppProfilQuery query, String genericOrganisme) {
        return ressourceRepository.findGamSitResByEnvOrgAppProfil(query, genericOrganisme);
    }

    @Override
    public boolean isRessourceExistForOrganismeSite(RessourceExistForOrganismeSiteQuery query) {
        return ressourceRepository.isRessourceExistForOrganismeSite(query);
    }

    @Override
    public boolean isRessourceExist(RessourceExistForOrganismeSiteQuery query) {
        return ressourceRepository.isRessourceExist(query);
    }
}
