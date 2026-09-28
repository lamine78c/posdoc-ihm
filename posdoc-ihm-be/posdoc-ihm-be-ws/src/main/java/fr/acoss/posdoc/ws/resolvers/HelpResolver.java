package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.help.model.CreateHelpDTO;
import fr.acoss.posdoc.domain.help.model.HelpDTO;
import fr.acoss.posdoc.domain.help.model.UpdateHelpDTO;
import fr.acoss.posdoc.domain.help.primary.HelpService;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.HelpMapper;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class HelpResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(HelpResolver.class);
    private static final HelpMapper MAPPER = HelpMapper.INSTANCE;

    private final HelpService helpService;

    public HelpResolver(final HelpService helpService) {
        this.helpService = helpService;
    }

    public List<HelpDTO> searchAll(){
        return this.helpService.getAllHelps().stream().map(MAPPER::domaineToDTO).collect(Collectors.toList());
    }

    public List<HelpDTO> getPublication(String path){
        return this.helpService.getHelpByPath(path).stream().map(MAPPER::domaineToDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Contenus > Aide", action = Action.UPDATE)
    public List<HelpDTO> changeStateHelp(Integer id) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("changeStateHelp: {}", id);
        }
        return this.helpService.changeState(id).stream().map(MAPPER::domaineToDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Contenus > Aide", action = Action.CREATE)
    public List<HelpDTO> createHelp(CreateHelpDTO createHelpDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createHelp: {}", createHelpDTO);
        }
        return this.helpService.createHelp(MAPPER.inputDTOToDomain(createHelpDTO)).stream().map(MAPPER::domaineToDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Contenus > Aide", action = Action.DELETE)
    public DeletePayloadDTO deleteHelp(Integer id) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteHelp: {}", id);
        }
        this.helpService.deleteHelp(id);
        return new DeletePayloadDTO();
    }

    @Historisable(form = "Administration > Contenus > Aide", action = Action.UPDATE)
    public List<HelpDTO> updateHelp(UpdateHelpDTO updateHelpDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateHelp: {}", updateHelpDTO);
        }
        return this.helpService.updateHelp(MAPPER.inputDTOToDomain(updateHelpDTO)).stream().map(MAPPER::domaineToDTO).collect(Collectors.toList());
    }
}