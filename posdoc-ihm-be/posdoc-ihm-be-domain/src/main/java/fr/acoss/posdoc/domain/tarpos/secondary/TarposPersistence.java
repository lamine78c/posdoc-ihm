package fr.acoss.posdoc.domain.tarpos.secondary;



import fr.acoss.posdoc.domain.tarpos.model.Tarpos;

import java.util.List;

public interface TarposPersistence {

    List<Tarpos> selectAll();

    List<Tarpos> selectAllWithAuthorisation();

    List<Tarpos> allTarposByPerimetreEqualToZero();

    List<String> getTarifsByCompta();

    Tarpos create(Tarpos tarpos);

    Tarpos update(Tarpos tarpos);

    boolean exists(String code);

    void deleteAll(List<String> tarposTypes);

    void delete(String tarposType);


}
