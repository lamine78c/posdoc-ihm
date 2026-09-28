package fr.acoss.posdoc.domain.environnement.primary;

import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.domain.environnement.model.Environnement;
import fr.acoss.posdoc.domain.environnement.secondary.EnvironnementPersistence;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EnvironnementServiceTest {

  @Mock
  private EnvironnementPersistence environnementPersistence;

  private EnvironnementService environnementService;

  private ApplicationPersistence applicationPersistence;

  @BeforeEach
  public void setUp() {
    environnementService = new EnvironnementService(environnementPersistence, applicationPersistence);
  }

  @Test
  void createEnvironnement_ok() {

    final var environnement = new Environnement("c", "libelle", true);

    when(environnementPersistence.create(environnement))
        .thenReturn(new Environnement("c", "libelle", true));

    final var result = environnementService.createEnvironnement(environnement);

    assertEquals("c", result.getCode());
    assertEquals("libelle", result.getLibelle());
  }

  @Test
  void createEnvironnement_code_more_than_1_char() {

    final var environnement = new Environnement("code", "libelle", true);

    final var invalidStringSizeException = assertThrows(InvalidStringSizeException.class,
        () -> environnementService.createEnvironnement(environnement));

    assertEquals(
        "La taille du champs \"code\" est incorrect (limite : 1 caractère, actuellement : 4 caractères)",
        invalidStringSizeException.getMessage());

  }

  @Test
  void createEnvironnement_code_null() {

    final var environnement = new Environnement(null, "libelle", true);

    final var invalidStringSizeException = assertThrows(InvalidStringSizeException.class,
        () -> environnementService.createEnvironnement(environnement));

    assertEquals(
        "La taille du champs \"code\" est incorrect (limite : 1 caractère, actuellement : null)",
        invalidStringSizeException.getMessage());
  }

  @Test
  void createEnvironnement_libelle_null() {

    final var environnement = new Environnement("c", null, true);

    final var invalidStringBoundsException = assertThrows(InvalidStringBoundsException.class,
        () -> environnementService.createEnvironnement(environnement));

    assertEquals(
        "La taille du champs \"libelle\" est hors borne (min : 0 caractères, max : 50 caractères, actuellement : null)",
        invalidStringBoundsException.getMessage());
  }

  @Test
  void updateEnvironnement() {

    final var environnement = new Environnement("c", "libelle", true);

    when(environnementPersistence.create(environnement))
        .thenReturn(new Environnement("c", "libelle", true));

    when(environnementPersistence.exists("c")).thenReturn(Boolean.TRUE);

    final var result = environnementService.updateEnvironnement(environnement);

    assertEquals("c", result.getCode());
    assertEquals("libelle", result.getLibelle());
  }
}