package fr.acoss.posdoc.domain.help.primary;

import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.domain.help.secondary.HelpPersistence;
import fr.acoss.posdoc.domain.utilisateur.secondary.AnaisUserProviderPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.types.HelpStateType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.Month;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HelpServiceTest {

    HelpService helpService;

    @Mock
    HelpPersistence helpPersistence;

    @Mock
    AnaisUserProviderPersistence anaisUserProviderPersistence;

    @BeforeEach
    public void setUp() {
        this.helpService = spy(new HelpService(helpPersistence, anaisUserProviderPersistence, true));

        // Mock getUsersFullNames pour retourner une map avec uid -> uid (comme si l'enrichissement ne changeait rien)
        lenient().when(anaisUserProviderPersistence.getUsersFullNames(any(List.class)))
                .thenAnswer(invocation -> {
                    List<String> uids = invocation.getArgument(0);
                    return uids.stream().collect(Collectors.toMap(uid -> uid, uid -> uid));
                });

        // Mock getUserFullName pour les tests individuels (si besoin)
        lenient().when(anaisUserProviderPersistence.getUserFullName(any(String.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void change_state_from_draft() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        doReturn(helpUpdated).when(this.helpService).enableHelp(any(Integer.class));
        when(this.helpPersistence.selectAll()).thenReturn(List.of(help));

        this.helpService.changeState(2);

        verify(this.helpService, times(1)).enableHelp(any(Integer.class));
    }

    @Test
    void change_state_from_disabled() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DISABLED).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        doReturn(helpUpdated).when(this.helpService).enableHelp(any(Integer.class));
        when(this.helpPersistence.selectAll()).thenReturn(List.of(help));


        this.helpService.changeState(2);

        verify(this.helpService, times(1)).enableHelp(any(Integer.class));
    }

    @Test
    void change_state_from_enabled() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DISABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        doReturn(helpUpdated).when(this.helpService).disableHelp(any(Integer.class));
        when(this.helpPersistence.selectAll()).thenReturn(List.of(help));

        this.helpService.changeState(2);

        verify(this.helpService, times(1)).disableHelp(any(Integer.class));
    }

    @Test
    void enable_help_from_draft() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        when(this.helpPersistence.update(help)).thenReturn(helpUpdated);
        doNothing().when(this.helpService).deleteHelpWithStatePathExeptId(any(HelpStateType.class), any(String.class), any(Integer.class));

        Help result = this.helpService.enableHelp(2);

        verify(this.helpPersistence, times(0)).delete(any(Integer.class));

        assertNotNull(result);
        assertEquals(HelpStateType.ENABLED, result.getState());
        assertEquals(help.getPath(), result.getPath());
    }

    @Test
    void enable_help_from_disable() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DISABLED).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        when(this.helpPersistence.update(help)).thenReturn(helpUpdated);
        doNothing().when(this.helpService).deleteHelpWithStatePathExeptId(any(HelpStateType.class), any(String.class), any(Integer.class));

        Help result = this.helpService.enableHelp(2);

        assertNotNull(result);
        assertEquals(HelpStateType.ENABLED, result.getState());
        assertEquals(help.getPath(), result.getPath());
    }

    @Test
    void enable_help_when_not_exist() {
        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.empty());

        assertThrows(ElementNotFoundException.class, () -> this.helpService.enableHelp(2));
    }

    @Test
    void disable_help_from_enable() {
        Help help = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).build();
        Help helpUpdated = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DISABLED).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(help));
        when(this.helpPersistence.update(help)).thenReturn(helpUpdated);
        doNothing().when(this.helpService).deleteHelpWithStatePathExeptId(any(HelpStateType.class), any(String.class), any(Integer.class));

        Help result = this.helpService.disableHelp(2);

        assertNotNull(result);
        assertEquals(HelpStateType.DISABLED, result.getState());
        assertEquals(help.getPath(), result.getPath());
    }

    @Test
    void disable_help_when_not_exist() {
        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.empty());

        assertThrows(ElementNotFoundException.class, () -> this.helpService.disableHelp(2));
    }

    @Test
    void delete_help_when_exist() {
        when(this.helpPersistence.exists(2)).thenReturn(true);

        assertDoesNotThrow(() -> this.helpService.deleteHelp(2));

        verify(this.helpPersistence, times(1)).delete(2);
    }

    @Test
    void delete_help_when_not_exist() {
        when(this.helpPersistence.exists(2)).thenReturn(false);

        assertThrows(ElementNotFoundException.class, () -> this.helpService.deleteHelp(2));
    }

    @Test
    void create_help() {
        Help helpToSave = Help.builder().path("toto").message("<p>titi</p>").build();
        Help helpSaved = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.create(helpToSave)).thenReturn(helpSaved);
        when(this.helpPersistence.selectAll()).thenReturn(List.of(helpSaved));

        List<Help> result = this.helpService.createHelp(helpToSave);

        assertNotNull(result);
        assertNotNull(result.get(0).getId());
        assertEquals(HelpStateType.DRAFT, result.get(0).getState());
        assertEquals("toto", result.get(0).getPath());
        assertEquals("<p>titi</p>", result.get(0).getMessage());
        assertEquals(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10), result.get(0).getCreatedAt());
    }

    @Test
    void create_help_when_same_path_already_in_draft() {
        Help helpToSave = Help.builder().path("toto").message("<p>titi</p>").build();
        Help helpAlreadyInDB = Help.builder().path("toto").message("<p>titi</p>").build();

        when(this.helpPersistence.selectAllByPathAndState("toto", HelpStateType.DRAFT)).thenReturn(Optional.of(helpAlreadyInDB));

        assertThrows(AlreadyExistingElement.class, () -> this.helpService.createHelp(helpToSave));
    }

    @Test
    void update_draft() {
        Help helpToSave = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();
        Help helpSaved = Help.builder().id(2).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.DECEMBER,25,10,10)).build();

        when(this.helpPersistence.getHelpById(2)).thenReturn(Optional.of(helpToSave));
        when(this.helpPersistence.update(helpToSave)).thenReturn(helpSaved);
        when(this.helpPersistence.selectAll()).thenReturn(List.of(helpSaved));

        List<Help> result = this.helpService.updateHelp(helpToSave);

        assertNotNull(result);
        assertNotNull(result.get(0).getId());
        assertEquals(HelpStateType.DRAFT, result.get(0).getState());
        assertEquals("toto", result.get(0).getPath());
        assertEquals("<p>titi</p>", result.get(0).getMessage());
        assertEquals(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10), result.get(0).getCreatedAt());
        assertEquals(LocalDateTime.of(2050, Month.DECEMBER,25,10,10), result.get(0).getUpdatedAt());
    }

    @Test
    void update_enabled_help() {
        Help helpToUpdate = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();
        Help helpCreated = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.getHelpById(1)).thenReturn(Optional.of(helpToUpdate));
        doReturn(List.of(helpCreated)).when(this.helpService).createHelp(any(Help.class));
        doNothing().when(this.helpService).deleteHelpWithStatePathExeptId(any(HelpStateType.class), any(String.class), any(Integer.class));
        when(this.helpPersistence.selectAll()).thenReturn(List.of(helpCreated));

        List<Help> result = this.helpService.updateHelp(helpToUpdate);

        assertNotNull(result);
        assertNotNull(result.get(0).getId());
        assertEquals(HelpStateType.DRAFT, result.get(0).getState());
        assertEquals("toto", result.get(0).getPath());
        assertEquals("<p>titi</p>", result.get(0).getMessage());
        assertNotNull(result.get(0).getCreatedAt());
    }

    @Test
    void update_disabled_help() {
        Help helpToUpdate = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.DISABLED).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();
        Help helpCreated = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.getHelpById(1)).thenReturn(Optional.of(helpToUpdate));
        doReturn(List.of(helpCreated)).when(this.helpService).createHelp(any(Help.class));
        doNothing().when(this.helpService).deleteHelpWithStatePathExeptId(any(HelpStateType.class), any(String.class), any(Integer.class));
        when(this.helpPersistence.selectAll()).thenReturn(List.of(helpCreated));

        List<Help> result = this.helpService.updateHelp(helpToUpdate);

        assertNotNull(result);
        assertNotNull(result.get(0).getId());
        assertEquals(HelpStateType.DRAFT, result.get(0).getState());
        assertEquals("toto", result.get(0).getPath());
        assertEquals("<p>titi</p>", result.get(0).getMessage());
        assertNotNull(result.get(0).getCreatedAt());
    }

    @Test
    void update_not_existing_help() {
        Help help = Help.builder().id(99).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.getHelpById(99)).thenThrow(new ElementNotFoundException("help", help.getId()));

        assertThrows(ElementNotFoundException.class, () -> this.helpService.updateHelp(help));
    }

    @Test
    void deleteHelpWithStatePathExeptId_no_data_matching() {

        when(this.helpPersistence.selectAllByPathAndState("undefined", HelpStateType.DISABLED)).thenReturn(Optional.empty());

        this.helpService.deleteHelpWithStatePathExeptId(HelpStateType.DISABLED, "undefined", 99);

        verify(this.helpService, times(0)).deleteHelp(any(Integer.class));
    }

    @Test
    void deleteHelpWithStatePathExeptId_data_matching_but_id_different() {
        Help help = Help.builder().id(1).path("/documents/prix").message("<p>titi</p>").state(HelpStateType.DISABLED).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.selectAllByPathAndState("/documents/prix", HelpStateType.DISABLED)).thenReturn(Optional.of(help));
        doNothing().when(this.helpService).deleteHelp(any(Integer.class));

        this.helpService.deleteHelpWithStatePathExeptId(HelpStateType.DISABLED, "/documents/prix", 99);

        verify(this.helpService, times(1)).deleteHelp(any(Integer.class));
    }

    @Test
    void deleteHelpWithStatePathExeptId_data_matching_but_id_matching() {
        Help help = Help.builder().id(1).path("/documents/prix").message("<p>titi</p>").state(HelpStateType.DISABLED).createdAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).updatedAt(LocalDateTime.of(2050, Month.NOVEMBER,25,10,10)).build();

        when(this.helpPersistence.selectAllByPathAndState("/documents/prix", HelpStateType.DISABLED)).thenReturn(Optional.of(help));

        this.helpService.deleteHelpWithStatePathExeptId(HelpStateType.DISABLED, "/documents/prix", 1);

        verify(this.helpService, times(0)).deleteHelp(any(Integer.class));
    }

    @Test
    void get_all_helps() {
        Help help1 = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.DRAFT).createdBy("uid123").updatedBy("uid456").build();
        Help help2 = Help.builder().id(2).path("tata").message("<p>tutu</p>").state(HelpStateType.ENABLED).createdBy("uid789").updatedBy("uid012").build();

        when(this.helpPersistence.selectAll()).thenReturn(List.of(help1, help2));

        List<Help> result = this.helpService.getAllHelps();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("uid123", result.get(0).getCreatedBy());
        assertEquals("uid456", result.get(0).getUpdatedBy());
        assertEquals("uid789", result.get(1).getCreatedBy());
        assertEquals("uid012", result.get(1).getUpdatedBy());
        // Vérifie que getUsersFullNames est appelé 1 fois avec tous les UIDs
        verify(this.anaisUserProviderPersistence, times(1)).getUsersFullNames(any(List.class));
    }

    @Test
    void get_help_by_path() {
        Help help = Help.builder().id(1).path("toto").message("<p>titi</p>").state(HelpStateType.ENABLED).createdBy("uid123").updatedBy("uid456").build();

        when(this.helpPersistence.getHelpByPath("toto")).thenReturn(List.of(help));

        List<Help> result = this.helpService.getHelpByPath("toto");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("uid123", result.get(0).getCreatedBy());
        assertEquals("uid456", result.get(0).getUpdatedBy());
        // Vérifie que getUsersFullNames est appelé 1 fois avec tous les UIDs
        verify(this.anaisUserProviderPersistence, times(1)).getUsersFullNames(any(List.class));
    }
}
