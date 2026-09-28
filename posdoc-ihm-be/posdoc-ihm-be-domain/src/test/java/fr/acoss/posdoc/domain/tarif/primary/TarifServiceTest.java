package fr.acoss.posdoc.domain.tarif.primary;

import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.exceptions.InvalidStartAndCloseDateException;
import fr.acoss.posdoc.exceptions.NegativeValueForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TarifServiceTest {

  @Mock
  private TarifPersistence tarifPersistence;

  private TarifService tarifService;

  @BeforeEach
  public void setUp() {
    tarifService = new TarifService(tarifPersistence);
  }

  @Test
  void createTarif_ok() {

    when(tarifPersistence.nextNumero("AB")).thenReturn("0000");
    when(tarifPersistence.create(any(Tarif.class))).thenReturn(new Tarif("AB",
        "0000",
        LocalDate.of(2020, 2, 3),
        LocalDate.of(2020, 2, 7),
        750.0,
        false));

    final var tarif = new Tarif("AB",
        null,
        LocalDate.of(2020, 2, 3),
        LocalDate.of(2020, 2, 7),
        0.750,
        false);

    final var newTarif = tarifService.createTarif(tarif);

    assertEquals("AB", newTarif.getType());
    assertEquals("0000", newTarif.getNumero());
    assertEquals(LocalDate.of(2020, 2, 3), newTarif.getDateDebut());
    assertEquals(LocalDate.of(2020, 2, 7), newTarif.getDateFin());
    assertEquals(750.0, newTarif.getCoutPli());
    assertEquals(false, newTarif.getUrgent());

  }

  @Test
  void createTarif_ko_negative_coutpli() {

    final var tarif = new Tarif("AB",
        null,
        LocalDate.of(2020, 2, 3),
        LocalDate.of(2020, 2, 7),
        -0.750,
        false);

    final var negativeValueForbiddenException = assertThrows(NegativeValueForbiddenException.class,
        () -> tarifService.createTarif(tarif));

    assertEquals("Le champs \"coutPli\" doit être positif",
        negativeValueForbiddenException.getMessage());
  }

  @Test
  void createTarif_ko_invalidstartandclosedateexception() {

    final var tarif = new Tarif("AB",
        null,
        LocalDate.of(2020, 2, 7),
        LocalDate.of(2020, 2, 3),
        0.750,
        false);

    final var invalidStartAndCloseDateException = assertThrows(InvalidStartAndCloseDateException.class,
        () -> tarifService.createTarif(tarif));

    assertEquals(
        "La date de début doit être avant la date de fin (actuellement : start=2020-02-07 & fin=2020-02-03)",
        invalidStartAndCloseDateException.getMessage());
  }

}