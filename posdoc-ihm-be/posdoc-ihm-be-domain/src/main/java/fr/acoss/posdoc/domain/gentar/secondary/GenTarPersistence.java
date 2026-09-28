package fr.acoss.posdoc.domain.gentar.secondary;

import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierPayloadDTO;

public interface GenTarPersistence {
    SearchFacturationsByFichierPayloadDTO searchFacturationsByFichier(SearchFacturationsByFichierInput query);
}
