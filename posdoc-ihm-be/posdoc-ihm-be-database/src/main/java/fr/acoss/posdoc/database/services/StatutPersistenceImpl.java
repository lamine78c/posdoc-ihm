package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.StatutRepository;
import fr.acoss.posdoc.domain.statut.model.StatutDTO;
import fr.acoss.posdoc.domain.statut.secondary.StatutPersistence;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatutPersistenceImpl implements StatutPersistence {

    private final StatutRepository statutRepository;

    public StatutPersistenceImpl(StatutRepository statutRepository) {
        this.statutRepository = statutRepository;
    }

    @Override
    public List<StatutDTO> findAllStatutOrderByCodeAsc() {
        return statutRepository.findAllStatutOrderByCodeAsc().stream()
                .map(statut -> new StatutDTO(statut.getCode(), statut.getLibelle()))
                .collect(Collectors.toList());
    }
}