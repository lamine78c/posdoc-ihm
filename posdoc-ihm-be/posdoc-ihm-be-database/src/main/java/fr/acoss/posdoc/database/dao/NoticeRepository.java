package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.NoticeEntity;
import fr.acoss.posdoc.domain.notice.model.SearchNoticesOccurrenceApplicationQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface NoticeRepository extends GenericRepository<NoticeEntity, String> {

    String SELECT_FROM_NOTICE = "SELECT n.codnot as codnot, n.libnot as libnot, n.fornot as fornot, " +
            "CAST(n.poinot as string) as poinot, CAST(n.pornot as string) as pornot, CAST(n.dnotir as string) as dnotir, " +
            "CAST(n.perime as string) as perime, n.codsit as codsit, " +
            "CAST(COUNT(notfic) as string) as isNotAuthorisedToBeDeleted, " +
            "np.pdfFilePath as pdfFilePath " +
            "FROM NoticeEntity n " +
            "LEFT JOIN NotficEntity notfic ON n.codnot = notfic.id.codnot " +
            "LEFT JOIN NoticePdfEntity np ON n.codnot = np.codnot ";

    String GROUP_AND_ORDER_BY = "GROUP BY codnot, np.pdfFilePath ORDER BY n.codnot";

    @Query(SELECT_FROM_NOTICE + "WHERE n.perime = 0 " + GROUP_AND_ORDER_BY)
    List<Map<String, String>> findAllActivNotices();

    @Query(SELECT_FROM_NOTICE + "WHERE n.perime = 1 " + GROUP_AND_ORDER_BY)
    List<Map<String, String>> findAllExpiredNotices();

    @Query("SELECT COUNT(n) > 0 FROM NotficEntity n WHERE n.id.codnot = :codnot")
    boolean isNoticeUsedInNotific(@Param("codnot") String codnot);

    @Query("SELECT gn.id.codnot as codnot, CAST(gn.poinot as string) as poinot, n.fornot as fornot, " +
            "   CAST(n.pornot as string) as pornot, n.libnot as libnot, n.codsit as codsit " +
            "FROM NoticeEntity n " +
            "INNER JOIN GenNotEntity gn ON n.codnot = gn.id.codnot " +
            "WHERE gn.id.codenv = :#{#query.codenv} AND gn.id.codorg = :#{#query.codorg} " +
            "   AND gn.id.codapp = :#{#query.codapp} AND gn.id.percod = :#{#query.percod} " +
            "   AND gn.id.codcom = :#{#query.codcom} AND gn.id.codfic = :#{#query.codfic} " +
            "   AND gn.id.numcom = :#{#query.numcom} " +
            "ORDER BY codnot")
    List<Map<String, String>> getNoticesOccurrenceApplication(@Param("query") SearchNoticesOccurrenceApplicationQuery query);

}

