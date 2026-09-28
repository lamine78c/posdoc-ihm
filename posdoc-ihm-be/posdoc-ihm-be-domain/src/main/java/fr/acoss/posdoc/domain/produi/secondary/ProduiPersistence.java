package fr.acoss.posdoc.domain.produi.secondary;

import fr.acoss.posdoc.domain.produi.model.Produi;
import java.util.List;

public interface ProduiPersistence {

    List<String> gammesExistsInProduits(List<String> gammeCodes);
    boolean exists(Produi product);
    Produi create(Produi product);
    void delete(Produi product);
    Produi update(Produi product);
}
