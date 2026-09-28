package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.genapp.model.GenApp;
import fr.acoss.posdoc.domain.genapp.model.OccurrenceApplication;
import fr.acoss.posdoc.domain.genapp.primary.GenAppService;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.genfic.model.Facturation;
import fr.acoss.posdoc.domain.genfic.model.OccurenceApplication;
import fr.acoss.posdoc.domain.genfic.secondary.GenFicPersistence;
import fr.acoss.posdoc.domain.genpro.secondary.GenProPersistence;
import fr.acoss.posdoc.domain.genscr.secondary.GenScrPersistence;
import fr.acoss.posdoc.domain.massification.secondary.MassificationPersistence;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsCommandesFichiersPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichesLiaison;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsFichiersProduitsDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsGeneralitesPayload;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsMassification;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsNoticesDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProduction;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProductionDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationSuiviProductionInput;
import fr.acoss.posdoc.domain.occurrence.application.model.OngletsParamDataInput;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataFacturationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataIncidentInput;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataMassificationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.SearchOccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.TerminaisonGenAppInput;
import fr.acoss.posdoc.domain.occurrence.application.model.UpdateTypRefInGenAppInput;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.service.adelaide.TerminaisonGenAppAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.GenericMessageAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.types.ApplicationStatut;
import fr.acoss.posdoc.types.Constantes;
import fr.acoss.posdoc.types.TypeRefection;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OccurrenceApplicationResolver extends AbstractResolver {

    private final GenAppPersistence genAppPersistence;
    private final GenScrPersistence genScrPersistence;
    private final MassificationPersistence massificationPersistence;
    private final GenFicPersistence genFicPersistence;
    private final GenProPersistence genProPersistence;
    private final GenEtpPersistence genEtpPersistence;
    private final TerminaisonGenAppAdelaideService terminaisonAdelaideService;
    private final GenAppService genAppService;
    private static final String SEPARATEUR = "-";

    final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;

    public OccurrenceApplicationResolver(
            final GenAppPersistence genAppPersistence,
            final GenScrPersistence genScrPersistence,
            final MassificationPersistence massificationPersistence,
            final GenFicPersistence genFicPersistence,
            final GenProPersistence genProPersistence,
            final GenEtpPersistence genEtpPersistence,
            final TerminaisonGenAppAdelaideService terminaisonAdelaideService,
            final GenAppService genAppService,
            final GenericMessageAdelaideServiceImpl genericMessageAdelaideService
    ) {
        this.genAppPersistence = genAppPersistence;
        this.genScrPersistence = genScrPersistence;
        this.massificationPersistence = massificationPersistence;
        this.genFicPersistence = genFicPersistence;
        this.genProPersistence = genProPersistence;
        this.genEtpPersistence = genEtpPersistence;
        this.terminaisonAdelaideService = terminaisonAdelaideService;
        this.genAppService = genAppService;
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    public List<OccurenceApplication> searchOccurencePerApplication(String currDate, String codSit, String codEnv, List<String> codOrgs, String codApp, String tri, Boolean ext) {
        AdelaideResult signalS01 = getSignalS01();
        List<OccurenceApplication> searchResult = this.genAppService.searchOccurencePerApplication(getSearchOccurrenceApplicationInput(currDate, codSit, codEnv, codOrgs, codApp, tri, ext));
        boolean isExitSignalS01 = signalS01 != null && signalS01.getResult() != null && !signalS01.getResult().isEmpty();
        if (isExitSignalS01) {
            String signalMessage = signalS01.getResult();
            List<String[]> parsedData = parseMessage(signalMessage);
            for (String[] datas : parsedData) {
                OccurenceApplication occurenceApplication = new OccurenceApplication();
                occurenceApplication.setCodEnv(datas[0]);
                occurenceApplication.setCodOrg(datas[1]);
                occurenceApplication.setCodApp(datas[2]);
                occurenceApplication.setPerCod(datas[3]);
                occurenceApplication.setAppsta(ApplicationStatut.APPSTA_C);
                occurenceApplication.setCodSit(datas[4]);
                searchResult.add(occurenceApplication);
            }
        }
        return searchResult;
    }

    private static SearchOccurrenceApplicationInput getSearchOccurrenceApplicationInput(String currDate, String codSit, String codEnv, List<String> codOrgs, String codApp, String tri, Boolean ext) {
        SearchOccurrenceApplicationInput searchOccurrenceApplicationInput = new SearchOccurrenceApplicationInput();
        searchOccurrenceApplicationInput.setExt(ext);
        searchOccurrenceApplicationInput.setTri(tri);
        searchOccurrenceApplicationInput.setCodOrgs(codOrgs);
        searchOccurrenceApplicationInput.setCodSit(codSit);
        searchOccurrenceApplicationInput.setCodEnv(codEnv);
        searchOccurrenceApplicationInput.setCodApp(codApp);
        searchOccurrenceApplicationInput.setCurrDate(currDate);
        return searchOccurrenceApplicationInput;
    }

    public List<DetailsGeneralitesPayload> getDetailsGeneralites(OngletsParamDataInput paramData) {
        return this.genAppPersistence.getDetailsGeneralites(paramData);
    }

    public List<DetailsCommandesFichiersPayload> getDetailsCommandesFichiers(OngletsParamDataInput paramData) {
        return this.genAppPersistence.getDetailsCommandesFichiers(paramData);
    }

    public List<DetailsIncident> getDetailsIncident(ParamDataIncidentInput paramData) {
        return this.genScrPersistence.getDetailsIncident(paramData);
    }

    public List<DetailsMassification> getDetailsMassification(ParamDataMassificationInput paramData) {
        return this.massificationPersistence.findDetailsMassificationForOccurrenceApplication(paramData);
    }

    public List<DetailsFichiersProduitsDTO> getDetailsFichiersProduits(OngletsParamDataInput paramData) {
        return this.genAppPersistence.getDetailsFichiersProduits(paramData);
    }

    public List<DetailsFichesLiaison> getDetailsFichesLiaison(OngletsParamDataInput paramData) {
        return this.genAppPersistence.getDetailsFichesLiaison(paramData);
    }

    public List<Facturation> getDetailsFacturation(ParamDataFacturationInput paramData) {
        return this.genFicPersistence.getFacturation(paramData);
    }

    public List<DetailsNoticesDTO> getDetailsNotices(OngletsParamDataInput paramData) {
        return this.genAppPersistence.getDetailsNotices(paramData);
    }

    public OccurrenceApplication getOccurrenceApplication(OccurrenceApplicationInput paramData) {
        return this.genAppPersistence.getOccurrenceApplication(paramData);
    }

    @Historisable(form = "Supervision > Production > Gestion des occurrences d'application", action = Action.UPDATE)
    public GenApp updateTypRefInGenApp(UpdateTypRefInGenAppInput paramData) {
        String codenv = paramData.getCodEnv();
        String codorg = paramData.getCodOrg();
        String codapp = paramData.getCodApp();
        String percod = paramData.getPerCod();
        TypeRefection typref = paramData.getTypRef();
        GenApp genapp = this.genAppPersistence.updateTypRef(codenv, codorg, codapp, percod, typref);
        if(genapp != null) {
            return genapp;
        }else {
            throw new ElementNotFoundException("GenApp", codenv + SEPARATEUR + codorg + SEPARATEUR + codapp + SEPARATEUR + percod);
        }
    }

    @Historisable(form = "Supervision > Production > Gestion des occurrences d'application", action = Action.FINISH)
    public UtiLog termineOccApp(TerminaisonGenAppInput paramData) {
        if( Boolean.FALSE.equals(paramData.getIsAnnule())) {
            OccurrenceApplicationInput param = new OccurrenceApplicationInput(
                    paramData.getCodEnv(),
                    paramData.getCodOrg(),
                    paramData.getCodApp(),
                    paramData.getPerCod()
            );
            this.genAppPersistence.termineGenApp(param);
            this.genFicPersistence.termineGenFic(param);
            this.genEtpPersistence.termineGenEtp(param);
            this.genProPersistence.termineGenPro(param);
        }
        return this.terminaisonAdelaideService.terminerGenApp(paramData);
    }

    public List<GenApp> finGenAppByCodenvCodorgCodappPercod(String[] params) {
        OccurrenceApplicationInput paramData = new OccurrenceApplicationInput(params[0], params[1], params[2], params[3]);
        return this.genAppPersistence.finGenAppByCodenvCodorgCodappPercod(paramData);
    }

    private AdelaideResult getSignalS01() {
        String message = AdelaideUtil. FONC_GET_SIGNAL_S01 + AdelaideUtil.CAR_FIN;
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(message);

        return this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
    }

    private List<String[]> parseMessage(String message) {
        // Split the message by the ASCII character 25 ()
        String[] records = message.split(String.valueOf((char) 25));
        List<String[]> result = new ArrayList<>();

        for (String recordValue : records) {
            // Split each record by the ASCII character 24 ()
            String[] fields = recordValue.split(String.valueOf((char) 24));
            result.add(fields);
        }

        return result;
    }

    public OccurrenceApplicationSuiviProductionDTO getOccurrenceApplicationForSuiviProduction(OccurrenceApplicationSuiviProductionInput query) {
        String errorMessage = this.genAppPersistence.checkMaxSizeOccurrencesApplicationForSuiviProduction(query);
        if (!errorMessage.isEmpty()) {
            return new OccurrenceApplicationSuiviProductionDTO(new ArrayList<>(), errorMessage);
        }
        List<OccurrenceApplicationSuiviProduction> occurrences = this.genAppPersistence.searchOccurrenceApplicationForSuiviProduction(query);
        return new OccurrenceApplicationSuiviProductionDTO(occurrences, null);
    }
}