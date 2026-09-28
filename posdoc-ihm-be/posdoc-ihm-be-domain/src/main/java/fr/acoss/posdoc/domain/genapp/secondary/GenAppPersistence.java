package fr.acoss.posdoc.domain.genapp.secondary;

import fr.acoss.posdoc.domain.bontravail.model.IsBonTravailManuelInput;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriode;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriodeInput;
import fr.acoss.posdoc.domain.genapp.model.GenApp;
import fr.acoss.posdoc.domain.genapp.model.OccurrenceApplication;
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

import java.util.List;

public interface GenAppPersistence {
    List<OccurenceApplication> searchOccurenceExtPerApplicationOrderByDate(final SearchOccurrenceApplicationInput input);
    List<OccurenceApplication> searchOccurenceExtPerApplication(final SearchOccurrenceApplicationInput input);
    List<OccurenceApplication> searchOccurenceNonExtPerApplicationOrderByDate(final SearchOccurrenceApplicationInput input);
    List<OccurenceApplication> searchOccurenceNonExtPerApplication(final SearchOccurrenceApplicationInput input);
    List<OccurenceApplication> searchOccurenceNonSitePerApplication(final SearchOccurrenceApplicationInput input);
    List<OccurenceApplication> searchOccurenceNonSitePerApplicationOrderByDate(final SearchOccurrenceApplicationInput input);
    List<DetailsGeneralitesPayload> getDetailsGeneralites(OngletsParamDataInput paramData);
    List<EnvOrgApp> getDistinctEnvOrgApp();
    List<DetailsCommandesFichiersPayload> getDetailsCommandesFichiers(OngletsParamDataInput paramData);
    List<DetailsFichiersProduitsDTO> getDetailsFichiersProduits(OngletsParamDataInput paramData);
    List<DetailsFichesLiaison> getDetailsFichesLiaison(OngletsParamDataInput paramData);
    List<DetailsNoticesDTO> getDetailsNotices(OngletsParamDataInput paramData);
    List<DetailsPeriode> getDetailsPeriode(DetailsPeriodeInput paramData);
    OccurrenceApplication getOccurrenceApplication(OccurrenceApplicationInput paramData);
    GenApp updateTypRef(String codenv, String codorg, String codapp, String percod, TypeRefection typref);
    void termineGenApp(OccurrenceApplicationInput paramData);
    List<GenApp> finGenAppByCodenvCodorgCodappPercod(OccurrenceApplicationInput paramData);
    Boolean isBonTravailManuel(IsBonTravailManuelInput query);
    void startGenApp(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);
    List<OccurrenceApplicationSuiviProduction> searchOccurrenceApplicationForSuiviProduction(OccurrenceApplicationSuiviProductionInput query);
    String checkMaxSizeOccurrencesApplicationForSuiviProduction(OccurrenceApplicationSuiviProductionInput query);
}
