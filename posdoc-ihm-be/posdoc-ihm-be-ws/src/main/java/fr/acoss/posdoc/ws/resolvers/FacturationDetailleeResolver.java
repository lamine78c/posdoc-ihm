package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumnsDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeWithAllColumnsDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GentarTyptarDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.UpdateConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.primary.FacturationDetailleeService;
import fr.acoss.posdoc.domain.facturationdetaillee.secondary.FacturationDetailleePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FacturationDetailleeResolver extends AbstractResolver {

    private final FacturationDetailleeService facturationDetailleeService;
    private final FacturationDetailleePersistence facturationDetailleePersistence;

    public FacturationDetailleeResolver(FacturationDetailleeService facturationDetailleeService, FacturationDetailleePersistence facturationDetailleePersistence) {
        super();
        this.facturationDetailleeService = facturationDetailleeService;
        this.facturationDetailleePersistence = facturationDetailleePersistence;
    }

    public FacturationDetailleeWithAllColumnsDTO searchFacturationDetaillee(SearchFacturationDetailleeQuery query) {
        return facturationDetailleeService.searchFacturationDetaillee(query);
    }

    public List<GentarTyptarDTO> findTyptarFromGentar() {
        return facturationDetailleePersistence.findTyptarFromGentar().stream()
                .map(GentarTyptarDTO::new)
                .collect(Collectors.toList());
    }

    public ConsolidationFacturationWithAllColumnsDTO searchConsolidationFacturation(SearchConsolidationFacturationQuery query) {
        return facturationDetailleeService.searchConsolidationFacturation(query);
    }

    @Historisable(form = "Exploitation éditique > Consolidation facturation", action = Action.UPDATE)
    public Boolean updateConsolidationFacturation(UpdateConsolidationFacturationQuery query) {
        facturationDetailleeService.updateConsolidationFacturation(query);
        return true;
    }
}
