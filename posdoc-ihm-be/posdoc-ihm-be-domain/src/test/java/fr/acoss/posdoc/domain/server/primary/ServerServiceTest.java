package fr.acoss.posdoc.domain.server.primary;

import fr.acoss.posdoc.domain.ressource.secondary.RessourcePersistence;
import fr.acoss.posdoc.domain.server.model.Server;
import fr.acoss.posdoc.domain.server.secondary.ServerPersistence;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import fr.acoss.posdoc.exceptions.NullFieldException;
import fr.acoss.posdoc.types.Systeme;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServerServiceTest {

  @Mock
  private ServerPersistence serverPersistence;

  @Mock
  private RessourcePersistence ressourcePersistence;

  private ServerService serverService;

  @BeforeEach
  public void setUp() {
    serverService = new ServerService(serverPersistence, ressourcePersistence);
  }

  @Test
  void createServer_ok() {

    final var server = new Server("code", Systeme.LINUX, "Libelle", "Adresse IP", true, true, false);

    when(serverPersistence.create(server)).thenReturn(server);

    when(serverPersistence.exists(anyString())).thenReturn(Boolean.FALSE);

    final var result = serverService.createServer(server);
    assertEquals("code", result.getCode());
    assertEquals(Systeme.LINUX, result.getSysteme());
    assertEquals("Libelle", result.getLibelle());
    assertEquals("Adresse IP", result.getAdresseIp());
    assertEquals(true, result.getTeste());
    assertEquals(true, result.getActif());

  }

  @Test
  void createServer_adresse_ip_null_ok() {

    final var server = new Server("code", Systeme.LINUX, "Libelle", "Adresse IP", true, true, false);

    when(serverPersistence.create(server)).thenReturn(server);
    when(serverPersistence.exists(anyString())).thenReturn(Boolean.FALSE);

    final var result = serverService.createServer(server);

    assertEquals("code", result.getCode());
    assertEquals(Systeme.LINUX, result.getSysteme());
    assertEquals("Libelle", result.getLibelle());
    assertEquals("Adresse IP", result.getAdresseIp());
    assertEquals(true, result.getTeste());
    assertEquals(true, result.getActif());

  }

  @Test
  void createServer_adresse_ip_more_than_32_char_throws_exception() {

    final var adresseIp = Stream.generate(() -> "a").limit(33).collect(Collectors.joining());
    final var server = new Server("code", Systeme.LINUX, "Libelle", adresseIp, true, true, false);

    final var invalidStringBoundsException = assertThrows(
        InvalidStringBoundsException.class,
        () -> serverService.createServer(server));

    assertEquals(
        "La taille du champs \"adresse IP\" est hors borne (min : 1 caractère, max : 32 caractères, actuellement : 33 caractères)",
        invalidStringBoundsException.getMessage());

  }

  @Test
  void createServer_system_null_throws_exception() {

    final var server = new Server("code", null, "Libelle", "Adress IP", true, true, false);
    final var nullFieldException = assertThrows(
        NullFieldException.class,
        () -> serverService.createServer(server));

    assertEquals("Le champs \"systeme\" ne doit pas être null", nullFieldException.getMessage());

  }

  @Test
  void updateServer_ok() {

    final var server = new Server("code", Systeme.LINUX, "Libelle", "Adresse IP", true, true, false);

    when(serverPersistence.exists("code")).thenReturn(Boolean.TRUE);
    when(serverPersistence.create(any(Server.class))).thenReturn(server);

    final var result = serverService.updateServer(server);
    assertEquals("code", result.getCode());
  }

  @Test
  void updateServer_code_null_throws_exception() {

    final var server = new Server(null, Systeme.WINDOWS, "libelle", "adresseIp", true, true, false);
    final var invalidStringBoundsException = assertThrows(
        InvalidStringBoundsException.class,
        () -> serverService.updateServer(server));

    assertEquals(
        "La taille du champs \"ID serveur\" est hors borne (min : 1 caractère, max : 8 caractères, actuellement : null)",
        invalidStringBoundsException.getMessage());

  }

}