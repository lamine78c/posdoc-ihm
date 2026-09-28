package fr.acoss.posdoc.domain.help.primary;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.help.model.Help;
import fr.acoss.posdoc.domain.help.secondary.HelpPersistence;
import fr.acoss.posdoc.domain.utilisateur.secondary.AnaisUserProviderPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.types.HelpStateType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

public class HelpService {

    private static final String HELP = "Help";

    private final HelpPersistence helpPersistence;
    private final AnaisUserProviderPersistence anaisUserProviderPersistence;
    private final boolean enrichUserNamesEnabled;

    public HelpService(final HelpPersistence helpPersistence, final AnaisUserProviderPersistence anaisUserProviderPersistence, final boolean enrichUserNamesEnabled) {
        this.helpPersistence = helpPersistence;
        this.anaisUserProviderPersistence = anaisUserProviderPersistence;
        this.enrichUserNamesEnabled = enrichUserNamesEnabled;
    }

    public void deleteHelpWithStatePathExeptId(HelpStateType helpStateType, String path, Integer id) {
        Optional<Help> helpList = this.helpPersistence.selectAllByPathAndState(path, helpStateType);
        helpList.ifPresent(help -> {
            if (!Objects.equals(help.getId(), id)) {
                this.deleteHelp(help.getId());
            }
        });
    }

    public List<Help> changeState(Integer id) {
        Help helpToChangeState = this.helpPersistence.getHelpById(id).orElseThrow(() -> new ElementNotFoundException(HELP, id));

        if (helpToChangeState.getState().equals(HelpStateType.ENABLED)) {
            disableHelp(id);
        } else if (helpToChangeState.getState().equals(HelpStateType.DISABLED) || helpToChangeState.getState().equals(HelpStateType.DRAFT)) {
            enableHelp(id);
        }

        return enrichUserNamesIfEnabled(this.helpPersistence.selectAll());
    }

    public Help enableHelp(Integer id) {
        Context context = ContextHolder.getContext();
        Help helpToEnable = this.helpPersistence.getHelpById(id).orElseThrow(() -> new ElementNotFoundException(HELP, id));

        // Supprime ceux avec le même path qui sont en enable et disable (exepter l'id courant)
        this.deleteHelpWithStatePathExeptId(HelpStateType.ENABLED, helpToEnable.getPath(), helpToEnable.getId());
        this.deleteHelpWithStatePathExeptId(HelpStateType.DISABLED, helpToEnable.getPath(), helpToEnable.getId());

        helpToEnable.setState(HelpStateType.ENABLED);
        helpToEnable.setUpdatedAt(LocalDateTime.now());
        helpToEnable.setUpdatedBy(context.getUser());

        return this.helpPersistence.update(helpToEnable);
    }

    public Help disableHelp(Integer id) {
        Context context = ContextHolder.getContext();
        Help helpToDisable = this.helpPersistence.getHelpById(id).orElseThrow(() -> new ElementNotFoundException(HELP, id));

        // Dans le cas ou on aurait un manque de coherence en base on supprime ceux en disable
        this.deleteHelpWithStatePathExeptId(HelpStateType.DISABLED, helpToDisable.getPath(), helpToDisable.getId());

        helpToDisable.setState(HelpStateType.DISABLED);
        helpToDisable.setUpdatedAt(LocalDateTime.now());
        helpToDisable.setUpdatedBy(context.getUser());

        return this.helpPersistence.update(helpToDisable);
    }

    public void deleteHelp(Integer id) {
        if (!this.helpPersistence.exists(id)) {
            throw new ElementNotFoundException(HELP, id);
        }
        this.helpPersistence.delete(id);
    }

    public List<Help> updateHelp(Help help) {
        Context context = ContextHolder.getContext();
        Help helpToUpdate = this.helpPersistence.getHelpById(help.getId()).orElseThrow(() -> new ElementNotFoundException(HELP, help.getId()));

        // Dans le cas ou on update une aide publié on créer simplement une autre aide en brouillon
        if (helpToUpdate.getState().equals(HelpStateType.ENABLED) || helpToUpdate.getState().equals(HelpStateType.DISABLED)) {

            // Supprime l'aide en draft avec le meme path avant d'insérer la copie
            deleteHelpWithStatePathExeptId(HelpStateType.DRAFT, helpToUpdate.getPath(), helpToUpdate.getId());

            Help helpToCreateDraft = Help.builder().path(helpToUpdate.getPath()).message(help.getMessage()).state(HelpStateType.DRAFT).build();
            this.createHelp(helpToCreateDraft);

            return enrichUserNamesIfEnabled(this.helpPersistence.selectAll());

            // Dans le cas ou l'aide n'est pas publié on update simplement l'aide existante
        } else {
            helpToUpdate.setMessage(help.getMessage());
            helpToUpdate.setUpdatedAt(LocalDateTime.now());
            helpToUpdate.setUpdatedBy(context.getUser());
            this.helpPersistence.update(helpToUpdate);

            return enrichUserNamesIfEnabled(this.helpPersistence.selectAll());
        }
    }

    public List<Help> createHelp(Help help) {
        Context context = ContextHolder.getContext();
        Optional<Help> helpDraft = this.helpPersistence.selectAllByPathAndState(help.getPath(), HelpStateType.DRAFT);

        if (helpDraft.isPresent()) {
            throw new AlreadyExistingElement(HELP, helpDraft.get().getPath());
        }

        help.setState(HelpStateType.DRAFT);
        help.setCreatedAt(LocalDateTime.now());
        help.setUpdatedAt(LocalDateTime.now());
        help.setCreatedBy(context.getUser());
        help.setUpdatedBy(context.getUser());
        this.helpPersistence.create(help);

        return enrichUserNamesIfEnabled(this.helpPersistence.selectAll());
    }

    public List<Help> getAllHelps() {
        return enrichUserNamesIfEnabled(this.helpPersistence.selectAll());
    }

    public List<Help> getHelpByPath(String path) {
        return enrichUserNamesIfEnabled(this.helpPersistence.getHelpByPath(path));
    }

    /**
     * Enrichit conditionnellement les noms d'utilisateurs selon la configuration
     */
    private List<Help> enrichUserNamesIfEnabled(List<Help> helps) {
        if (enrichUserNamesEnabled) {
            return enrichUserNames(helps);
        }
        return helps;
    }

    /**
     * Enrichit les champs createdBy et updatedBy avec les noms complets des utilisateurs depuis Anais
     * Utilise un appel batch unique pour optimiser les performances
     */
    private List<Help> enrichUserNames(List<Help> helps) {
        if (helps == null || helps.isEmpty()) {
            return helps;
        }

        // Collecter tous les UIDs uniques (createdBy et updatedBy)
        List<String> allUids = new ArrayList<>();
        helps.forEach(help -> {
            if (help.getCreatedBy() != null) {
                allUids.add(help.getCreatedBy());
            }
            if (help.getUpdatedBy() != null) {
                allUids.add(help.getUpdatedBy());
            }
        });

        // Si pas d'UIDs, retourner tel quel
        if (allUids.isEmpty()) {
            return helps;
        }

        // Récupérer tous les noms en un seul appel batch
        Map<String, String> uidToFullName = anaisUserProviderPersistence.getUsersFullNames(allUids);

        // Enrichir chaque Help avec les noms récupérés
        helps.forEach(help -> {
            if (help.getCreatedBy() != null) {
                help.setCreatedBy(uidToFullName.getOrDefault(help.getCreatedBy(), help.getCreatedBy()));
            }
            if (help.getUpdatedBy() != null) {
                help.setUpdatedBy(uidToFullName.getOrDefault(help.getUpdatedBy(), help.getUpdatedBy()));
            }
        });

        return helps;
    }
}
