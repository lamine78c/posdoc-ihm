package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genetp.model.DistinctCodenvCodorgCodappGenetp;
import fr.acoss.posdoc.domain.genetp.model.FirstVideoStep;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.GenEtpInput;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapePayload;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapeSearchData;
import fr.acoss.posdoc.domain.genetp.model.VideoStep;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierDTO;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierPayload;
import fr.acoss.posdoc.domain.genetp.model.VideoStepPayload;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genetp.primary.GenEtpService;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.genscr.secondary.GenScrPersistence;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationOccurrenceEtape;
import fr.acoss.posdoc.domain.occurrence.etape.model.DetailsMassificationPayload;
import fr.acoss.posdoc.domain.occurrence.etape.model.Incidents;
import fr.acoss.posdoc.domain.occurrence.etape.model.InvalideGenEtpPayload;
import fr.acoss.posdoc.domain.occurrence.etape.model.ScriptPayload;
import fr.acoss.posdoc.domain.occurrence.etape.model.ValideGenEtpPayload;
import fr.acoss.posdoc.domain.occurrence.etape.model.ValideOrInvalideGenEtpPayload;
import fr.acoss.posdoc.domain.occurrence.etape.secondary.OccurrenceEtapeDetailsMassificationPersistence;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.GenericMessageAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.types.GenEtpType;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static fr.acoss.posdoc.types.CodeInformation.CODINF_0;
import static fr.acoss.posdoc.types.CodeInformation.CODINF_1;
import static fr.acoss.posdoc.types.CodeInformation.CODINF_7;
import static fr.acoss.posdoc.types.CodeInformation.CODINF_8;
import static fr.acoss.posdoc.types.TypeFusion.ETPFUS_DIS;
import static fr.acoss.posdoc.types.TypeFusion.ETPFUS_FAB;
import static fr.acoss.posdoc.types.TypeFusion.ETPFUS_TIRET;
import static fr.acoss.posdoc.types.Statut.HISTORIQUE;
import static fr.acoss.posdoc.types.Statut.INVALIDE;
import static fr.acoss.posdoc.types.Statut.SUSPENDU;
import static fr.acoss.posdoc.types.Statut.TERMINE;
import static fr.acoss.posdoc.types.Statut.VALIDE;

@Component
public class OccurrenceEtapeResolver extends AbstractResolver {
    private final GenEtpPersistence genEtpPersistence;
    private final GenScrPersistence genScrPersistence;
    private final GenEtpService genEtpService;
    private final OccurrenceEtapeDetailsMassificationPersistence detailsMassificationPersistence;
    private final UtiLogService utiLogService;
    private final GenAppPersistence genAppPersistence;
    final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;
    public OccurrenceEtapeResolver(
            final GenEtpPersistence genEtpPersistence,
            final GenScrPersistence genScrPersistence,
            final GenEtpService genEtpService,
            final OccurrenceEtapeDetailsMassificationPersistence detailsMassificationPersistence,
            final UtiLogService utiLogService,
            final GenAppPersistence genAppPersistence,
            final GenericMessageAdelaideServiceImpl genericMessageAdelaideService
            )
    {
        this.genEtpPersistence = genEtpPersistence;
        this.genScrPersistence = genScrPersistence;
        this.genEtpService = genEtpService;
        this.utiLogService = utiLogService;
        this.genAppPersistence = genAppPersistence;
        this.detailsMassificationPersistence = detailsMassificationPersistence;
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    public List<GenEtp> searchOccurrenceEtape(OccurrenceEtapePayload occurrenceEtapePayload) {
        return this.genEtpPersistence.searchOccurrenceEtape(occurrenceEtapePayload);
    }

    public List<GenEtp> setNewStatusForListOfGenEtp(List<GenEtpInput> etapes) {
        return this.genEtpPersistence.setNewStatusForListOfGenEtp(etapes);
    }

    public List<DistinctCodenvCodorgCodappGenetp> findDistinctCodenvCodorgCodapp() {
        return this.genEtpPersistence.findDistinctCodenvCodorgCodapp();
    }

    public List<OccurrenceEtapeSearchData> getOccurrenceEtapeSearchData() {
        return this.genEtpPersistence.getOccurrenceEtapeSearchData();
    }

    public List<String> getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods) {
        return this.genEtpPersistence.getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(codenvs, codorgs, codapps, percods);
    }

    public List<String> getDistinctComsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods) {
        return this.genEtpPersistence.getDistinctComsByEnvsAndOrgsAndAppsAndPercods(codenvs, codorgs, codapps, percods);
    }

    public List<VideoStep> getVideoSteps(VideoStepPayload videoStepPayload) {
        return this.genEtpService.getVideoSteps(videoStepPayload);
    }

    public FirstVideoStep getFirstVideoStep(VideoStepPayload videoStepPayload) {
        return this.genEtpService.getFirstVideoStep(videoStepPayload);
    }

    public GenEtp getGenEtpById(Integer id) {
        return this.genEtpPersistence.findById(id);
    }

    public List<Incidents> getIncidentsByIdetap(Integer idetap, Integer idtfus) {
        if(!idtfus.equals(0)) {
            idetap = idtfus;
        }
        return this.genScrPersistence.getIncidentsByIdetap(idetap);
    }

    public List<DetailsMassificationOccurrenceEtape> findDetailsMassificationForOccurrenceEtape(DetailsMassificationPayload payload) {
        return this.detailsMassificationPersistence.findDetailsMassificationForOccurrenceEtape(payload);
    }

    public VideoStepDetailsFichierDTO getVideoStepDetailsFichier(VideoStepDetailsFichierPayload videoStepDetailsFichierPayload) {
        return this.genEtpPersistence.getVideoStepDetailsFichier(videoStepDetailsFichierPayload);
    }

    public AdelaideResult consulteScriptEtape(ScriptPayload scriptPayload) {
        String message = AdelaideUtil. FONC_GET_FICHIER + scriptPayload.getScript() + AdelaideUtil.CAR_CHAMP + "0" + AdelaideUtil.CAR_FIN;
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(message);
        return this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
    }

    @Historisable(form = "Supervision > Production > Occurrences d'étapes", action = Action.VALIDATE)
    public List<UtiLog> valideGenEtp(List<ValideGenEtpPayload> valideGenEtpPayloadList) {
        List<UtiLog> result = new ArrayList<>();
        valideGenEtpPayloadList.forEach(e -> {
            GenEtp genEtp = this.genEtpPersistence.findById(e.getIdetap());
            String statut = genEtp.getStatut();
            try {
                handleValidateEtape(genEtp);
                handleSuspendStatut(statut, new GenEtpEnvOrgAppPercodQuery(genEtp.getCodenv(), genEtp.getCodorg(), genEtp.getCodapp(), genEtp.getPercod()));
                result.add(new UtiLog());
            }catch (Exception error) {
                insertUtilog(error.getMessage(), UtiLogUtil.ACT_VALIDER, genEtp, e.getUser(), e.getFormid());
                throw new CustomExceptionMessage(error.getMessage());
            }
        });
        return result;
    }

    @Historisable(form = "Supervision > Production > Occurrences d'étapes", action = Action.INVALIDATE)
    public List<UtiLog> invalideGenEtp(List<InvalideGenEtpPayload> invalideGenEtpPayloadList) {
        List<UtiLog> result = new ArrayList<>();
        invalideGenEtpPayloadList.forEach(e -> {
            GenEtp genEtp = this.genEtpPersistence.findById(e.getIdetap());
            String statut = genEtp.getStatut();
            String etpFus = genEtp.getEtpfus();
            GenEtpType typEtp = genEtp.getTypetp();
            try {
                if(typEtp.equals(GenEtpType.DEB) || typEtp.equals(GenEtpType.FIN)) {
                    throw new CustomExceptionMessage("Impossible d'invalider une étape DEB ou FIN");
                }
                if(statut.equals(TERMINE) || statut.equals(HISTORIQUE)) {
                    throw new CustomExceptionMessage("Impossible d'invalider une étape déja terminée");
                }
                handleInvalidateEtape(genEtp.getId(), etpFus, statut);
                handleTypEtpDis(typEtp, new GenEtpEnvOrgAppPercodQuery(genEtp.getCodenv(), genEtp.getCodorg(), genEtp.getCodapp(), genEtp.getPercod()));
                handleSuspendStatut(statut, new GenEtpEnvOrgAppPercodQuery(genEtp.getCodenv(), genEtp.getCodorg(), genEtp.getCodapp(), genEtp.getPercod()));
                result.add(new UtiLog());
            }catch (Exception error) {
                insertUtilog(error.getMessage(), UtiLogUtil.ACT_INVALIDER, genEtp, e.getUser(), e.getFormid());
                throw new CustomExceptionMessage(error.getMessage());
            }
        });
        return result;
    }

    @Historisable(form = "Supervision > Production > Occurrences d'étapes", action = Action.INVALIDATE)
    public UtiLog invalideGenEtpEtLiens(InvalideGenEtpPayload payload) {
        GenEtp genEtp = this.genEtpPersistence.findById(payload.getIdetap());
        String statut = genEtp.getStatut();
        String etpFus = genEtp.getEtpfus();
        List<Integer> toInvalidate = new ArrayList<>();
        toInvalidate.add(genEtp.getId());
        this.loadLiensForInvalide(payload.getIdetap(), toInvalidate);
        try {
            toInvalidate.forEach(idetap -> handleInvalidateEtape(idetap, etpFus, statut));
            handleSuspendStatut(statut, new GenEtpEnvOrgAppPercodQuery(genEtp.getCodenv(), genEtp.getCodorg(), genEtp.getCodapp(), genEtp.getPercod()));
            return new UtiLog();
        }catch (Exception error) {
            insertUtilog(error.getMessage(), UtiLogUtil.ACT_INVALIDER, genEtp, payload.getUser(), payload.getFormid());
            throw new CustomExceptionMessage(error.getMessage());
        }
    }

    @Historisable(form = "Supervision > Production > Gestion des occurrences d'étapes", action = Action.UPDATE)
    public List<UtiLog> valideOuInvalideGenEtp(List<ValideOrInvalideGenEtpPayload> valideOrInvalideGenEtpPayloadList) {
        List<UtiLog> result = new ArrayList<>();
        List<ValideGenEtpPayload> valideGenEtpPayloadList = new ArrayList<>();
        List<InvalideGenEtpPayload> invalideGenEtpPayloadList = new ArrayList<>();
        valideOrInvalideGenEtpPayloadList.forEach(e -> {
            if(e.getStatut().equals(VALIDE)) {
                // valide
                valideGenEtpPayloadList.add(new ValideGenEtpPayload(e.getIdetap(), e.getUser(), e.getFormid()));
            }
            else if(e.getStatut().equals(INVALIDE)) {
                // invalide
                invalideGenEtpPayloadList.add(new InvalideGenEtpPayload(e.getIdetap(), e.getUser(), e.getFormid()));
            }
        });
        if(!valideGenEtpPayloadList.isEmpty()) {
            result.addAll(valideGenEtp(valideGenEtpPayloadList));
        }
        if(!invalideGenEtpPayloadList.isEmpty()) {
            result.addAll(invalideGenEtp(invalideGenEtpPayloadList));
        }
        return result;
    }

    private void loadLiensForInvalide(Integer idEtape, List<Integer> toInvalidate) {
        // On ne récupère pas les fils de type FIN ni les statuts I or T
        this.genEtpPersistence.loadLiens(idEtape)
            .stream()
            .filter(etape -> !etape.getTypetp().equals(GenEtpType.FIN) && !etape.getStatut().equals(INVALIDE) && !etape.getStatut().equals(TERMINE) )
            .forEach(etape -> {
                toInvalidate.add(etape.getId());
                this.loadLiensForInvalide(etape.getId(), toInvalidate);
            });
    }

    private void handleValidateEtape(GenEtp genEtp) {
        Integer idtFus = genEtp.getIdtfus().equals(0) ? genEtp.getId() : genEtp.getIdtfus();
        switch (genEtp.getEtpfus()) {
            case ETPFUS_TIRET:
                this.genEtpPersistence.valideGenEtpByIdetap(genEtp.getId(), CODINF_0);
                break;
            case ETPFUS_DIS:
                this.genEtpPersistence.valideGenEtpByIdtfusAndStatut(idtFus, genEtp.getStatut(), CODINF_1);
                break;
            case ETPFUS_FAB:
                Integer codinf = genEtp.getTypetp().equals(GenEtpType.MSP) ? CODINF_8 : CODINF_7;
                this.genEtpPersistence.valideGenEtpByIdtfusAndStatut(idtFus, genEtp.getStatut(), codinf);
                break;
            default:
                break;
        }
    }

    private void handleInvalidateEtape(Integer idEtape, String etpFus, String statut) {
        if (ETPFUS_TIRET.equals(etpFus)) {
            this.genEtpPersistence.invalidateGenEtpByIdEtape(idEtape);
        } else {
            this.genEtpPersistence.invalidateGenEtpByIdEtapeAndStatut(idEtape, statut);
            this.genEtpPersistence.invalidateGenEtpByIdtfusAndStatut(idEtape, statut);
        }
    }

    private void handleSuspendStatut(String statut, GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
        // si l'étape SUSPENDU, je cherche les autres étape SUSPENDU de meme (env, org, app, percod), si non trouvé, je démarre l'app
        if (SUSPENDU.equals(statut) && !genEtpPersistence.isExistEtpSuspendu(genEtpEnvOrgAppPercodQuery)) {
            this.genAppPersistence.startGenApp(genEtpEnvOrgAppPercodQuery);
        }
    }

    private void handleTypEtpDis(GenEtpType typEtp, GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery) {
        // si l'étape DIS, je cherche les autres étape DIS de meme percod(env, org, app, percod) avec statut C V D S, si non trouvé, je valid étape BIL
        if (typEtp.equals(GenEtpType.DIS) && !this.genEtpPersistence.isExistGenEtpTypDisStatCVDS(genEtpEnvOrgAppPercodQuery)) {
            this.genEtpPersistence.valideGenEtpTypBil(genEtpEnvOrgAppPercodQuery);
        }
    }

    private String generateParamsUtilog(GenEtp genEtp) {
        return UtiLogUtil.PARAM_PREFIX_GENETP + genEtp.getId() + UtiLogUtil.PARAM_SEP + genEtp.getIdtfus() + UtiLogUtil.PARAM_SEP + genEtp.getEtpfus() + UtiLogUtil.PARAM_SEP + genEtp.getStatut();
    }

    private UtiLog insertUtilog(String error, String action, GenEtp genEtp, String user, String formid) {
        return this.utiLogService.insertUtilog(error, generateParamsUtilog(genEtp), action, ContextHolder.getContext().getHost(), user, formid);
    }
}