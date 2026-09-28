package fr.acoss.posdoc.domain.gammes.primary;

import fr.acoss.posdoc.domain.gammes.model.Gamme;
import fr.acoss.posdoc.domain.gammes.secondary.GammePersistence;
import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.InvalidStringSizeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GammeServiceTest {

  @Mock
  private GammePersistence gammePersistence;
  @Mock
  private ProduiPersistence produiPersistence;
  @Mock
  private RessourcePersistence ressourcesPersistence;

  private GammeService gammeService;

  @BeforeEach
  public void setUp() {
    gammeService = new GammeService(gammePersistence, ressourcesPersistence, produiPersistence);
  }

  @Test
  void createGamme_ok() {

    final var gamme = new Gamme("AB", "Libelle", "CODEVERR", false);

    when(gammePersistence.exists("AB")).thenReturn(false);
    when(gammePersistence.create(gamme)).thenReturn(gamme);

    final var result = gammeService.createGamme(gamme);

    assertEquals("AB", result.getCode());
    assertEquals("Libelle", result.getLibelle());
    assertEquals("CODEVERR", result.getCodeVerrou());

    verify(gammePersistence, times(1)).exists("AB");
    verify(gammePersistence, times(1)).create(gamme);
  }

  @Test
  void createGamme_already_exist_element_exception() {

    final var gamme = new Gamme("AB", "Libelle", "CODEVERR", false);

    when(gammePersistence.exists("AB")).thenReturn(true);

    final var exception = assertThrows(AlreadyExistingElement.class,
        () -> gammeService.createGamme(gamme));

    assertEquals("L'élément Gamme (AB) est déjà existant", exception.getMessage());

  }

  @Test
  void createGamme_code_verrou_null_is_ko() {
    final var gamme = new Gamme(null, "Libelle", null, false);
    final var result = assertThrows(InvalidStringSizeException.class,
        () -> gammeService.createGamme(gamme));
    assertEquals(
        "La taille du champs \"code\" est incorrect (limite : 2 caractères, actuellement : null)",
        result.getMessage());
  }

  @Test
  void updateGamme() {

    final var gamme = new Gamme("AB", "Libelle", "CODEVERR", false);

    when(gammePersistence.exists("AB")).thenReturn(Boolean.TRUE);
    when(gammePersistence.create(gamme)).thenReturn(gamme);

    final var result = gammeService.updateGamme(gamme);

    assertEquals("AB", result.getCode());
    assertEquals("Libelle", result.getLibelle());
    assertEquals("CODEVERR", result.getCodeVerrou());

    verify(gammePersistence, times(1)).create(gamme);

  }

  @Test
  void updateGamme_code_invalid_size() {

    final var gamme = new Gamme("A", "Libelle", "CODEVERR", false);

    assertThrows(InvalidStringSizeException.class, () -> gammeService.updateGamme(gamme));

  }

  @Test
  void updateGamme_libelle_invalid_bounds() {

    final var libelle = Stream.generate(() -> "a").limit(51).collect(Collectors.joining());
    final var gamme = new Gamme("AB", libelle, "CODEVERR", false);

    assertThrows(InvalidStringBoundsException.class, () -> gammeService.updateGamme(gamme));
  }

}