package fr.acoss.posdoc.domain.statut.secondary;

import fr.acoss.posdoc.domain.statut.model.StatutDTO;

import java.util.List;

public interface StatutPersistence {
    List<StatutDTO> findAllStatutOrderByCodeAsc();
}
