package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.entities.GenEtpEntity;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.domain.genfic.model.EnvOrg;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.Facturation;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import fr.acoss.posdoc.domain.genfic.model.OccurrencesFichiersFiltersInput;
import fr.acoss.posdoc.domain.genfic.model.ReeditionMassification;
import fr.acoss.posdoc.domain.genfic.model.ReeditionProduit;
import fr.acoss.posdoc.domain.genfic.model.ReeditionRessource;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicQuery;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import fr.acoss.posdoc.domain.genfic.secondary.GenFicPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataFacturationInput;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReeditionPersistenceImpl extends AbstractObjectPersistence<GenEtpEntity, String, GenFicCompositeId>
        implements GenFicPersistence {

    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    private final GenFicRepository genFicRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ReeditionPersistenceImpl(
            GenFicRepository genFicRepository
    ) {
        this.genFicRepository = genFicRepository;
    }

    @Override
    protected JpaSpecificationExecutor<GenEtpEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<GenEtpEntity, String> getRepository() {
        return null;
    }

    @Override
    protected Function<GenEtpEntity, GenFicCompositeId> entityToDomainFunction() {
        return null;
    }

    @Override
    protected Function<GenFicCompositeId, GenEtpEntity> domainToEntityFunction() {
        return null;
    }

    @Override
    public List<GenFic> findOccurrencesFichiers(OccurrencesFichiersFiltersInput filtersPayload) {
        List<GenFicEntity> results = this.genFicRepository.findOccurrencesFichiersFiltered(filtersPayload);

        return results.stream()
                .map(this::mapEntityToGenFic)
                .collect(Collectors.toList());
    }

    @Override
    public String findOccurrencesFichiersWithMaxSizeCheck(OccurrencesFichiersFiltersInput filtersPayload) {
        Integer count = this.genFicRepository.countOccurrencesFichiers(filtersPayload);

        if (count != null && count > maxSize) {
            return StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize;
        }
        return StringUtils.EMPTY;
    }

    private GenFic mapEntityToGenFic(GenFicEntity entity) {
        GenFic genFic = new GenFic();
        genFic.setCodenv(entity.getId().getCodenv());
        genFic.setCodorg(entity.getId().getCodorg());
        genFic.setCodapp(entity.getId().getCodapp());
        genFic.setPercod(entity.getId().getPercod());
        genFic.setCodcom(entity.getId().getCodcom());
        genFic.setCodfic(entity.getId().getCodfic());
        genFic.setNumcom(entity.getId().getNumcom());
        genFic.setCodprd(entity.getCodprd());
        genFic.setFicsta(entity.getFicsta());
        genFic.setFicinf(entity.getFicinf());
        genFic.setFrefec(entity.isFrefec());
        genFic.setFicvid(entity.isFicvid());
        genFic.setDappcr(entity.getDappcr());
        genFic.setDfichd(entity.getDfichd());
        genFic.setDficht(entity.getDficht());
        return genFic;
    }

    @Override
    public List<EnvOrgApp> getDistinctEnvOrgApp() {
        return this.genFicRepository.distinctEnvOrgApp();
    }

    @Override
    public List<EnvOrg> getDistinctEnvOrg() {
        return this.genFicRepository.distinctEnvOrgWithMasorgAndPeriode();
    }

    @Override
    public List<String> getPeriodeFromGenfic(String codenv, List<String> codorg, String codapp){
        return this.genFicRepository.getPeriodeFromGenfic(codenv, codorg, codapp);
    }

    @Override
    public List<String> getCommandeFromGenfic(String codenv, List<String> codorg, String periode){
        return this.genFicRepository.getCommandeFromGenfic(codenv, codorg, periode);
    }

    @Override
    public List<String> getCommandeFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode){
        return this.genFicRepository.getCommandeFromGenficWithApp(codenv, codorg, codapp, periode);
    }

    @Override
    public List<String> getFichierFromGenfic(String codenv, List<String> codorg, String periode, String commande){
        return this.genFicRepository.getFichierFromGenfic(codenv, codorg, periode, commande);
    }

    @Override
    public List<String> getFichierFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode, String commande) {
        return this.genFicRepository.getFichierFromGenficWithApp(codenv, codorg, codapp, periode, commande);
    }

    @Override
    public List<ReeditionRessource> searchReeditionPerRessurce(String codenv, List<String> codorg, String codapp, String periode) {
      return  this.genFicRepository.searchReeditionPerRessurce(codenv, codorg, codapp, periode);
    }

    @Override
    public List<ReeditionMassification> searchReeditionParMassification(final SearchReeditionParMassificationQuery query) {
        return  this.genFicRepository.searchReeditionParMassification(query);
    }

    @Override
    public List<ReeditionProduit> searchReeditionPerProduit(String codenv, List<String> codorg, String application, String periode, String codcom, String codfic) {
        return  this.genFicRepository.searchReeditionPerProduit(codenv, codorg, application, periode, codcom, codfic);
    }

    @Override
    public List<String> getOrganismeMassification() {
        return  this.genFicRepository.getOrganismeMassificationWithPeriods();
    }

    @Override
    public List<Facturation> getFacturation(ParamDataFacturationInput paramData) {
        if(Boolean.TRUE.equals(paramData.getIsMasApp())) {
            return this.genFicRepository.getFacturationMAS(paramData.getCodEnv(), paramData.getCodOrg(), paramData.getCodApp(), paramData.getPerCod());
        }else {
            return this.genFicRepository.getFacturation(paramData.getCodEnv(), paramData.getCodOrg(), paramData.getCodApp(), paramData.getPerCod());
        }
    }

    public void termineGenFic(OccurrenceApplicationInput paramData) {
        String codenv = paramData.getCodEnv();
        String codorg = paramData.getCodOrg();
        String codapp = paramData.getCodApp();
        String percod = paramData.getPerCod();
        this.genFicRepository.termineGenFic(codenv, codorg, codapp, percod);
    }

    @Override
    public SearchOccAppByFicPayloadDTO searchOccAppByFic(SearchOccAppByFicQuery query) {
        Map<String, Object> result = this.genFicRepository.searchOccAppByFic(query);
        return mapResultToGenFic(result);
    }

    private SearchOccAppByFicPayloadDTO mapResultToGenFic(Map<String, Object> result) {
        SearchOccAppByFicPayloadDTO payloadDTO = new SearchOccAppByFicPayloadDTO();
        payloadDTO.setLibfic((String) result.get("libfic"));
        payloadDTO.setLibmul((String) result.get("libmul"));
        payloadDTO.setLibfor((String) result.get("libfor"));
        payloadDTO.setLibsup((String) result.get("libsup"));
        payloadDTO.setReffor((String) result.get("reffor"));
        payloadDTO.setRefimp((String) result.get("refimp"));
        payloadDTO.setRefsup((String) result.get("refsup"));
        payloadDTO.setReftri((String) result.get("reftri"));
        payloadDTO.setRefech((String) result.get("refech"));
        payloadDTO.setFicatt((String) result.get("ficatt"));
        payloadDTO.setFicsta((String) result.get("ficsta"));
        payloadDTO.setMaxpag((Integer) result.get("maxpag"));
        payloadDTO.setCodprd((String) result.get("codprd"));
        payloadDTO.setRepexp((Integer) result.get("repexp"));
        payloadDTO.setTypsig((String) result.get("typsig"));
        payloadDTO.setCodcli((String) result.get("codcli"));
        payloadDTO.setCodrnd((String) result.get("codrnd"));
        payloadDTO.setFicinf((String) result.get("ficinf"));
        payloadDTO.setDappcr((LocalDateTime) result.get("dappcr"));
        payloadDTO.setDfichd((LocalDateTime) result.get("dfichd"));
        payloadDTO.setDfichs((LocalDateTime) result.get("dfichs"));
        payloadDTO.setDficht((LocalDateTime) result.get("dficht"));
        payloadDTO.setCodsit((String) result.get("codsit"));
        payloadDTO.setEclate((Boolean) result.get("eclate"));
        return payloadDTO;
    }
}
