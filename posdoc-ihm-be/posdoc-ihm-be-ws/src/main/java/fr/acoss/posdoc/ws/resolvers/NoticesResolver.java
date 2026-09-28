package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.notice.model.Base64FileInput;
import fr.acoss.posdoc.domain.notice.model.Notice;
import fr.acoss.posdoc.domain.notice.model.NoticeOccurrenceApplication;
import fr.acoss.posdoc.domain.notice.model.SearchNoticesOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.notice.secondary.NoticePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NoticesResolver extends AbstractResolver {

  final NoticePersistence noticePersistence;

  public NoticesResolver(final NoticePersistence noticePersistence) {
    this.noticePersistence = noticePersistence;
  }

  public List<Notice> allNotices() {
    return noticePersistence.selectAll();
  }


  @Historisable(form = "Gestion Des Fichiers d'Edition > Notices ", action = Action.CREATE)
  public List<Notice> createNotice(Notice noticePayload) {
    return noticePersistence.createNotice(noticePayload);
  }


  @Historisable(form = "Gestion Des Fichiers d'Edition > Notices ", action = Action.UPDATE)
  public List<Notice> updateNotice(Notice noticePayload) {
    return noticePersistence.updateNotice(noticePayload);
  }

  public List<Notice> allActiveNotices() {
    return noticePersistence.getAllActiveNotices();
  }

  public List<Notice> allExpiredNotices() {
    return noticePersistence.getAllExpiredNotices();
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Notices ", action = Action.DELETE)
  public List<Notice> deleteNotice(String codnot) {
    return noticePersistence.deleteNotice(codnot);
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Notices ", action = Action.UPLOAD)
  public List<Notice> uploadNoticePdf(String codnot, Base64FileInput file) {
    return noticePersistence.uploadNoticePdf(codnot, file);
  }

  @Historisable(form = "Gestion Des Fichiers d'Edition > Notices  ", action = Action.DELETE)
  public List<Notice> deleteNoticePdf(String codnot) {
    return noticePersistence.deleteNoticePdf(codnot);
  }

  public String getNoticePdf(String codnot) {
    return noticePersistence.getNoticePdf(codnot);
  }

  public List<NoticeOccurrenceApplication> getNoticesOccurrenceApplication(SearchNoticesOccurrenceApplicationQuery query) {
    return this.noticePersistence.getNoticesOccurrenceApplication(query);
  }
}