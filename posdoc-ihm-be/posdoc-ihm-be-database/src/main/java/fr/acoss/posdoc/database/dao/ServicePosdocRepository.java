package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ServicePosdocEntity;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
public interface ServicePosdocRepository extends GenericRepository<ServicePosdocEntity, Integer> {
    @Transactional
    void deleteByIdIn(Iterable<Integer> ids);

    boolean existsByLibelle(String libelle);
}
