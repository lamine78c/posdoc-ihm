package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.domain.tarpos.primary.TarposService;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.TarposMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.TarposDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.TarposPayloadDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TarposResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(TarposResolver.class);

    private static final TarposMapper MAPPER = TarposMapper.INSTANCE;

    private final TarposService tarposService;

    public TarposResolver(final TarposService tarposService) {
        this.tarposService = tarposService;
    }

    public List<Tarpos> allTarpos() {
        return tarposService.getTarpos();
    }

    public List<Tarpos> allTarposByPerimetreEqualToZero() {
        return tarposService.getTarposByPerimetreEqualToZero();
    }

    @Historisable(form = "Administration > Tarifs", action = Action.CREATE)
    public Tarpos createTarpos(final TarposDTO tarpos) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("create tarpo: {}", tarpos);
        }

        return MAPPER.domainToPayloadDTO(tarposService.createTarpos(MAPPER.inputDTOToDomain(tarpos)));
    }

    @Historisable(form = "Administration > Tarifs", action = Action.UPDATE)
    public Tarpos updateTarpos(final TarposDTO tarpos) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("update tarpo: {}", tarpos);
        }

        return MAPPER.domainToPayloadDTO(tarposService.updateTarpos(MAPPER.inputDTOToDomain(tarpos)));
    }

    @Historisable(form = "Administration > Tarifs", action = Action.DELETE)
    public DeletePayloadDTO deleteAllTarpos(final DeleteByArrayStringIdInputDTO deleteTarpos) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("delete Tarpos: {}", deleteTarpos.getIds());
        }

        tarposService.deleteTarpos(deleteTarpos.getIds());
        return new DeletePayloadDTO(true);
    }

}
