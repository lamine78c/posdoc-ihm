package fr.acoss.posdoc.domain.informationorganisme.primary;

import fr.acoss.posdoc.domain.informationorganisme.model.InformationOrganisme;
import fr.acoss.posdoc.domain.informationorganisme.secondary.InformationOrganismePersistence;
import fr.acoss.posdoc.domain.organisme.model.Organisme;
import fr.acoss.posdoc.domain.organisme.secondary.OrganismePersistence;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.InvalidStringBoundsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InformationOrganismeServiceTest {

  @Mock
  private InformationOrganismePersistence informationOrganismePersistence;

  @Mock
  private OrganismePersistence organismePersistence;

  private InformationOrganismeService informationOrganismeService;

  @BeforeEach
  public void setUp() {

    informationOrganismeService = new InformationOrganismeService(informationOrganismePersistence,
        organismePersistence);
  }

  public InformationOrganisme createInformationOrganisme(final String organismeId) {

    final var informationOrganisme = new InformationOrganisme();
    informationOrganisme.setActif(Boolean.TRUE);
    informationOrganisme.setMessage("Message");
    informationOrganisme.setDate(null);

    final var organisme = new Organisme();
    organisme.setCode(organismeId);

    informationOrganisme.setOrganisme(organisme);

    return informationOrganisme;
  }

  @Test
  void createInformationOrganisme_ok() {

    //Stubbing
    when(informationOrganismePersistence.create(any()))
        .thenReturn(new ArrayList<>());
    when(organismePersistence.exists(any(String.class))).thenReturn(true);

    final List<InformationOrganisme> list = new ArrayList<>();
    list.add(createInformationOrganisme("1"));
    list.add(createInformationOrganisme("2"));
    list.add(createInformationOrganisme("3"));

    final var informationOrganismeResults = informationOrganismeService.createInformationOrganisme(
        list);

    verify(organismePersistence, times(3)).exists(any(String.class));
    verify(informationOrganismePersistence, times(1)).create(any());

    for (final InformationOrganisme info : informationOrganismeResults) {
      assertNotNull(info.getDate());
    }
  }

  @Test
  void createInformationOrganisme_message_null_or_empty() {

    final var informationOrganisme = createInformationOrganisme("1");
    informationOrganisme.setMessage(null);

    final List<InformationOrganisme> list = new ArrayList<>();
    list.add(informationOrganisme);
    list.add(createInformationOrganisme("2"));
    list.add(createInformationOrganisme("3"));

    final var invalidStringSizeException = assertThrows(InvalidStringBoundsException.class,
        () -> informationOrganismeService.createInformationOrganisme(list));

    assertEquals(
        "La taille du champs \"message\" est hors borne (min : 0 caractères, max : 250 caractères, actuellement : null)",
        invalidStringSizeException.getMessage());

    informationOrganisme.setMessage("");

    final var invalidStringSizeException2 = assertThrows(InvalidStringBoundsException.class,
        () -> informationOrganismeService.createInformationOrganisme(list));

    assertEquals(
        "La taille du champs \"message\" est hors borne (min : 0 caractères, max : 250 caractères, actuellement : 0 caractères)",
        invalidStringSizeException2.getMessage());

  }

  @Test
  void createInformationOrganisme_organisme_not_found() {

    when(organismePersistence.exists("1")).thenReturn(false);

    final List<InformationOrganisme> list = new ArrayList<>();
    list.add(createInformationOrganisme("1"));
    list.add(createInformationOrganisme("2"));
    list.add(createInformationOrganisme("3"));

    final var organismeNotFoundException = assertThrows(ElementNotFoundException.class, () ->
      informationOrganismeService.createInformationOrganisme(list)
    );

    assertEquals("L'élément Organisme (1) n'existe pas", organismeNotFoundException.getMessage());

  }

  @Test
  void updateInformationOrganisme_message_null_or_empty() {

    final var informationOrganisme = new InformationOrganisme(1, null, null, Boolean.TRUE, null);

    final var invalidStringSizeException = assertThrows(InvalidStringBoundsException.class,
        () -> informationOrganismeService.updateInformationOrganisme(informationOrganisme));

    assertEquals(
        "La taille du champs \"message\" est hors borne (min : 0 caractères, max : 250 caractères, actuellement : null)",
        invalidStringSizeException.getMessage());

    final var informationOrganisme2 = new InformationOrganisme(1, null, "", Boolean.TRUE, null);

    final var invalidStringSizeException2 = assertThrows(InvalidStringBoundsException.class,
        () -> informationOrganismeService.updateInformationOrganisme(informationOrganisme2));

    assertEquals(
        "La taille du champs \"message\" est hors borne (min : 0 caractères, max : 250 caractères, actuellement : 0 caractères)",
        invalidStringSizeException2.getMessage());
  }

}