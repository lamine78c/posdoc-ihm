package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.UtilisateurEntity;
import org.springframework.stereotype.Repository;



@Repository
public interface UtilisateurRepository extends GenericRepository <UtilisateurEntity, String> {
    void deleteByCodeUtilisateurIn(Iterable<String> codes);
}
