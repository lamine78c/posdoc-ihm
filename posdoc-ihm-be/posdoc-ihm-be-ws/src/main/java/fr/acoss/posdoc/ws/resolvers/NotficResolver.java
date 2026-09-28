package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.database.mappers.NotficMapper;
import fr.acoss.posdoc.domain.notfic.model.FindNoticeDetailsByFichierPayload;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.NotFicInput;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.NoticeDetailDTO;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.NoticesFichiersDTO;
import fr.acoss.posdoc.domain.notfic.model.SearchNoticesFichiersPayload;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;
import fr.acoss.posdoc.domain.notfic.secondary.NotficPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NotficResolver extends AbstractResolver {
    private static final NotficMapper MAPPER = NotficMapper.INSTANCE;
    final NotficPersistence notficPersistence;

    public NotficResolver(NotficPersistence notficPersistence) {
        this.notficPersistence = notficPersistence;
    }

    public List<NotficFichier> findNotficByParam(SearchNotficQuery query) {
        return notficPersistence.findNotficByParam(query);
    }

    public List<NotficFichier> updateNotfic(UpdateNotficsPayload query) {
        return notficPersistence.updateNotfic(query);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Notices > Affectation notices", action = Action.UPDATE)
    public List<NotficFichier> updateNotfics(List<UpdateNotficsPayload> notifcs) {
        return notficPersistence.updateNotfics(notifcs);
    }

    public DeletePayloadDTO deleteNotfic(NotFicCompositeId query) {
        notficPersistence.deleteNotfic(query);

        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Notices > Affectation notices", action = Action.DELETE)
    public DeletePayloadDTO deleteNotfics(List<NotFicCompositeId> notficIds) {
        notficPersistence.deleteNotfics(notficIds);

        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Gestion Des Fichiers d'Edition > Notices > Affectation notices", action = Action.CREATE)
    public List<NotFic> affectationNotfic(List<NotFicInput> notFicList) {
        return notficPersistence.affectationNotfic(MAPPER.inputDTOToDomain(notFicList));
    }

    public List<NoticesFichiersDTO> findNoticesFichiers(SearchNoticesFichiersPayload payload) {
        return notficPersistence.findNoticesFichiers(payload);
    }

    public List<NoticeDetailDTO> findNoticeDetailsByFichier(FindNoticeDetailsByFichierPayload payload) {
        return notficPersistence.findNoticeDetailsByFichier(payload);
    }
}
