package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.DeleteMassificationAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import fr.acoss.posdoc.types.Parametre;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeleteMassificationAdelaideServiceImpl extends AbstractAdelaideServiceImpl<AdelaideResult> implements DeleteMassificationAdelaideService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeleteMassificationAdelaideServiceImpl.class);
    private final UtiLogService utiLogService;
    private final ParametrePersistence parametrePersistence;

    public DeleteMassificationAdelaideServiceImpl(final ParametrePersistence parametrePersistence,
                                                  final UtiLogService utiLogService,
                                                  final VersionAdelaideService adelaideVersionService,
                                                  final AdelaideSocketServiceImpl adelaideSocketService) {
        super(adelaideVersionService, adelaideSocketService);
        this.utiLogService = utiLogService;
        this.parametrePersistence = parametrePersistence;
    }

    @Override
    protected String createMessage(final IAdelaideMessage iAdelaideMessage) {
        GenericAdelaideMessage genericAdelaideMessage = (GenericAdelaideMessage) iAdelaideMessage;
        String message = AdelaideUtil.FONC_UNLINK_FICHIER + genericAdelaideMessage.getMessage() + AdelaideUtil.CAR_FIN;
        doLogBefore(getClass().getName(), message);
        return message;
    }

    @Override
    protected AdelaideResult logResult(final AdelaideResult result, final IAdelaideMessage iAdelaideMessage) {
        LOGGER.info("Error {}", result.getError());
        LOGGER.info("Result {}", result);
        String error = result.getError();
        if (error != null) {
            GenericAdelaideMessage genericAdelaideMessage = (GenericAdelaideMessage) iAdelaideMessage;
            error = "La suppression physique des fichiers correspondants a échoué";
            result.setError(error);
            String params = UtiLogUtil.PARAM_DELETE_FILE_MAS + genericAdelaideMessage.getMessage().replace(String.valueOf(AdelaideUtil.CAR_CHAMP), StringUtils.COMMA);
            String formId = "Exploitation éditique > Massifications";
            this.utiLogService.insertUtilog(error, params, Action.DELETE.getLibelle(), ContextHolder.getContext().getHost(), ContextHolder.getContext().getUser(), formId);
        }
        return result;
    }

    public List<String> createFiles(final List<MassificationSearch> list) {
        List<String> result = new LinkedList<>();
        for (MassificationSearch massificationSearch : list) {
            result.add(getPathName(massificationSearch));
        }
        return result;
    }

    @Override
    public AdelaideResult delete(final List<MassificationSearch> list) {
        String listFile = createFiles(list).stream()
                .collect(Collectors.joining(String.valueOf(AdelaideUtil.CAR_CHAMP)));
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage();
        genericAdelaideMessage.setMessage(listFile);
        return this.connectAndSend(genericAdelaideMessage);
    }

    private String getPath() {
        return this.parametrePersistence.getValueByCode(Parametre.PARAM_CODE_MASREP);
    }

    public String getPathName(final MassificationSearch massificationSearch) {
        StringBuilder result;
        result = new StringBuilder();
        result.append(getPath());
        result.append(StringUtils.SLASH);
        result.append(massificationSearch.getCodenv());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getCodorg());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getCodapp());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getPercod());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getNumcom());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getCodcom());
        result.append(StringUtils.UNDERSCORE);
        result.append(massificationSearch.getCodfic());
        return result.toString().toLowerCase();
    }
}


