package fr.acoss.posdoc.domain.tarif.secondary;

import fr.acoss.posdoc.domain.common.search.QueryParameters;
import fr.acoss.posdoc.domain.tarif.model.DeleteTarif;
import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.domain.tarif.model.TarifAlreadyExistsOnPeriodQuery;
import fr.acoss.posdoc.types.Paginated;

import java.util.List;

public interface TarifPersistence {

  Paginated<Tarif> select(QueryParameters queryParameters);

  List<Tarif> selectAll();
  List<Tarif> selectByType(String type);

  Tarif create(Tarif tarif);

  Tarif update(Tarif tarif);

  void deletes(List<DeleteTarif> deleteTarifs);

  boolean exists(String type, String numero);

  String nextNumero(String typeTarif);

  void deleTarifsByTypes(List<String> types);

  Boolean searchIfTarifExistsOnPeriod(TarifAlreadyExistsOnPeriodQuery query);

}
