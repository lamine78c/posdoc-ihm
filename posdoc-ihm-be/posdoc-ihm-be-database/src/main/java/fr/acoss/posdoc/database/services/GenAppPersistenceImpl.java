package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.GenAppRepository;
import fr.acoss.posdoc.database.entities.GenAppCompositeId;
import fr.acoss.posdoc.database.entities.GenAppEntity;
import fr.acoss.posdoc.database.mappers.GenAppMapper;
import fr.acoss.posdoc.domain.bontravail.model.IsBonTravailManuelInput;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriode;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriodeInput;
import fr.acoss.posdoc.domain.genapp.model.GenApp;
import fr.acoss.posdoc.domain.genapp.model.OccurrenceApplication;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.OccurenceApplication;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsCommandesFichiersPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichesLiaison;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichiersProduitsDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsGeneralitesPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsNoticesDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProduction;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProductionInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OngletsParamDataInput;
import fr.acoss.posdoc.domain.occurrence.application.model.SearchOccurrenceApplicationInput;
import fr.acoss.posdoc.types.TypeRefection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenAppPersistenceImpl extends AbstractObjectPersistence<GenAppEntity, GenAppCompositeId, GenApp>
    implements GenAppPersistence {

  @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
  private int maxSize;

  private static final GenAppMapper MAPPER = GenAppMapper.INSTANCE;

  private final GenAppRepository genAppRepository;

  public GenAppPersistenceImpl(final GenAppRepository genAppRepository) {
    this.genAppRepository = genAppRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenAppEntity> getSpecificationExecutor() {
    return genAppRepository;
  }

  @Override
  protected JpaRepository<GenAppEntity, GenAppCompositeId> getRepository() {
    return genAppRepository;
  }

  @Override
  protected Function<GenAppEntity, GenApp> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenApp, GenAppEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<OccurenceApplication> searchOccurenceExtPerApplicationOrderByDate(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceExtPerApplicationOrderByDate(input);
  }

  @Override
  public List<OccurenceApplication> searchOccurenceExtPerApplication(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceExtPerApplication(input);
  }

  @Override
  public List<OccurenceApplication> searchOccurenceNonExtPerApplicationOrderByDate(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceNonExtPerApplicationOrderByDate(input);
  }

  @Override
  public List<OccurenceApplication> searchOccurenceNonExtPerApplication(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceNonExtPerApplication(input);
  }

  @Override
  public List<OccurenceApplication> searchOccurenceNonSitePerApplication(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceNonSitePerApplication(input);
  }

  @Override
  public List<OccurenceApplication> searchOccurenceNonSitePerApplicationOrderByDate(final SearchOccurrenceApplicationInput input) {
    return this.genAppRepository.searchOccurenceNonSitePerApplicationOrderByDate(input);
  }

  public List <DetailsGeneralitesPayload> getDetailsGeneralites(OngletsParamDataInput paramData) {
    return this.genAppRepository.getDetailsGeneralites(paramData);
  }

  public List<EnvOrgApp> getDistinctEnvOrgApp() {
    return this.genAppRepository.getDistinctEnvOrgApp();
  }

  public List <DetailsCommandesFichiersPayload> getDetailsCommandesFichiers(OngletsParamDataInput paramData) {
    return this.genAppRepository.getDetailsCommandesFichiers(paramData);
  }

  public List <DetailsFichiersProduitsDTO> getDetailsFichiersProduits(OngletsParamDataInput paramData) {
    return this.genAppRepository.getDetailsFichiersProduits(paramData);
  }

  public List<DetailsFichesLiaison> getDetailsFichesLiaison(OngletsParamDataInput paramData) {
    return this.genAppRepository.getDetailsFichesLiaison(paramData).stream().map(this::getDetailsFichesLiaisonFromMap).collect(Collectors.toList());
  }

  public List <DetailsNoticesDTO> getDetailsNotices(OngletsParamDataInput paramData) {
      return this.genAppRepository.getDetailsNotices(paramData);
  }

    public List <DetailsPeriode> getDetailsPeriode(DetailsPeriodeInput paramData) {
      List<Map<String, String>> queryResult;
      if (Boolean.TRUE.equals(paramData.getIsManuel())) {
        queryResult = this.genAppRepository.getDetailsPeriodeWithManuel(paramData);
      } else {
        queryResult = this.genAppRepository.getDetailsPeriode(paramData);
      }
      return queryResult.stream().map(this::getDetailsPeriodeFromMap).collect(Collectors.toList());
    }

    private DetailsPeriode getDetailsPeriodeFromMap(Map<String, String> map) {
      DetailsPeriode detailsPeriode = new DetailsPeriode();
      detailsPeriode.setPerCod(map.get(ParamsUtils.PERCOD));
      detailsPeriode.setAppsta(map.get(ParamsUtils.APPSTA));
      detailsPeriode.setDappld(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPLD)));
      detailsPeriode.setDapplt(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPLT)));
      detailsPeriode.setManuel(Boolean.valueOf(map.get(ParamsUtils.MANUEL)));

      return detailsPeriode;
    }

    public OccurrenceApplication getOccurrenceApplication(OccurrenceApplicationInput paramData) {
      return this.genAppRepository.getOccurrenceApplication(paramData);
    }

    public GenApp updateTypRef(String codenv, String codorg, String codapp, String percod, TypeRefection typref) {
      Optional<GenAppEntity> genAppEntity = this.genAppRepository.findById(new GenAppCompositeId(codenv, codorg, codapp, percod));
      if(genAppEntity.isPresent()) {
        genAppEntity.get().setTypref(typref);
        return entityToDomainFunction().apply(genAppEntity.get());
      }
      return null;
    }

    public void termineGenApp(OccurrenceApplicationInput paramData) {
      this.genAppRepository.termineGenApp(paramData);
    }

    public List<GenApp> finGenAppByCodenvCodorgCodappPercod(OccurrenceApplicationInput paramData) {
        return this.genAppRepository.finGenAppByCodenvCodorgCodappPercod(paramData);
    }

    public Boolean isBonTravailManuel(IsBonTravailManuelInput query) {
        return this.genAppRepository.isBonTravailManuel(query);
    }

    public void startGenApp(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
      this.genAppRepository.startGenApp(genEtpEnvOrgAppPercodQuery);
    }

    @Override
    public List<OccurrenceApplicationSuiviProduction> searchOccurrenceApplicationForSuiviProduction(OccurrenceApplicationSuiviProductionInput query) {
      return this.genAppRepository.getOccurrenceApplicationForSuiviProduction(query).stream()
              .map(this::getOccurrenceApplicationForSuiviProduction)
              .collect(Collectors.toList());
    }

    @Override
    public String checkMaxSizeOccurrencesApplicationForSuiviProduction(OccurrenceApplicationSuiviProductionInput query) {
      Integer count = this.genAppRepository.countOccurrencesApplicationForSuiviProduction(query);

      if (count != null && count > maxSize) {
        return StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize;
      }
      return StringUtils.EMPTY;
    }

    private OccurrenceApplicationSuiviProduction getOccurrenceApplicationForSuiviProduction(Map<String, String> map) {
      OccurrenceApplicationSuiviProduction occurrence = new OccurrenceApplicationSuiviProduction();
      occurrence.setCodenv(map.get(ParamsUtils.CODENV));
      occurrence.setCodorg(map.get(ParamsUtils.CODORG));
      occurrence.setCodapp(map.get(ParamsUtils.CODAPP));
      occurrence.setPercod(map.get(ParamsUtils.PERCOD));
      occurrence.setAppsta(map.get(ParamsUtils.APPSTA));
      occurrence.setAppinf(map.get(ParamsUtils.APPINF));
      occurrence.setArefec(Boolean.valueOf(map.get(ParamsUtils.AREFEC)));
      occurrence.setDappld(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPLD)));
      occurrence.setDapplt(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPLT)));
      occurrence.setDappls(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPLS)));
      occurrence.setManuel(Boolean.valueOf(map.get(ParamsUtils.MANUEL)));
      occurrence.setCodsit(map.get(ParamsUtils.CODSIT));
      occurrence.setCodcom(map.get(ParamsUtils.CODCOM));
      occurrence.setCodfic(map.get(ParamsUtils.CODFIC));
      occurrence.setNumcom(map.get(ParamsUtils.NUMCOM));
      occurrence.setCodprd(map.get(ParamsUtils.CODPRD));
      occurrence.setFicsta(map.get(ParamsUtils.FICSTA));
      occurrence.setFicinf(map.get(ParamsUtils.FICINF));
      occurrence.setFrefec(Boolean.valueOf(map.get(ParamsUtils.FREFEC)));
      occurrence.setFicvid(Boolean.valueOf(map.get(ParamsUtils.FICVID)));
      occurrence.setDappcr(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPCR)));
      occurrence.setDfichd(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DFICHD)));
      occurrence.setDficht(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DFICHT)));
      occurrence.setDfichs(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DFICHS)));

      return occurrence;
    }

    private DetailsFichesLiaison getDetailsFichesLiaisonFromMap(Map<String, String> map) {
      DetailsFichesLiaison details = new DetailsFichesLiaison();
      details.setCoddes(map.get(ParamsUtils.CODDES));
      details.setCodcom(map.get(ParamsUtils.CODCOM));
      details.setCodfic(map.get(ParamsUtils.CODFIC));
      details.setNumcom(map.get(ParamsUtils.NUMCOM));
      details.setCodgam(map.get(ParamsUtils.CODGAM));
      details.setCodprd(map.get(ParamsUtils.CODPRD));
      details.setRefimp(map.get(ParamsUtils.REFIMP));
      details.setNbrexe(ConvertorUtils.convertToInteger(map.get(ParamsUtils.NBREXE)));
      details.setPagfic(ConvertorUtils.convertToInteger(map.get(ParamsUtils.PAGFIC)));
      details.setLibfic(map.get(ParamsUtils.LIBFIC));
      details.setLibdes(map.get(ParamsUtils.LIBDES));

      return details;
    }
}
