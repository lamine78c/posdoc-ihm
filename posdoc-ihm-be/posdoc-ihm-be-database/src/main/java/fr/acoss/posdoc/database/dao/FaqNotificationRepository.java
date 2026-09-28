package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.FaqNotificationEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqNotificationRepository extends GenericRepository<FaqNotificationEntity, Integer> {
    @Query("SELECT n FROM FaqNotificationEntity n " +
            "WHERE n.recipientId = :userId " +
            "OR (n.recipientId IS NULL AND :isAdmin = true)")
    List<FaqNotificationEntity> findAllForUser(@Param("userId") String userId, @Param("isAdmin") boolean isAdmin);

    @Modifying
    @Query("DELETE FROM FaqNotificationEntity n WHERE n.faq.id = :faqId")
    void deleteByFaqId(@Param("faqId") Integer faqId);

    List<FaqNotificationEntity> searchByFaqId(Integer faqId);
}
