package fr.acoss.posdoc.domain.tarpos.primary;

import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.domain.tarif.primary.TarifService;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static fr.acoss.posdoc.domain.tarpos.validators.TarposValidators.*;


public class TarposService {

    private final TarposPersistence tarposPersistence;
    private final TarifPersistence tarifPersistence;

    private static final String TARPOS = "Tarpos";

    public TarposService(TarposPersistence tarposPersistence, TarifPersistence tarifPersistence) {
        this.tarposPersistence = tarposPersistence;
        this.tarifPersistence = tarifPersistence;
    }

    public List<Tarpos> getTarpos() {
        List<Tarpos> tarpos = tarposPersistence.selectAllWithAuthorisation();
        List<Tarif> tarifs = tarifPersistence.selectAll();

        Map<String, List<Tarif>> tarifsParType = tarifs.stream()
                .collect(Collectors.groupingBy(Tarif::getType));

        tarpos.forEach(tarpo -> {
            List<Tarif> tarifsByTarpos = tarifsParType.getOrDefault(tarpo.getType(), new ArrayList<>());
            tarpo.setTarifs(tarifsByTarpos);
        });

        return tarpos;
    }

    public List<Tarpos> getTarposByPerimetreEqualToZero() {
        return tarposPersistence.allTarposByPerimetreEqualToZero();
    }

    public Tarpos createTarpos(final Tarpos tarpos) {
        typeValidator().validate(tarpos.getType());
        libelleValidator().validate(tarpos.getLibelle());
        ordreValidator().validate(tarpos.getOrdre());

        if (tarposPersistence.exists(tarpos.getType())) {
            throw new AlreadyExistingElement(TARPOS, tarpos.getType());
        }

        return tarposPersistence.create(tarpos);
    }

    public Tarpos updateTarpos(final Tarpos tarpos) {
        typeValidator().validate(tarpos.getType());
        libelleValidator().validate(tarpos.getLibelle());
        ordreValidator().validate(tarpos.getOrdre());

        if (!tarposPersistence.exists(tarpos.getType())) {
            throw new ElementNotFoundException(TARPOS, tarpos.getType());
        }

        return tarposPersistence.update(tarpos);
    }

    public void deleteTarpos(List<String> tarposTypes) {
        tarifPersistence.deleTarifsByTypes(tarposTypes);
        tarposPersistence.deleteAll(tarposTypes);
    }

}
