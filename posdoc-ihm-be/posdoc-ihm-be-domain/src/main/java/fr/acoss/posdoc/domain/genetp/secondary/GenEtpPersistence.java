package fr.acoss.posdoc.domain.genetp.secondary;

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
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesDTO;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesSearchQuery;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpEnvOrgAppPercodQuery;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpExistsQuery;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;

import java.time.LocalDateTime;
import java.util.List;


public interface GenEtpPersistence {

    VolumesTraitesDTO getVolumesTraitesByCriteres(VolumesTraitesSearchQuery query);

    List<String> organismeByEnvInterval(String env, LocalDateTime fromDate, LocalDateTime toDate);

    List<ResGamSit> getGamSitResByEnvOrgs(EnvOrgsQuery query);

    void termineGenEtp(OccurrenceApplicationInput paramData);

    List<GenEtp> searchOccurrenceEtape(OccurrenceEtapePayload occurrenceEtapePayload);

    List<DistinctCodenvCodorgCodappGenetp> findDistinctCodenvCodorgCodapp();

    List<GenEtp> setNewStatusForListOfGenEtp(List<GenEtpInput> etapes);

    List<OccurrenceEtapeSearchData> getOccurrenceEtapeSearchData();
    List<String> getDistinctGamsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods);
    List<String> getDistinctComsByEnvsAndOrgsAndAppsAndPercods(List<String> codenvs, List<String> codorgs, List<String> codapps, List<String> percods);

    List<VideoStep> getVideoSteps(VideoStepPayload videoStepPayload);

    FirstVideoStep getFirstVideoStep(VideoStepPayload videoStepPayload);

    GenEtp findById(Integer id);

    VideoStepDetailsFichierDTO getVideoStepDetailsFichier(VideoStepDetailsFichierPayload videoStepDetailsFichierPayload);

    void valideGenEtpByIdetap(Integer idEtap, Integer codinf);
    void valideGenEtpByIdtfusAndStatut(Integer idtFus, String statut, Integer codinf);
    boolean isExistEtpSuspendu(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);

    List<GenEtp> loadLiens(Integer idEtape);
    void invalidateGenEtpByIdEtape(Integer idEtape);
    void invalidateGenEtpByIdEtapeAndStatut(Integer idEtape, String statut);
    void invalidateGenEtpByIdtfusAndStatut(Integer idEtape, String statut);
    void termineGenEtpByBonTravail(BonTravailUpdatePayload bonTravailUpdatePayload);
    boolean isExistGenEtpTypDisStatCVDS(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);
    void valideGenEtpTypBil(GenEtpEnvOrgAppPercodQuery genEtpEnvOrgAppPercodQuery);
    List<String> getDistinctOrgs();
    List<String> getDistinctEnvs();
    boolean checkIfGenEtpExists(GenEtpExistsQuery query);
}
