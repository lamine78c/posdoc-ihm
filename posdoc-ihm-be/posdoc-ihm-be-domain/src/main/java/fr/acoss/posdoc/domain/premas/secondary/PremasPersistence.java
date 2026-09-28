package fr.acoss.posdoc.domain.premas.secondary;

import fr.acoss.posdoc.domain.premas.model.DistinctEnvOrgAppModel;
import fr.acoss.posdoc.domain.premas.model.InvalidateMassificationInput;
import fr.acoss.posdoc.domain.premas.model.Premas;
import fr.acoss.posdoc.domain.premas.model.FindPremasQuery;

import java.util.List;

public interface PremasPersistence {
    List<Premas> findPremas(FindPremasQuery query);
    List<DistinctEnvOrgAppModel> getDistinctEnvOrgAppFromPremas();
    List<Premas> invaliderMassifications(List<InvalidateMassificationInput> massifications, FindPremasQuery query);
}
