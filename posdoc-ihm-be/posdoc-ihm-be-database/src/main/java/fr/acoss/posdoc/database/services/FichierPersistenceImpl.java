package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.ExemplaireRepository;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.dao.NotficRepository;
import fr.acoss.posdoc.database.dao.ParametreRepository;
import fr.acoss.posdoc.database.dao.ProduiRepository;
import fr.acoss.posdoc.database.dao.SiteCNPRepository;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.database.mappers.ExemplaireMapper;
import fr.acoss.posdoc.database.mappers.FichierMapper;
import fr.acoss.posdoc.database.mappers.ProduiMapper;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.fichier.model.CodComCodDocLibFicInFichier;
import fr.acoss.posdoc.domain.fichier.model.CodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.fichier.model.ComFichProdInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvAppRefImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.EnvDocImpInFichier;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.domain.fichier.model.query.EnvOrgsAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComFicQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvOrgsAppComQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.produi.model.Produi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FichierPersistenceImpl
        extends AbstractObjectPersistence<FichierEntity, FichierCompositeId, Fichier>
        implements FichierPersistence {

    private static final FichierMapper MAPPER = FichierMapper.INSTANCE;

    private static final ProduiMapper PRODUIT_MAPPER = ProduiMapper.INSTANCE;

    private static final ExemplaireMapper EXEMPLAIRE_MAPPER = ExemplaireMapper.INSTANCE;

    private final FichierRepository fichierRepository;

    private final ProduiRepository produitRepository;

    private final ExemplaireRepository exemplaireRepository;
    private final NotficRepository notficRepository;
    private final SiteCNPRepository siteCNPRepository;
    private final ParametreRepository parametreRepository;

    public FichierPersistenceImpl(FichierRepository fichierRepository,
                                  ProduiRepository produitRepository,
                                  ExemplaireRepository exemplaireRepository,
                                  SiteCNPRepository siteCNPRepository,
                                  NotficRepository notficRepository,
                                  ParametreRepository parametreRepository
    ) {
        this.fichierRepository = fichierRepository;
        this.produitRepository = produitRepository;
        this.exemplaireRepository = exemplaireRepository;
        this.notficRepository = notficRepository;
        this.siteCNPRepository = siteCNPRepository;
        this.parametreRepository = parametreRepository;
    }

    @Override
    protected JpaSpecificationExecutor<FichierEntity> getSpecificationExecutor() {
        return fichierRepository;
    }

    @Override
    protected JpaRepository<FichierEntity, FichierCompositeId> getRepository() {
        return fichierRepository;
    }

    @Override
    protected Function<FichierEntity, Fichier> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Fichier, FichierEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Fichier> selectAll() {
        return fichierRepository.findFichiers();
    }

    @Override
    public List<Fichier> setNewImprimeToFichiers(List<Fichier> fichiers) {
        List<FichierEntity> updatedFichiers = fichierRepository.findFichiersForUpdatingReference(
                fichiers.stream().map(Fichier::getCodeOrg).collect(Collectors.toList()),
                fichiers.stream().map(Fichier::getCodeFich).collect(Collectors.toList()),
                fichiers.stream().map(Fichier::getCodeProd).collect(Collectors.toList()),
                fichiers.stream().map(Fichier::getLibFichier).collect(Collectors.toList())
        ).stream().map(e -> {
            e.setRefImprime(fichiers.get(0).getRefImprime());
            return e;
        }).collect(Collectors.toList());
        return fichierRepository.saveAll(updatedFichiers).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public Fichier setNewImprimeToFichier(Fichier fichier) {
        FichierEntity updatedFichier = fichierRepository.findFichierForUpdatingReference(
                fichier.getCodeEnv(),
                fichier.getCodeOrg(),
                fichier.getCodeApp(),
                fichier.getCodeCom(),
                fichier.getCodeFich()
        );
        updatedFichier.setRefImprime(fichier.getRefImprime());
        return entityToDomainFunction().apply(fichierRepository.save(updatedFichier));
    }

    @Override
    public List<Fichier> getFichiersForUpdatingReference(List<String> codesEnv, List<String> codesApp, List<String> refsImp) {
        return fichierRepository.getFichiersForUpdatingReference(
                codesEnv,
                codesApp,
                refsImp
        ).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<String> getFichiersToAddNewExemplaire(String codeEnv, String codeOrg, String codeApp, String perCod, String codeGam) {
        return fichierRepository.getFichiersToAddNewExemplaire(codeEnv, codeOrg, codeApp, perCod, codeGam);
    }

    @Override
    public boolean existsByCodeFic(String codeFichier) {
        return fichierRepository.existsByCodeFic(codeFichier);
    }

    @Override
    public List<Fichier> findFichiersByApp(String codenv, List<String> codesOrg, List<String> codesApp, List<String> codesCom) {
        List<FichierEntity> fichierEntityList = fichierRepository.findFichiersByApp(codenv, codesOrg, codesApp, codesCom);
        return fichierEntityList.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public boolean findFichierById(Fichier fichier) {
        return fichierRepository.findFichierById(fichier.getCodeEnv(), fichier.getCodeOrg(), fichier.getCodeApp(), fichier.getCodeCom(), fichier.getCodeFich());
    }

    @Override
    public List<String> formatsExistsInFichiers(List<String> formatCodes) {
        return fichierRepository.formatsExistsInFichiers(formatCodes);
    }

    @Override
    public List<String> multifsExistsInFichiers(List<String> multifCodes) {
        return fichierRepository.multifsExistsInFichiers(multifCodes);
    }

    @Override
    public List<String> supportsExistsInFichiers(List<String> supportCodes) {
        return fichierRepository.supportsExistsInFichiers(supportCodes);
    }

    @Override
    public List<String> compositionsExistsInFichier(List<String> compositionCodes) {
        return fichierRepository.compositionsExistsInFichier(compositionCodes);
    }

    @Override
    public List<String> echantillonsExistsInFichiers(List<String> echantillonCodes) {
        return fichierRepository.echantillonsExistsInFichiers(echantillonCodes);
    }

    @Override
    public List<String> commandesExistsInFichiers(List<CommandeComposite> commandeComposite) {
        return fichierRepository.commandesExistsInFichiers(
                commandeComposite.stream().map(CommandeComposite::getCode).collect(Collectors.toList()),
                commandeComposite.stream().map(CommandeComposite::getCodenv).collect(Collectors.toList()),
                commandeComposite.stream().map(CommandeComposite::getCodorg).collect(Collectors.toList()),
                commandeComposite.stream().map(CommandeComposite::getCodapp).collect(Collectors.toList())
        );
    }

    @Override
    public List<String> clientsExistsInFichiers(List<String> clientCodes) {
        return fichierRepository.clientsExistsInFichiers(clientCodes);
    }

    @Override
    public List<String> imprimesExistsInFichiers(List<String> imprimeCodes) {
        return fichierRepository.imprimesExistsInFichiers(imprimeCodes);
    }

    @Override
    public List<Fichier> findFichiersForAdsNull(String codeEnv, String codeOrg, String codeApp, String codeCom, String codeFic, String refImprime) {
        return fichierRepository.findFichiersForAdsNull(codeEnv, codeOrg, codeApp, codeCom, codeFic, refImprime).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Fichier> getExistedFichiers(List<String> codeEnv, String codeApp, String codeCom, String codeFic) {
        return fichierRepository.getExistedFichiers(codeEnv, codeApp, codeCom, codeFic).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public void deleteAll(List<Fichier> fichiers) {
        var entity = fichiers.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        fichierRepository.deleteAll(entity);
    }

    @Override
    public List<Fichier> updateAll(List<Fichier> fichiers) {
        List<FichierEntity> entities = fichiers.stream()
                .map(fichier -> fichierRepository.findById(
                        domainToEntityFunction().apply(fichier).getId())
                        .orElseThrow())
                .collect(Collectors.toList());

        for (int i = 0; i < fichiers.size(); i++) {
            MAPPER.INSTANCE.updateEntity(fichiers.get(i), entities.get(i));
        }

        return fichierRepository.saveAll(entities).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HashMap<String, Integer> createFichierWithExemplaire(List<Fichier> fichiers, List<Produi> produits, List<Exemplaire> exemplaires) {
        var fichiersEntity = fichiers.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        var produitsEntity = produits.stream().map(PRODUIT_MAPPER::domainToEntity).collect(Collectors.toList());
        var exemplaireEntity = exemplaires.stream().map(EXEMPLAIRE_MAPPER::domainToEntity).collect(Collectors.toList());

        var fichiersCreer = this.fichierRepository.saveAll(fichiersEntity);
        var produitsCreer = this.produitRepository.saveAll(produitsEntity);
        var exemplairesCreer = this.exemplaireRepository.saveAll(exemplaireEntity);


        var createdFichiersData = new HashMap<String, Integer>();
        createdFichiersData.put("nbFichiers", fichiersCreer.size());
        createdFichiersData.put("nbProduits", produitsCreer.size());
        createdFichiersData.put("nbExemplaires", exemplairesCreer.size());

        return createdFichiersData;
    }

    public List<EnvAppRefImpInFichier> findEnvAppRefImpEnGroup() {
        return fichierRepository.findEnvAppRefImpEnGroup();
    }

    @Override
    public List<Fichier> findFichierByProp(List<String> codeEnv, String codeApp, String codeCom, String codeFic) {
        return fichierRepository.getExistedFichiers(codeEnv, codeApp, codeCom, codeFic)
                .stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());

    }

    @Override
    public List<String> findDistinctEnvironnements() {
        return fichierRepository.getDistinctEnvironnement();
    }

    @Override
    public List<String> findDistOrgByEnv(SearchFichierFilterQuery query) {
        return fichierRepository.findDistOrgByEnv(query);
    }

    @Override
    public List<String> findDistAppByEnvOrg(SearchFichierFilterQuery query) {
        return fichierRepository.findDistAppByEnvOrg(query);
    }

    @Override
    public List<String> findDistComByEnvOrgApp(SearchFichierFilterQuery query) {
        return fichierRepository.findDistComByEnvOrgApp(query);
    }

    @Override
    public List<String> findDistFicByEnvOrgAppCom(SearchFichierFilterQuery query) {
        return fichierRepository.findDistFicByEnvOrgAppCom(query);
    }

    @Override
    public List<Fichier> findPreselectedFichier(SearchFichierFilterQuery query) {
        return fichierRepository.findPreselectedFichier(query);
    }

    @Override
    public List<Fichier> checkIfExistInList(List<Fichier> fichiers) {
        var fichiersEntity = fichiers.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        var found = this.fichierRepository.findAllById(fichiersEntity.stream().map(FichierEntity::getId).collect(Collectors.toList()));
        return found.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<ComFichProdInFichier> getAllDistinctCodComCodFicCodPrd() {
        return fichierRepository.getAllDistinctCodComCodFicCodPrd();
    }

    @Override
    public List<EnvDocImpInFichier> findFichiersByAppAndOrg(String codeOrg, String codeApp) {
        return fichierRepository.findFichiersByAppAndOrg(codeOrg, codeApp);
    }

    @Override
    public List<String> getOrgByEnvAppComFics(SearchOrgByEnvAppComFicsQuery query) {
        return fichierRepository.getOrgByEnvAppComFics(query);
    }

    @Override
    public void updateFicAttByEnvOrgsAppComFic(SearchByEnvOrgsAppComFicQuery query, String message) {
        EnvOrgsAppComFicsQuery newQuery = new EnvOrgsAppComFicsQuery();
        newQuery.setCodenv(query.getCodenv());
        newQuery.setCodorgs(query.getCodorgs());
        newQuery.setCodapp(query.getCodapp());
        newQuery.setCodcom(query.getCodcom());
        newQuery.setCodfics(List.of(query.getCodfic()));
        this.updateFicAttByEnvOrgsAppComFics(newQuery, message);
    }

    @Override
    public void updateFicAttByEnvOrgsAppComFics(EnvOrgsAppComFicsQuery query, String message) {
        fichierRepository.updateFicAttByEnvOrgsAppComFics(query, message);
    }

    @Override
    public void updateFicAttByIds(List<FichierComposite> ids, String message) {
        ids.forEach(id -> {
            Optional<FichierEntity> resultat = fichierRepository.findById(MAPPER.domainToEntity(id));
            if (resultat.isPresent()) {
                FichierEntity fichierEntity = resultat.get();
                fichierEntity.setFicAtt(message);
                fichierRepository.save(fichierEntity);
            }
        });
    }

    @Override
    public List<NotficFichier> findFichiersForAffectationNotice(SearchNotficQuery query) {
        List<Map<String, String>> fichierList = fichierRepository.findFichiersForAffectationNotice(query);
        List<Map<String, String>> notficList = notficRepository.findNotficWithFichie(query);
        // renvoyer que les fichiers non affectés
        return fichierList.stream().filter(fic -> isNotAffecte(fic, notficList)).map(this::mapToNotFic).collect(Collectors.toList());
    }

    private Boolean isNotAffecte(Map<String, String> fic, List<Map<String, String>> notficList) {
        return notficList.stream().noneMatch(notfic -> notfic.get(ParamsUtils.CODENV).equals(fic.get(ParamsUtils.CODENV)) &&
                notfic.get(ParamsUtils.CODAPP).equals(fic.get(ParamsUtils.CODAPP)) &&
                notfic.get(ParamsUtils.CODORG).equals(fic.get(ParamsUtils.CODORG)) &&
                notfic.get(ParamsUtils.CODFIC).equals(fic.get(ParamsUtils.CODFIC)) &&
                notfic.get(ParamsUtils.CODCOM).equals(fic.get(ParamsUtils.CODCOM)));
    }

    private NotficFichier mapToNotFic(Map<String, String> map) {
        return NotficFichier.builder()
                .codenv(map.get(ParamsUtils.CODENV))
                .codorg(map.get(ParamsUtils.CODORG))
                .codapp(map.get(ParamsUtils.CODAPP))
                .codcom(map.get(ParamsUtils.CODCOM))
                .codfic(map.get(ParamsUtils.CODFIC))
                .codeProd(map.get(ParamsUtils.CODPRD))
                .refImprime(map.get(ParamsUtils.REFIMP))
                .build();
    }

    @Override
    public List<String> findDistOrgNoMasByEnv(SearchFichierFilterQuery query) {
        return fichierRepository.findDistOrgNoMasByEnv(query, siteCNPRepository.findAllMasOrgs());
    }

    @Override
    public List<CodComCodDocLibFicInFichier> findComDocLibFicInFichier() {
        String docApp = parametreRepository.getValueDocDematerialises();
        String docOrg = parametreRepository.getValueDocOrg();

        return fichierRepository.findComDocLibFicInFichier(docApp, docOrg).stream().map(this::mapToCodDocLibFic).collect(Collectors.toList());
    }

    private CodComCodDocLibFicInFichier mapToCodDocLibFic(Map<String, String> map) {
        return CodComCodDocLibFicInFichier.builder()
                .codcom(map.get(ParamsUtils.CODCOM))
                .coddoc(map.get(ParamsUtils.CODDOC))
                .libfic(map.get(ParamsUtils.LIBFIC))
                .build();
    }

    @Override
    public List<CodficRefimpCodprdDTO> findFicPrdImpByEnvOrgAppCom(SearchByEnvOrgsAppComQuery query) {
        return fichierRepository.findFicPrdImpByEnvOrgAppCom(query).stream().map(this::mapToCodficRefimpCodprd).collect(Collectors.toList());
    }

    private CodficRefimpCodprdDTO mapToCodficRefimpCodprd(Map<String, String> map) {
        return CodficRefimpCodprdDTO.builder()
                .codfic(map.get(ParamsUtils.CODFIC))
                .codprd(map.get(ParamsUtils.CODPRD))
                .refimp(map.get(ParamsUtils.REFIMP))
                .build();
    }
}