package fr.acoss.posdoc.domain.notfic.secondary;

import fr.acoss.posdoc.domain.notfic.model.FindNoticeDetailsByFichierPayload;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.NoticeDetailDTO;
import fr.acoss.posdoc.domain.notfic.model.NoticesFichiersDTO;
import fr.acoss.posdoc.domain.notfic.model.SearchNoticesFichiersPayload;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;

import java.util.List;

public interface NotficPersistence {

    List<NotficFichier> findNotficByParam(SearchNotficQuery searchNotficQuery);

    List<NotficFichier> updateNotfic(UpdateNotficsPayload query);

    List<NotficFichier> updateNotfics(List<UpdateNotficsPayload> nofics);

    void deleteNotfic(NotFicCompositeId query);

    void deleteNotfics(List<NotFicCompositeId> notficIds);

    List<NotFic> affectationNotfic(List<NotFic> notFicList);

    List<NoticesFichiersDTO> findNoticesFichiers(SearchNoticesFichiersPayload payload);

    List<NoticeDetailDTO> findNoticeDetailsByFichier(FindNoticeDetailsByFichierPayload payload);
}
