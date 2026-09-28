package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ClientEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface ClientRepository extends GenericRepository<ClientEntity, String> {

  @Transactional
  void deleteByCodeIn(Iterable<String> codes);


  @Query(value = "SELECT new ClientEntity(c.code, c.libelle, c.codeAlliage, (COUNT(fich) > 0)) FROM ClientEntity c " +
          "LEFT JOIN FichierEntity fich ON c.code = fich.codeClient " +
          "GROUP BY c.code ORDER BY c.code"
  )
  List<ClientEntity> findAllByOrderByCodeAsc();

}
