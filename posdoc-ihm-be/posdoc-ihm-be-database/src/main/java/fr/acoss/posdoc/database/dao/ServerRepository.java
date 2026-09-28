package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ServerEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ServerRepository extends GenericRepository<ServerEntity, String> {

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);



    @Query(value = "SELECT new ServerEntity(s.code, s.systeme, s.libelle, s.adresseIp, " +
            "s.teste, s.actif, (COUNT(r) > 0)) FROM ServerEntity s " +
            "LEFT JOIN RessourceEntity r ON r.codeServeur = s.code " +
            "GROUP BY s.code ORDER BY s.code ASC")
    List<ServerEntity> findAllByOrderByCodeAsc();
}
