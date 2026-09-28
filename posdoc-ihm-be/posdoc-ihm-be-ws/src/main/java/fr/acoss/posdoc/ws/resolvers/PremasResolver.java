package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import fr.acoss.posdoc.domain.premas.model.Premas;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;
import fr.acoss.posdoc.domain.premas.secondary.PremasPersistence;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class PremasResolver extends AbstractResolver {

    private final PremasPersistence premasPersistence;

    public PremasResolver(final PremasPersistence premasPersistence) {
        this.premasPersistence = premasPersistence;
    }

    public List<Premas> findPremas(FindPremasQuery query) {
        return this.premasPersistence.findPremas(query);
    }

    public List<DistinctEnvOrgAppModel> getDistinctEnvOrgAppFromPremas() {
        return this.premasPersistence.getDistinctEnvOrgAppFromPremas();
    }

    public List<Premas> invaliderMassifications(List<InvalidateMassificationInput> massifications, FindPremasQuery query) {
        return this.premasPersistence.invaliderMassifications(massifications, query);
    }
}
