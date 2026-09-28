package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.genapp.model.DetailsPeriode;
import fr.acoss.posdoc.domain.genapp.model.DetailsPeriodeInput;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GenAppResolver extends AbstractQueryResolver {

    private final GenAppPersistence genAppPersistence;

    public GenAppResolver(GenAppPersistence genAppPersistence) {
        this.genAppPersistence = genAppPersistence;
    }

    public List<EnvOrgApp> getDistinctEnvOrgAppFromGenapp() {
        return this.genAppPersistence.getDistinctEnvOrgApp();
    }

    public List<DetailsPeriode> getDetailsPeriodeFromGenApp(DetailsPeriodeInput paramData) {
        return this.genAppPersistence.getDetailsPeriode(paramData);
    }
}
