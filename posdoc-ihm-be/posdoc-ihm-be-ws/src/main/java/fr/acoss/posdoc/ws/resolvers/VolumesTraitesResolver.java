package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.genetp.model.EnvOrgsQuery;
import fr.acoss.posdoc.domain.genetp.model.ResGamSit;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesDTO;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraitesSearchQuery;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class VolumesTraitesResolver extends AbstractQueryResolver {

    private final GenEtpPersistence genEtpPersistence;

    public VolumesTraitesResolver(GenEtpPersistence genEtpPersistence) {
        this.genEtpPersistence = genEtpPersistence;
    }

    public VolumesTraitesDTO getVolumestraites(VolumesTraitesSearchQuery query) {
        return genEtpPersistence.getVolumesTraitesByCriteres(query);
    }

    public List<String> getOrganismesByEnvDate(String env, LocalDateTime fromDate, LocalDateTime toDate) {
        return genEtpPersistence.organismeByEnvInterval(env, fromDate, toDate);
    }

    public List<ResGamSit> getGamSitResByEnvOrgs(EnvOrgsQuery query) {
        return genEtpPersistence.getGamSitResByEnvOrgs(query);
    }

    public List<String> getDistinctEnvsFromGenEtp() {
        return genEtpPersistence.getDistinctEnvs();
    }

    public List<String> getDistinctOrgsFromGenEtp() {
        return genEtpPersistence.getDistinctOrgs();
    }
}
