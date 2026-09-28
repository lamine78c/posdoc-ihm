package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.ExemplaireRepository;
import fr.acoss.posdoc.database.entities.ExemplaireCompositeId;
import fr.acoss.posdoc.database.entities.ExemplaireEntity;
import fr.acoss.posdoc.database.mappers.ExemplaireMapper;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.exemplaire.model.Exemplaire;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireComposite;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireExistsQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichier;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichierCodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireGammeSiteRessourceDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireRessource;
import fr.acoss.posdoc.domain.exemplaire.model.FindExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesByExemplaireQuery;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.domain.exemplaire.secondary.ExemplairePersistence;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.domain.ressource.model.RessourceCompositeIdModel;
import fr.acoss.posdoc.types.Constantes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.Tuple;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExemplairePersistenceImpl
        extends AbstractObjectPersistence<ExemplaireEntity, ExemplaireCompositeId, Exemplaire>
        implements ExemplairePersistence {

    private static final String SELECT_EXEMPLAIRE =
            "SELECT CAST(f.c07_codenv as varchar) as codenv, " +
                    "f.c07_codorg as codorg, " +
                    "f.c07_codapp as codapp, " +
                    "f.c07_codcom as codcom, " +
                    "f.c07_codfic as codfic, " +
                    "f.s07_ficatt as message, " +
                    "o.s00_codsit as orgsite, " +
                    "STRING_AGG(CONCAT(" +
                    "   CASE WHEN (e.s11_codres IS NULL) THEN 'false' ELSE 'true' END, '|', " +
                    "   r.c08_codgam, '|', r.c08_codres, '|', r.c08_codsit, '|', r.c08_codorg, '|', " +
                    "   CASE WHEN (E.B11_EXEACT = 0) THEN 'false' ELSE 'true' END, '|', " +
                    "   e.s11_coddes, '|', " +
                    "   CASE WHEN (r.s08_profil IS NOT NULL) THEN 'true' ELSE 'false' END" +
                    "), ',') as ressources ";
    private static final String FROM_FICHIER = "FROM (" +
            "SELECT * FROM fichie " +
            "WHERE c07_codenv = :codenv AND c07_codorg IN (:codorgs) AND c07_codapp = :codapp " +
            "   AND c07_codcom = :codcom AND c07_codfic IN (:codfics) " +
            "   AND (:message IS NULL OR s07_ficatt LIKE CAST(:message as varchar)) " +
            ") AS f ";
    private static final String LEFT_JOIN_ORGANISME =
            "LEFT JOIN organi o ON o.c00_codorg = f.c07_codorg ";
    private static final String LEFT_JOIN_RESSOURCE =
            " LEFT JOIN (SELECT * FROM ressou WHERE ( ";
    private static final String JOIN_ON_RESOURCE = ")) AS r ON r.c08_codenv = f.c07_codenv " +
            "AND r.c08_codorg IN (:codorgs, :genericOrganisme) " +
            "AND r.c08_codapp = f.c07_codapp ";
    private static final String LEFT_JOIN_EXEMPLAIRE = "LEFT JOIN exempl e ON " +
            "r.c08_codenv = e.c11_codenv AND " +
            "f.c07_codorg = e.c11_codorg AND " +
            "r.c08_codapp = e.c11_codapp AND " +
            "f.c07_codcom = e.c11_codcom AND " +
            "f.c07_codfic = e.c11_codfic AND " +
            "r.c08_codgam = e.c11_codgam AND " +
            "r.c08_codres = e.s11_codres AND " +
            "r.c08_codsit = e.s11_codsit ";
    private static final String GROUP_BY_EXEMPLAIRE = "GROUP BY codenv, codorg, codapp, codcom, codfic, message, orgsite ";
    private static final String ORDER_BY_EXEMPLAIRE = "ORDER BY codorg, codcom, codfic ";
    private static final String PERCENT = "%";
    private static final String ORGSITE = "orgsite";

    private static final ExemplaireMapper MAPPER = ExemplaireMapper.INSTANCE;

    private final ExemplaireRepository exemplaireRepository;

    public ExemplairePersistenceImpl(ExemplaireRepository exemplaireRepository) {
        this.exemplaireRepository = exemplaireRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<String> findDistinctEnvironnements() {
        return exemplaireRepository.getDistinctEnvironnement();
    }

    @Override
    public List<String> findDistOrgByEnv(List<String> envs) {
        return exemplaireRepository.findDistOrgByEnv(envs);
    }

    @Override
    public List<String> findDistAppByEnvOrg(List<String> envs, List<String> orgs) {
        return exemplaireRepository.findDistAppByEnvOrg(envs, orgs);
    }

    @Override
    public List<String> findDistComByEnvOrgApp(List<String> envs, List<String> orgs, String app) {
        return exemplaireRepository.findDistComByEnvOrgApp(envs, orgs, app);
    }

    @Override
    public List<ExemplaireFichierCodficRefimpCodprdDTO> findDistFicByEnvOrgAppCom(ExemplaireByFilterQuery query) {
        List<Map<String, String>> results = exemplaireRepository.findDistFicByEnvOrgAppCom(query);

        if (results.isEmpty()) {
            return new ArrayList<>();
        }

        return results.stream().map(this::mapToExemplaireFichierCodficRefimpCodprdDTO).collect(Collectors.toList());
    }

    @Override
    public List<ExemplaireGammeSiteRessourceDTO> findDistRessourceByEnvOrgAppComFic(ExemplaireByFilterQuery query) {
        List<Map<String, String>> results = exemplaireRepository.findDistRessourceByEnvOrgAppComFic(query);

        if (results.isEmpty()) {
            return new ArrayList<>();
        }

        return results.stream().map(this::mapToExemplaireGammeSiteRessourceDTO).collect(Collectors.toList());
    }

    @Override
    public List<ExemplaireFichier> findPreselectedExemplaire(ExemplaireByFilterQuery query, String genericOrganisme) {
        return exemplaireRepository.findPreselectedExemplaire(query, genericOrganisme).stream().map(ExemplaireMapper.INSTANCE::mapToExemplaireFichier).collect(Collectors.toList());
    }

    @Override
    public void delete(String codenv, String codorg, String codapp, String codcom, String codfic, String codgam, String numexe) {
        delete(new ExemplaireCompositeId(codenv, codorg, codapp, codcom, codfic, codgam, numexe));
    }

    @Override
    public boolean exists(String codenv, String codorg, String codapp, String codcom, String codfic, String codgam, String numexe) {
        return exists(new ExemplaireCompositeId(codenv, codorg, codapp, codcom, codfic, codgam, numexe));
    }

    @Override
    protected JpaSpecificationExecutor<ExemplaireEntity> getSpecificationExecutor() {
        return exemplaireRepository;
    }

    @Override
    protected JpaRepository<ExemplaireEntity, ExemplaireCompositeId> getRepository() {
        return exemplaireRepository;
    }

    @Override
    protected Function<ExemplaireEntity, Exemplaire> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Exemplaire, ExemplaireEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Exemplaire> selectAll() {
        return exemplaireRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Exemplaire> findExemplaires(FindExemplaireQuery query) {

        List<ExemplaireEntity> exemplaireEntityList = exemplaireRepository.findExemplaires(query);
        return exemplaireEntityList.stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<Exemplaire> updateAll(List<Exemplaire> exemplaires) {
        var entity = exemplaires.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        return exemplaireRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public void deleteAll(Iterable<ExemplaireComposite> ids) {
        List<ExemplaireCompositeId> deletes = new ArrayList<>();
        ids.forEach(e -> deletes.add(new ExemplaireCompositeId(e.getCodenv(), e.getCodorg(), e.getCodapp(), e.getCodcom(), e.getCodfic(), e.getCodgam(), e.getNumexe())));
        exemplaireRepository.deleteByIdIn(deletes);
    }

    @Override
    public boolean destinataireExistInExemplaires(DestinataireCompositeIdModel destinataireId) {
        return exemplaireRepository.destinataireExistInExemplaires(destinataireId.getCode(), destinataireId.getCodeOrg());
    }

    @Override
    public boolean ressourceExistsInExemplaires(RessourceCompositeIdModel ressourceId) {
        return exemplaireRepository.ressourceExistsInExemplaires(ressourceId.getCodeRessource(), ressourceId.getCodeGamme(), ressourceId.getCodeApplication(),
                ressourceId.getCodeSite(), ressourceId.getCodeOrganisme(), ressourceId.getCodeEnvironnement());
    }

    @Override
    public Boolean isProductAttachedToExemplaire(Produi product) {
        return exemplaireRepository.isProductAttachedToExemplaire(product.getCodenv(), product.getCodorg(),
                product.getCodapp(), product.getCodcom(), product.getCodfic(), product.getCodgam());
    }

    @Override
    public boolean ressourceExists(ExemplaireExistsQuery query) {
        return exemplaireRepository.ressourceExists(query);
    }

    @Override
    public List<Exemplaire> findExemplairesByCriteres(String codenv, String codorg, String codapp, String codcom, String codfic, String codgam) {
        return exemplaireRepository.findExemplairesByCriteres(codenv, codorg, codapp, codcom, codfic, codgam);
    }

    @Override
    public List<String> findOrganismeCompleteByExemplaire(FindOrganismesByExemplaireQuery query) {
        return exemplaireRepository.findOrganismeCompleteByExemplaire(query);
    }

    @Override
    public boolean exemplaireExists(ExemplaireExistsQuery query) {
        return exemplaireRepository.exemplaireExists(query);
    }

    @Override
    public boolean isAllExemplaireInProduitDesactives(final Produi product) {
        return exemplaireRepository.isAllExemplaireDesactivesInProduit(product);
    }

    private ExemplaireFichierCodficRefimpCodprdDTO mapToExemplaireFichierCodficRefimpCodprdDTO(Map<String, String> map) {
        return ExemplaireFichierCodficRefimpCodprdDTO.builder()
                .codfic(map.get(ParamsUtils.CODFIC))
                .refImprime(map.get(ParamsUtils.REFIMPRIME))
                .codeProd(map.get(ParamsUtils.CODEPROD))
                .build();
    }

    private ExemplaireGammeSiteRessourceDTO mapToExemplaireGammeSiteRessourceDTO(Map<String, String> map) {
        return ExemplaireGammeSiteRessourceDTO.builder()
                .codgam(map.get(ParamsUtils.CODGAM))
                .codsit(map.get(ParamsUtils.CODSIT))
                .codres(map.get(ParamsUtils.CODRES))
                .build();
    }

    @Override
    public List<ExemplaireByResource> getParametresEditionByRessource(ExemplaireByRessourceQuery query, String genericOrganisme) {
        String request = buildSecureSqlQuery(query);
        Query sqlQuery = entityManager.createNativeQuery(request, Tuple.class);

        this.setQueryParameters(sqlQuery, query, genericOrganisme);

        List<Tuple> result = sqlQuery.getResultList();
        return result.stream()
                .map(this::mapToExemplaireByResource)
                .collect(Collectors.toList());
    }

    @Override
    public String getNumexeFromExemplaire(ExemplaireComposite id, String codres, String codsit) {
        return exemplaireRepository.getNumexeFromExemplaire(id, codres, codsit);
    }

    private String buildSecureSqlQuery(ExemplaireByRessourceQuery query) {
        return SELECT_EXEMPLAIRE +
                FROM_FICHIER +
                LEFT_JOIN_ORGANISME +
                LEFT_JOIN_RESSOURCE +
                getWhereClause(query.getRessources()) +
                JOIN_ON_RESOURCE +
                LEFT_JOIN_EXEMPLAIRE +
                GROUP_BY_EXEMPLAIRE +
                ORDER_BY_EXEMPLAIRE;

    }

    private String getWhereClause(List<String> resources) {
        StringBuilder whereClause = new StringBuilder();
        for (int i = 0; i < resources.size(); i++) {
            String codgamParam = ":codgam" + i;
            String codsitParam = ":codsit" + i;
            String codresParam = ":codres" + i;
            if (i > 0) {
                whereClause.append("OR ");
            }
            whereClause.append("( c08_codgam = ").append(codgamParam).append(" AND c08_codsit = ").append(codsitParam).append(" AND c08_codres = ").append(codresParam).append(") ");
        }
        return whereClause.toString();
    }

    private void setQueryParameters(Query sqlQuery, ExemplaireByRessourceQuery query, String genericOrganisme) {
        sqlQuery.setParameter("codenv", query.getCodenv());
        sqlQuery.setParameter("codorgs", query.getCodorgs());
        sqlQuery.setParameter("codapp", query.getCodapp());
        sqlQuery.setParameter("codcom", query.getCodcom());
        sqlQuery.setParameter("codfics", query.getCodfics());
        sqlQuery.setParameter("message", query.getMessage() != null ? PERCENT + query.getMessage() + PERCENT : null);
        sqlQuery.setParameter("genericOrganisme", genericOrganisme);

        for (int i = 0; i < query.getRessources().size(); i++) {
            String[] resource = query.getRessources().get(i).split(StringUtils.SLASH);
            String codgam = resource[0];
            String codsit = resource[1];
            String codres = resource[2];
            sqlQuery.setParameter("codgam" + i, codgam);
            sqlQuery.setParameter("codsit" + i, codsit);
            sqlQuery.setParameter("codres" + i, codres);
        }
    }

    private ExemplaireByResource mapToExemplaireByResource(Tuple tuple) {
        ExemplaireByResource exemplaire = new ExemplaireByResource();
        exemplaire.setCodenv((String) tuple.get(ParamsUtils.CODENV));
        exemplaire.setCodorg((String) tuple.get(ParamsUtils.CODORG));
        exemplaire.setCodapp((String) tuple.get(ParamsUtils.CODAPP));
        exemplaire.setCodcom((String) tuple.get(ParamsUtils.CODCOM));
        exemplaire.setCodfic((String) tuple.get(ParamsUtils.CODFIC));
        exemplaire.setMessage((String) tuple.get(ParamsUtils.MESSAGE));
        exemplaire.setRessources(getExemplaireResource(tuple));

        return exemplaire;
    }

    private List<ExemplaireRessource> getExemplaireResource(Tuple tuple) {
        String codorgExemplaire = (String) tuple.get(ParamsUtils.CODORG);
        String siteOrganisme = (String) tuple.get(ORGSITE);
        String[] resources = ((String) tuple.get(ParamsUtils.RESSOURCES)).split(",");
        return Arrays.stream(resources)
                .map(r -> {
                    String[] data = r.split("\\|");
                    ExemplaireRessource er = new ExemplaireRessource();
                    boolean exemplaireExists = Boolean.parseBoolean(data[0]);
                    er.setExemplaireExists(exemplaireExists);
                    er.setCodgam(data[1]);
                    er.setCodres(data[2]);
                    er.setCodsit(data[3]);
                    er.setCodorg(data[4]);
                    er.setEtat(Boolean.valueOf(data[5]));
                    if (exemplaireExists && data.length > 6 && data[6] != null && !data[6].isEmpty()) {
                        er.setCoddes(data[6]);
                    } else {
                        er.setCoddes(null);
                    }
                    if (data.length > 7 && data[7] != null && !data[7].isEmpty()) {
                        er.setHasProfil(Boolean.valueOf(data[7]));
                    } else {
                        er.setHasProfil(null);
                    }
                    return er;
                })
                .filter(er -> Constantes.GENERIC_ORGANISME.equals(er.getCodorg()) || codorgExemplaire.equals(er.getCodorg()))
                .filter(er -> isRessourceDisponiblePourSiteOrganisme(er, siteOrganisme))
                .collect(Collectors.toList());
    }

    // Une ressource générique n'est proposable à l'ajout que pour les organismes rattachés à son site ;
    // les exemplaires déjà créés restent visibles pour pouvoir être supprimés.
    private boolean isRessourceDisponiblePourSiteOrganisme(ExemplaireRessource ressource, String siteOrganisme) {
        if (Boolean.TRUE.equals(ressource.getExemplaireExists()) || !Constantes.GENERIC_ORGANISME.equals(ressource.getCodorg())) {
            return true;
        }
        return siteOrganisme == null || siteOrganisme.isEmpty() || siteOrganisme.equals(ressource.getCodsit());
    }
}
