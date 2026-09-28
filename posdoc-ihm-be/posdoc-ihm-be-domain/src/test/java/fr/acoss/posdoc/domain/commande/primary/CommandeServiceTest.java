package fr.acoss.posdoc.domain.commande.primary;

import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.StileExistingElement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommandeServiceTest {

    private CommandeService commandeService;
    @Mock
    private CommandePersistence commandePersistence;
    @Mock
    private FichierPersistence fichierPersistence;

    @BeforeEach
    public void setUp() {
        commandeService = new CommandeService(commandePersistence, fichierPersistence);
    }

    @Test
    void deleteCommandes_throws_exception_commande_exist() {
        final List<CommandeComposite> cmds = List.of(createCommandeComposite("a", "a", "a", "a"));
        when(fichierPersistence.commandesExistsInFichiers(Mockito.any(List.class))).thenReturn(List.of("a","b"));
        final var exception = assertThrows(
                StileExistingElement.class,
                () -> commandeService.deleteCommandes(cmds));
        assertNotNull(exception.getMessage());
    }

    @Test
    void deleteCommandes_throws_exception_fichier_exist() {
        final List<CommandeComposite> cmds = List.of(createCommandeComposite("a", "a", "a", "a"));
        when(fichierPersistence.commandesExistsInFichiers(Mockito.any(List.class))).thenReturn(List.of());
        when(fichierPersistence.findFichiersByApp(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(List.of(new Fichier()));
        final var exception = assertThrows(
                CustomExceptionMessage.class,
                () -> commandeService.deleteCommandes(cmds));
        assertEquals("Impossible de supprimer les commandes", exception.getMessage());
    }

    @Test
    void getDistincOrg_should_be_ok() {
        List<Commande> cmds = new ArrayList<>();
        cmds.add(createCommande("a", "a", "a", "a"));
        cmds.add(createCommande("b", "b", "b", "b"));
        List<Fichier> fichiers = new ArrayList<>();
        fichiers.add(createFichier("a", "a", "a", "a"));
        fichiers.add(createFichier("a", "a", "a", "c"));
        when(commandePersistence.findCommandbyProp(Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(cmds);
        when(fichierPersistence.findFichierByProp(Mockito.any(), Mockito.any(), Mockito.any(), Mockito.any())).thenReturn(fichiers);
        List<String> result= commandeService.getDistincOrg(List.of("a"), "a", "a", "b");
        assertEquals(List.of("b"), result);
    }

    private Fichier createFichier(String codapp, String codenv, String codcom, String codorg) {
        Fichier fichier = new Fichier();
        fichier.setCodeApp(codapp);
        fichier.setCodeCom(codcom);
        fichier.setCodeOrg(codorg);
        fichier.setCodeEnv(codenv);
        return fichier;
    }
    private Commande createCommande(String codapp, String codenv, String codcom, String codorg) {
        Commande commande = new Commande();
        commande.setCodapp(codapp);
        commande.setCodenv(codenv);
        commande.setCode(codcom);
        commande.setCodorg(codorg);
        return commande;
    }

    private CommandeComposite createCommandeComposite(String codapp, String codenv, String codcom, String codorg) {
        final CommandeComposite commandeComposite= new CommandeComposite();
        commandeComposite.setCode(codcom);
        commandeComposite.setCodapp(codapp);
        commandeComposite.setCodenv(codenv);
        commandeComposite.setCodorg(codorg);
        return commandeComposite;
    }
}
