package fr.acoss.posdoc.domain.adresseretour.secondary;

import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetourComposite;
import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface AdresseRetourPersistence {

    Paginated<AdresseRetour> select(QueryParameters queryParameters);

    List<AdresseRetour> selectAll();

    AdresseRetour create(AdresseRetour adresseRetour);

    AdresseRetour update(AdresseRetour adresseRetour);

    void delete(String type, String numero);

    boolean exists(String type, String numero);

    List<AdresseRetour> updateAll(List<AdresseRetour> adressesRetour);

    void deleteAll(Iterable<AdresseRetourComposite> ids);

}
