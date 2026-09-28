package fr.acoss.posdoc.domain.adresseretour.primary;

import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetourComposite;
import fr.acoss.posdoc.domain.adresseretour.secondary.AdresseRetourPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.ArrayList;
import java.util.List;

public class AdresseRetourService {

    private final AdresseRetourPersistence adresseRetourPersistence;

    public AdresseRetourService(final AdresseRetourPersistence adresseRetourPersistence) {
        this.adresseRetourPersistence = adresseRetourPersistence;
    }

    public AdresseRetour updateAdresseRetour(final AdresseRetour adresseRetour) {
        if (!adresseRetourPersistence.exists(adresseRetour.getCode(), adresseRetour.getCodeOrganisme())) {
            throw new ElementNotFoundException("AdresseRetour", adresseRetour.getCode());
        }
        return adresseRetourPersistence.create(adresseRetour);
    }

    public List<AdresseRetour> createAdressesRetour(final List<AdresseRetour> adressesRetour) {
        List<AdresseRetour> adressesAjoutList = new ArrayList<>();
        adressesRetour.stream().forEach(e -> {
            if (!adresseRetourPersistence.exists(e.getCode(), e.getCodeOrganisme())) {
                adressesAjoutList.add(e);
            } else {
                if (adressesRetour.size() == 1) {
                    throw new AlreadyExistingElement("AdresseRetour", e.getCode() + '-' + e.getCodeOrganisme());
                }
            }
        });
        return adresseRetourPersistence.updateAll(adressesAjoutList);
    }

    public void deleteAdressesRetour(final List<AdresseRetourComposite> ids) {
        adresseRetourPersistence.deleteAll(ids);
    }

}
