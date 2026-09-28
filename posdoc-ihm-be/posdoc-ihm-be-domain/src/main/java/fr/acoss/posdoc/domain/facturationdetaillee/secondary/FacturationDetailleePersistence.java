package fr.acoss.posdoc.domain.facturationdetaillee.secondary;

import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;

import java.util.List;

public interface FacturationDetailleePersistence {

    FacturationDetailleeDTO searchFacturationDetaillee(SearchFacturationDetailleeQuery query);

    List<String> findTyptarFromGentar();

    ConsolidationFacturationDTO searchConsolidationFacturation(SearchConsolidationFacturationQuery query);

    GenTar create(GenTar gentar);

    void updateConsolidationFacturation(GenTar gentar);

    void deleteConsolidationFacturation(GenTar gentar);

    boolean gentarExists(GenTar gentar);

    void recalculatePlific(SearchConsolidationFacturationQuery query);

    void recalculateCout(SearchConsolidationFacturationQuery query);

    void updatePlificForConsolidationFacturation(UpdateConsolidationFacturation consolidation);

    void updateCoutotForConsolidationFacturation(UpdateConsolidationFacturation consolidation);
}
