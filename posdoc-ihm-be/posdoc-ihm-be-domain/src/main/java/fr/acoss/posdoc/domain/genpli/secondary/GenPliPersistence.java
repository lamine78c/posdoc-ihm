package fr.acoss.posdoc.domain.genpli.secondary;

import fr.acoss.posdoc.domain.genpli.model.SearchPliQueryInput;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;

import java.util.List;

public interface GenPliPersistence {
    List<SearchPliResult> searchPliByQuery(SearchPliQueryInput input);

    SuiviAuPliDetailResult searchPliByNumpli(String numpli);
}
