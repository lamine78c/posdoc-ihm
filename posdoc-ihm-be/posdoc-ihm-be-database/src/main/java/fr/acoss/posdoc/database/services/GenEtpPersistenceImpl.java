package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.GenEtpRepository;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.entities.GenEtpEntity;
import fr.acoss.posdoc.database.mappers.GenEtpMapper;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.genetp.model.DistinctCodenvCodorgCodappGenetp;
import fr.acoss.posdoc.domain.genetp.model.EnvOrgsQuery;
import fr.acoss.posdoc.domain.genetp.model.FirstVideoStep;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.GenEtpInput;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapeSearchData;
import fr.acoss.posdoc.domain.genetp.model.ResGamSit;
import fr.acoss.posdoc.domain.genetp.model.VideoStep;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierDTO;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierPayload;
import fr.acoss.posdoc.domain.genetp.model.VideoStepPayload;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraites;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesDTO;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesSearchQuery;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpExistsQuery;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.types.GenEtpType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenEtpPersistenceImpl extends AbstractObjectPersistence<GenEtpEntity, Integer, GenEtp>
        implements GenEtpPersistence {

    private static final GenEtpMapper MAPPER = GenEtpMapper.INSTANCE;

    private final GenEtpRepository genEtpRepository;
    private final GenFicRepository genFicRepository;

    private static final String SELECT_DISTINCT = "SELECT new map(ge.codorg as codorg, ge.codapp as codapp, ge.codfic as codfic, ge.codcom as codcom, ge.codgam as codgam, ge.codsit as codsit, ge.coddes as coddes, ge.codres as codres " ;
    private static final String SELECT_SUM_HIS_PRO = ", CAST(SUM(h.pagFic) as integer) as sumpagfic) ";
    private static final String SELECT_SUM_GEN_PRO = ", CAST(SUM(gp.pagFic) as integer) as sumpagfic) ";
    private static final String FROM_GEN_ETP_ENTITY = " FROM GenEtpEntity ge";
    private static final String INNER_JOIN_GEN_PRO_ENTITY = " INNER JOIN GenProEntity gp on ge.codgam = gp.id.codeGam and ge.codfic = gp.id.codeFic and ge.numcom = gp.id.numCom and ge.codcom = gp.id.codeCom and ge.percod = gp.id.perCod and ge.codapp = gp.id.codeApp and ge.codorg = gp.id.codeOrg and ge.codenv = gp.id.codeEnv ";
    private static final String INNER_JOIN_HIS_PRO_ENTITY = " INNER JOIN HisProEntity h on ge.codgam = h.id.codeGam and ge.codfic = h.id.codeFic and ge.numcom = h.id.numCom and ge.codcom = h.id.codeCom and ge.percod = h.id.perCod and ge.codapp = h.id.codeApp and ge.codorg = h.id.codeOrg and ge.codenv = h.id.codeEnv ";
    private static final String GROUP_BY = " GROUP BY ge.codapp, ge.codcom, ge.codorg, ge.codfic, ge.codgam, ge.codsit, ge.codres, ge.coddes ";
    private static final String ORDER_BY = " ORDER BY ge.codapp, ge.codcom, ge.codorg, ge.codfic, ge.codgam, ge.codsit, ge.codres, ge.coddes ";

    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    @PersistenceContext
    protected EntityManager entityManager;

    public GenEtpPersistenceImpl(final GenEtpRepository genEtpRepository, final GenFicRepository genFicRepository) {
        this.genEtpRepository = genEtpRepository;
        this.genFicRepository = genFicRepository;
    }

    @Override
    protected JpaSpecificationExecutor<GenEtpEntity> getSpecificationExecutor() {
        return genEtpRepository;
    }

    @Override
    protected JpaRepository<GenEtpEntity, Integer> getRepository() {
        return genEtpRepository;
    }

    @Override
    protected Function<GenEtpEntity, GenEtp> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<GenEtp, GenEtpEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    public List<GenEtp> selectAll() {
        return genEtpRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    public VolumesTraitesDTO getVolumesTraitesByCriteres(final VolumesTraitesSearchQuery query) {
        List<Map<String, Integer>> volumesTraitesHisto = doFindVolumeTraiteByQuery(query, true);
        List<Map<String, Integer>> volumesTraitesNoHisto = doFindVolumeTraiteByQuery(query, false);
        if ((volumesTraitesHisto.size() + volumesTraitesNoHisto.size()) > maxSize) {
            return new VolumesTraitesDTO(
                    new ArrayList<>(),
                    StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize
            );
        }
        List<VolumesTraites> volumesTraites = new ArrayList<>();
        volumesTraites.addAll(volumesTraitesHisto.stream()
                .map(GenEtpMapper.INSTANCE::mapToVolumesTraitesSearchData)
                .collect(Collectors.toList()));
        volumesTraites.addAll(volumesTraitesNoHisto.stream()
                .map(GenEtpMapper.INSTANCE::mapToVolumesTraitesSearchData)
                .collect(Collectors.toList()));
        return new VolumesTraitesDTO(volumesTraites, StringUtils.EMPTY);
    }

    private List<Map<String, Integer>> doFindVolumeTraiteByQuery(final VolumesTraitesSearchQuery searchQuery, Boolean isHisto) {
        String request = SELECT_DISTINCT ;
        if (Boolean.TRUE.equals(isHisto)) {
            request += SELECT_SUM_HIS_PRO + FROM_GEN_ETP_ENTITY + INNER_JOIN_HIS_PRO_ENTITY;
        } else {
            request += SELECT_SUM_GEN_PRO + FROM_GEN_ETP_ENTITY + INNER_JOIN_GEN_PRO_ENTITY;
        }
        request = addWhereClause(searchQuery, request);
        request += GROUP_BY;
        request += ORDER_BY;
        // create and populate the query
        Query query = entityManager.createQuery(request);
        setDefaultQueryParameters(searchQuery, query);
        return query.getResultList();
    }

    private static String addWhereClause(final VolumesTraitesSearchQuery query, String request) {
        request += " WHERE ge.typetp = (:typetp) AND ge.reedit = 0 ";
        request += " AND ge.debute >= (:fromdate) ";
        request += " AND ge.debute <= (:todate) ";
        request += " AND ge.codenv = (:codenv) ";
        request += " AND ge.codorg IN (:codorgs) ";
        List<String> clauseResGamSit = new ArrayList<>();
        query.getResGamSitList().forEach(resGamSit -> clauseResGamSit.add(" (ge.codgam = '"+resGamSit.getCodGam()+"' AND ge.codsit = '"+resGamSit.getCodSit()+"' AND ge.codres = '"+resGamSit.getCodRes()+"' ) "));
        request += " AND ( "+String.join(" OR ", clauseResGamSit)+" ) ";
        return request;
    }

    private static void setDefaultQueryParameters(final VolumesTraitesSearchQuery searchQuery, Query query) {
        query.setParameter("codenv", searchQuery.getCodEnv());
        query.setParameter("codorgs", searchQuery.getCodOrgs());
        query.setParameter("typetp", GenEtpType.DIS);
        query.setParameter("fromdate", DateUtils.dateTimeFormatterFromStringISO(searchQuery.getFromDate()));
        query.setParameter("todate", DateUtils.dateTimeFormatterFromStringISO(searchQuery.getToDate()));
    }

    @Override
    public List<String> organismeByEnvInterval(String env, LocalDateTime fromDate, LocalDateTime toDate) {
        return genEtpRepository.organismeByEnvInterval(env, fromDate, toDate);
    }

    public List<ResGamSit> getGamSitResByEnvOrgs(EnvOrgsQuery query) {
        return genEtpRepository.getGamSitResByEnvOrgs(query).stream()
                .map(GenEtpMapper.INSTANCE::mapToResGamSit)
                .collect(Collectors.toList());
    }

    public void termineGenEtp(OccurrenceApplicationInput paramData) {
        String codenv = paramData.getCodEnv();
        String codorg = paramData.getCodOrg();
        String codapp = paramData.getCodApp();
        String percod = paramData.getPerCod();
        this.genEtpRepository.termineGenEtp(codenv, codorg, codapp, percod);
    }

    @Override
    public List<GenEtp> searchOccurrenceEtape(OccurrenceEtapePayload payload) {
        List<GenEtpType> typetpList = payload.getTypetp() != null
                ? List.of(payload.getTypetp())
                : List.of(GenEtpType.values());
        if (payload.getTypdat() != null && payload.getDatdeb() != null && payload.getDatfin() != null) {
            String datdeb = DateUtils.formatDateWithDash(payload.getDatdeb(), DateUtils.MIDNIGHT_TIME);
            String datfin = DateUtils.formatDateWithDash(payload.getDatfin(), DateUtils.END_OF_DAY_TIME);
            payload.setDatdeb(datdeb);
            payload.setDatfin(datfin);
            return this.genEtpRepository.searchOccurrenceEtapeWithTypdatDatdebDatfin(
                    payload,
                    typetpList,
                    datdeb,
                    datfin
            );
        } else {
            return this.genEtpRepository.searchOccurrenceEtape(
                    payload,
                    typetpList
            );
        }
    }

    @Override
    public List<DistinctCodenvCodorgCodappGenetp> findDistinctCodenvCodorgCodapp() {
        return genEtpRepository.findDistinctCodenvCodorgCodapp();
    }

    @Override
    public List<OccurrenceEtapeSearchData> getOccurrenceEtapeSearchData() {
        return genEtpRepository.getOccurrenceEtapeSearchData().stream()
                .map(GenEtpMapper.INSTANCE::mapToOccurrenceEtapeSearchData)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods) {
        return this.genEtpRepository.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(codenvs, codorgs, codapps, percods);
    }

    @Override
    public List<String> getDistinctComsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods) {
        return this.genEtpRepository.getDistinctComsByEnvsAndOrgsAndAppsAndPercods(codenvs, codorgs, codapps, percods);
    }

    @Override
    public List<GenEtp> setNewStatusForListOfGenEtp(List<GenEtpInput> etapes) {
        return etapes.stream().map(e ->
                genEtpRepository.findById(e.getId()).map(entity -> {
                    // Set the new status
                    entity.setStatut(e.getStatut() != null ? e.getStatut() : entity.getStatut());
                    // Save the updated entity back to the repository
                    genEtpRepository.save(entity);
                    // Convert the entity to domain object and return
                    return entityToDomainFunction().apply(entity);
                }).orElse(null)
        ).collect(Collectors.toList());
    }

    @Override
    public List<VideoStep> getVideoSteps(VideoStepPayload videoStepPayload) {
        return this.genEtpRepository.getVideoSteps(
                videoStepPayload.getCodenv(),
                videoStepPayload.getCodorg(),
                videoStepPayload.getCodapp(),
                videoStepPayload.getPercod()
        );
    }

    @Override
    public FirstVideoStep getFirstVideoStep(VideoStepPayload videoStepPayload) {
        return this.genEtpRepository.getFirstVideoStep(
                videoStepPayload.getCodenv(),
                videoStepPayload.getCodorg(),
                videoStepPayload.getCodapp(),
                videoStepPayload.getPercod()
        );
    }

    @Override
    public VideoStepDetailsFichierDTO getVideoStepDetailsFichier(VideoStepDetailsFichierPayload videoStepDetailsFichierPayload) {
        return this.genFicRepository.getVideoStepDetailsFichier(
                videoStepDetailsFichierPayload.getCodenv(),
                videoStepDetailsFichierPayload.getCodorg(),
                videoStepDetailsFichierPayload.getCodapp(),
                videoStepDetailsFichierPayload.getPercod(),
                videoStepDetailsFichierPayload.getCodcom(),
                videoStepDetailsFichierPayload.getCodfic(),
                videoStepDetailsFichierPayload.getNumcom()
        );
    }

    @Override
    public GenEtp findById(Integer id) {
        return this.genEtpRepository.findById(id).map(entity -> entityToDomainFunction().apply(entity)).orElse(null);
    }

    public void valideGenEtpByIdetap(Integer idEtap, Integer codinf) {
        genEtpRepository.valideGenEtpByIdetap(idEtap, codinf);
    }

    public void valideGenEtpByIdtfusAndStatut(Integer idtFus, String statut, Integer codinf) {
        genEtpRepository.valideGenEtpByIdtfusAndStatut(idtFus, statut, codinf);
    }

    public boolean isExistEtpSuspendu(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
        return genEtpRepository.isExistEtpSuspendu(genEtpEnvOrgAppPercodQuery);
    }

    @Override
    public List<GenEtp> loadLiens(Integer idEtape) {
        return this.genEtpRepository.getLiens(idEtape).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public void invalidateGenEtpByIdEtape(Integer idEtape) {
        this.genEtpRepository.invalidateGenEtpByIdEtape(idEtape);
    }

    @Override
    public void invalidateGenEtpByIdEtapeAndStatut(Integer idEtape, String statut) {
        this.genEtpRepository.invalidateGenEtpByIdEtapeAndStatut(idEtape, statut);
    }

    @Override
    public void invalidateGenEtpByIdtfusAndStatut(Integer idEtape, String statut) {
        this.genEtpRepository.invalidateGenEtpByIdtfusAndStatut(idEtape, statut);
    }

    public void termineGenEtpByBonTravail(BonTravailUpdatePayload bonTravailUpdatePayload) {
        String codenv = bonTravailUpdatePayload.getCodenv();
        String codorg = bonTravailUpdatePayload.getCodorg();
        String codapp = bonTravailUpdatePayload.getCodapp();
        String percod = bonTravailUpdatePayload.getPercod();
        String numcom = bonTravailUpdatePayload.getNumcom();
        String codcom = bonTravailUpdatePayload.getCodcom();
        String codfic = bonTravailUpdatePayload.getCodfic();
        this.genEtpRepository.termineGenEtpByBonTravail(codenv, codorg, codapp, percod, numcom, codcom, codfic);
    }

    public boolean isExistGenEtpTypDisStatCVDS(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
        return this.genEtpRepository.isExistGenEtpTypDisStatCVDS(genEtpEnvOrgAppPercodQuery);
    }

    public void valideGenEtpTypBil(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
        this.genEtpRepository.valideGenEtpTypBil(genEtpEnvOrgAppPercodQuery);
    }

    public List<String> getDistinctOrgs() {
        return genEtpRepository.getDistinctOrgs();
    }

    public List<String> getDistinctEnvs() {
        return genEtpRepository.getDistinctEnvs();
    }

    @Override
    public boolean checkIfGenEtpExists(GenEtpExistsQuery query) {
        return genEtpRepository.checkIfGenEtpExists(query);
    }
}
