package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.domain.history.model.FindHistoryByQueryDateTime;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistoryRepository extends GenericRepository<HistoryEntity, String> {

    List<HistoryEntity> findAllByOrderByIdAsc();

    List<HistoryEntity> findByCodulo(Integer codulo);

    @Query( " SELECT h " +
            " FROM HistoryEntity h " +
            " WHERE h.insertionDate BETWEEN :#{#query.dtdeb} AND :#{#query.dtfin} " +
            " AND ( (:#{#query.user}) IS NULL OR h.utilisateur = (:#{#query.user}) ) " +
            " AND ( (:#{#query.action}) IS NULL OR h.actionUtilisateur = (:#{#query.action}) ) " +
            " AND ( (:#{#query.entity}) IS NULL OR h.entite = (:#{#query.entity}) ) " +
            " ORDER BY h.insertionDate desc "
    )
    List<HistoryEntity> findHistoryByQuery(@Param("query") FindHistoryByQueryDateTime query);

    @Query( " SELECT DISTINCT(h.utilisateur) as user " +
            " FROM HistoryEntity h" +
            " ORDER BY h.utilisateur ASC "
    )
    List<String> findDistinctUser();

    @Query( " SELECT DISTINCT(h.entite) as entity " +
            " FROM HistoryEntity h" +
            " ORDER BY h.entite ASC "
    )
    List<String> findDistinctEntity();

    @Query(value = "SELECT c37_codlog FROM myslog WHERE d37_create <= :dateLimit ORDER BY d37_create ASC", nativeQuery = true)
    List<Integer> findRowToPurge(@Param("dateLimit") LocalDateTime dateLimit, Pageable pageable);

    @Transactional
    void deleteByIdIn(Iterable<Integer> ids);
}