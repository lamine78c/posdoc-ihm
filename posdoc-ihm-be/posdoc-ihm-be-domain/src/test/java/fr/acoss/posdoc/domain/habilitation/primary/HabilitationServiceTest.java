package fr.acoss.posdoc.domain.habilitation.primary;

import fr.acoss.posdoc.domain.habilitation.model.Habilitation;
import fr.acoss.posdoc.domain.habilitation.secondary.HabilitationPersistence;
import fr.acoss.posdoc.types.HabilitationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HabilitationServiceTest {
    @Mock
    private HabilitationPersistence habilitationPersistence;
    private HabilitationService habilitationService;

    @BeforeEach
    public void setUp() {
        habilitationService = new HabilitationService(habilitationPersistence);
    }

    @Test
    void create_habilitation_ok() {
        Habilitation habilitation = new Habilitation();
        habilitation.setHabilitationType(HabilitationType.MENU);
        habilitation.setIdentite("Test");
        habilitation.setOrdre(10);
        habilitation.setParentId(null);
        List<Habilitation> habilitations = new ArrayList<>();
        habilitations.add(habilitation);
        habilitationService.createHabilitations(habilitations);
        verify(habilitationPersistence).updateAll(habilitations);
    }

    @Test
    void update_habilitation_ok() {
        Habilitation habilitation = new Habilitation();
        habilitation.setId(1);
        habilitation.setHabilitationType(HabilitationType.MENU);
        List<Habilitation> habilitations = new ArrayList<>();
        habilitations.add(habilitation);
        habilitationService.updateHabilitations(habilitations);
        verify(habilitationPersistence).updateAll(habilitations);
    }

    @Test
    void delete_habilitation_ok() {
        List<String> ids = new ArrayList<>();
        ids.add("1");
        ids.add("2");
        habilitationService.deleteHabilitations(ids);
        verify(habilitationPersistence).deleteAll(ids);
    }
}
