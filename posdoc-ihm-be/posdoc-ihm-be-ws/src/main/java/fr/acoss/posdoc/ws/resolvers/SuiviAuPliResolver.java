package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.genpli.model.SearchPliQueryInput;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;
import fr.acoss.posdoc.domain.genpli.secondary.GenPliPersistence;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SuiviAuPliResolver extends AbstractQueryResolver {

    private final GenPliPersistence genPliPersistence;

    public SuiviAuPliResolver(final GenPliPersistence genPliPersistence) {
        this.genPliPersistence = genPliPersistence;
    }

    public List<SearchPliResult> searchPliByQuery(SearchPliQueryInput input) {
        return genPliPersistence.searchPliByQuery(input);
    }

    public SuiviAuPliDetailResult searchPliByNumpli(String numpli) {
        return genPliPersistence.searchPliByNumpli(numpli);
    }
}
