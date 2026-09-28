package fr.acoss.posdoc.domain.genpro.secondary;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;

import java.util.List;

public interface GenProPersistence {
    void termineGenPro(OccurrenceApplicationInput paramData);

    List<SearchProduitsByFichierPayloadDTO> searchProduitsByFichier(SearchProduitsByFichierInput query);
}
