package fr.acoss.posdoc.domain.commande.primary;

import fr.acoss.posdoc.domain.commande.model.Commande;
import fr.acoss.posdoc.domain.commande.model.CommandeComposite;
import fr.acoss.posdoc.domain.commande.secondary.CommandePersistence;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CommandeService {

    private final CommandePersistence commandePersistence;
    private final FichierPersistence fichierPersistence;


    public CommandeService(final CommandePersistence commandePersistence, FichierPersistence fichierPersistence) {
        this.commandePersistence = commandePersistence;
        this.fichierPersistence = fichierPersistence;
    }

    public Commande updateCommande(final Commande commande) {
        return commandePersistence.create(commande);
    }

    public List<Commande> createCommandes(List<Commande> commandes) {
        return commandePersistence.updateAll(commandes);
    }

    public void deleteCommandes(List<CommandeComposite> commandeCodes) {
        // vérification dépendance Fichier
        List<String> listFich = fichierPersistence.commandesExistsInFichiers(commandeCodes);
        if (!listFich.isEmpty()) {
            throw new StileExistingElement("Commande", commandeCodes, "Fichiers");
        }

        final int[] num = {0};

        commandeCodes.forEach(id -> {
            // find in commande table
            List<String> codesOrg = new ArrayList<>();
            List<String> codesApp = new ArrayList<>();
            List<String> codesCom = new ArrayList<>();
            codesOrg.add(id.getCodorg());
            codesApp.add(id.getCodapp());
            codesCom.add(id.getCode());
            List<Fichier> fichiers  = fichierPersistence.findFichiersByApp(id.getCodenv(), codesOrg, codesApp, codesCom);
            if (!fichiers.isEmpty()) {
                num[0] = num[0] + 1;
            }

        });
        try {
            if (num[0] == 0) {
                commandePersistence.deleteAll(commandeCodes);
            } else throw new CustomExceptionMessage("Impossible de supprimer les commandes");

        } catch (Exception e) {
            throw new CustomExceptionMessage(e.getMessage());
        }
    }

    public List<String> getDistincOrg(List<String> codeEnv, String codeApp, String codeCom, String codeFic) {

        var commandes = commandePersistence.findCommandbyProp(codeEnv, codeApp, codeCom);
        var fichiers = fichierPersistence.findFichierByProp(codeEnv, codeApp, codeCom, codeFic);

        var res = commandes.stream().filter(c -> fichiers.stream().noneMatch(f ->
                        c.getCodenv().equals(f.getCodeEnv()) && c.getCodapp().equals(f.getCodeApp())
                                && c.getCode().equals(f.getCodeCom()) && c.getCodorg().equals(f.getCodeOrg())))
                .collect(Collectors.toList());

        return res.stream().map(Commande::getCodorg).distinct().filter(e -> !e.equals("999")).collect(Collectors.toList());

    }
}
