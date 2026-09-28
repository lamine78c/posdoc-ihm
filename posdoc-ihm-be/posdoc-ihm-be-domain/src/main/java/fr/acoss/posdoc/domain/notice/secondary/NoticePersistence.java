package fr.acoss.posdoc.domain.notice.secondary;



import fr.acoss.posdoc.domain.notice.model.Base64FileInput;
import fr.acoss.posdoc.domain.notice.model.Notice;
import fr.acoss.posdoc.domain.notice.model.NoticeOccurrenceApplication;
import fr.acoss.posdoc.domain.notice.model.SearchNoticesOccurrenceApplicationQuery;

import java.util.List;

public interface NoticePersistence {

  List<Notice> selectAll();

  List<Notice> getAllActiveNotices();

  List<Notice> getAllExpiredNotices();

  List<Notice> createNotice(Notice noticePayload);

  List<Notice> updateNotice(Notice noticePayload);

  List<Notice> deleteNotice(String codnot);

  List<Notice> uploadNoticePdf(String codnot, Base64FileInput file);

  List<Notice> deleteNoticePdf(String codnot);

  String getNoticePdf(String codnot);

  List<NoticeOccurrenceApplication> getNoticesOccurrenceApplication(SearchNoticesOccurrenceApplicationQuery query);
}
