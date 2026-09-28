package fr.acoss.posdoc.domain.tarif.primary;

import fr.acoss.posdoc.domain.tarif.model.DeleteTarif;
import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.domain.tarif.model.TarifAlreadyExistsOnPeriodQuery;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingForPeriodException;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.InvalidStartAndCloseDateException;

import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNull;
import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.tarif.validators.TarifValidators.coutPliValidator;
import static fr.acoss.posdoc.domain.tarif.validators.TarifValidators.numeroValidator;
import static fr.acoss.posdoc.domain.tarif.validators.TarifValidators.typeValidator;

public class TarifService {

  private final TarifPersistence tarifPersistence;

  public TarifService(final TarifPersistence tarifPersistence) {
    this.tarifPersistence = tarifPersistence;
  }

  public Tarif createTarif(final Tarif tarif) {

    typeValidator().validate(tarif.getType());
    coutPliValidator().validate(tarif.getCoutPli());

    objectNotNullOrThrow("dateDebut").validate(tarif.getDateDebut());

    //Vérification dateFin > dateDebut
    if (objectNotNull().validate(tarif.getDateFin()) && tarif.getDateDebut().isAfter(tarif
        .getDateFin())) {
      throw new InvalidStartAndCloseDateException(tarif.getDateDebut(), tarif.getDateFin());
    }

    TarifAlreadyExistsOnPeriodQuery query = this.getTarifAlreadyExistsOnPeriodQuery(tarif);
    if (Boolean.TRUE.equals(tarifPersistence.searchIfTarifExistsOnPeriod(query))) {
      throw new AlreadyExistingForPeriodException();
    }

    //Demande d'un nouveau numéro
    tarif.setNumero(tarifPersistence.nextNumero(tarif.getType()));

    return tarifPersistence.create(tarif);
  }

  public Tarif updateTarif(final Tarif tarif) {

    typeValidator().validate(tarif.getType());
    numeroValidator().validate(tarif.getNumero());
    coutPliValidator().validate(tarif.getCoutPli());

    objectNotNullOrThrow("dateDebut");

    //Vérification dateFin > dateDebut
    if (objectNotNull().validate(tarif.getDateFin()) && tarif.getDateDebut().isAfter(tarif
        .getDateFin())) {
      throw new InvalidStartAndCloseDateException(tarif.getDateDebut(), tarif.getDateFin());
    }

    if (!tarifPersistence.exists(tarif.getType(), tarif.getNumero())) {
      throw new ElementNotFoundException("Tarif", tarif.getType());
    }

    TarifAlreadyExistsOnPeriodQuery query = this.getTarifAlreadyExistsOnPeriodQuery(tarif);
    if (Boolean.TRUE.equals(tarifPersistence.searchIfTarifExistsOnPeriod(query))) {
      throw new AlreadyExistingForPeriodException();
    }

    return tarifPersistence.create(tarif);
  }

  public void deleteTarifs(List<DeleteTarif> deleteTarifs) {
    tarifPersistence.deletes(deleteTarifs);
  }

  private TarifAlreadyExistsOnPeriodQuery getTarifAlreadyExistsOnPeriodQuery(Tarif tarif) {
    TarifAlreadyExistsOnPeriodQuery query = new TarifAlreadyExistsOnPeriodQuery();
    query.setStartDate(tarif.getDateDebut());
    query.setEndDate(tarif.getDateFin());
    query.setTyptar(tarif.getType());
    query.setNumtar(tarif.getNumero());
    return query;
  }

}
