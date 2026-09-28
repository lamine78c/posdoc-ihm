package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.genfic.model.GenFic;
import fr.acoss.posdoc.domain.genfic.model.OccurrenceFichierPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.OccurrencesFichiersFiltersInput;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicPayloadDTO;
import fr.acoss.posdoc.domain.genfic.model.SearchOccAppByFicQuery;
import fr.acoss.posdoc.domain.genfic.secondary.GenFicPersistence;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.genpro.secondary.GenProPersistence;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.gentar.secondary.GenTarPersistence;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class OccurrenceFichierResolver extends AbstractQueryResolver {

    private final GenFicPersistence genFicPersistence;
    private final GenProPersistence genProPersistence;
    private final GenTarPersistence genTarPersistence;

    public OccurrenceFichierResolver(GenFicPersistence genFicPersistence, GenProPersistence genProPersistence, GenTarPersistence genTarPersistence) {
        this.genFicPersistence = genFicPersistence;
        this.genProPersistence = genProPersistence;
        this.genTarPersistence = genTarPersistence;
    }

    /**
     * Récupère les occurrences de fichiers en fonction des filtres fournis.
     * Si le nombre de résultats dépasse une taille maximale, un message d'erreur est retourn
     */
    public OccurrenceFichierPayloadDTO getOccurrencesFichiers(OccurrencesFichiersFiltersInput filtersPayload) {
        String errorMessage = genFicPersistence.findOccurrencesFichiersWithMaxSizeCheck(filtersPayload);
        if (!errorMessage.isEmpty()) {
            return new OccurrenceFichierPayloadDTO(new ArrayList<>(), errorMessage);
        }
        List<GenFic> genFics = genFicPersistence.findOccurrencesFichiers(filtersPayload);
        return new OccurrenceFichierPayloadDTO(genFics, null);
    }

    public SearchOccAppByFicPayloadDTO searchOccAppByFic(SearchOccAppByFicQuery query) {
        return genFicPersistence.searchOccAppByFic(query);
    }

    public List<SearchProduitsByFichierPayloadDTO> searchProduitsByFichier(SearchProduitsByFichierInput query) {
        return genProPersistence.searchProduitsByFichier(query);
    }

    public SearchFacturationsByFichierPayloadDTO searchFacturationsByFichier(SearchFacturationsByFichierInput query) {
        return genTarPersistence.searchFacturationsByFichier(query);
    }
}
