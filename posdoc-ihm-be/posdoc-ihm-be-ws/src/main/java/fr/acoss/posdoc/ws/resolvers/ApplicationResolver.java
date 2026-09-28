package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.application.model.CodeAppDTO;
import fr.acoss.posdoc.domain.application.parimary.ApplicationService;
import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.mappers.ApplicationMapper;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateApplicationInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayApplicationCompositeIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateApplicationPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ApplicationResolver extends AbstractResolver {

    private static final ApplicationMapper MAPPER = ApplicationMapper.INSTANCE;
    private static final Logger LOGGER = LoggerFactory.getLogger(ApplicationResolver.class);
    private final ApplicationPersistence applicationPersistence;

    private final ApplicationService applicationService;

    public ApplicationResolver(
            ApplicationPersistence applicationPersistence, ApplicationService applicationService) {
        this.applicationPersistence = applicationPersistence;
        this.applicationService = applicationService;
    }

    public List<CreateOrUpdateApplicationPayloadDTO> allApplications() {
        return applicationPersistence.selectAll().stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<CreateOrUpdateApplicationPayloadDTO> getApplicationsByEnvs(List<String> codesEnv) {
        return applicationPersistence.findApplicationsByEnv(codesEnv).stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    @Historisable(form = "Administration > Applications",action = Action.CREATE)
    public CreateOrUpdateApplicationPayloadDTO createApplication(
            final CreateOrUpdateApplicationInputDTO applicationInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createApplication: {}", applicationInputDTO);
        }
        return MAPPER.domainToPayloadDTO(applicationService
                .createApplication(MAPPER.inputDTOToDomain(applicationInputDTO)));
    }

    @Historisable(form = "Administration > Applications",action = Action.UPDATE)
    public CreateOrUpdateApplicationPayloadDTO updateApplication(
            final CreateOrUpdateApplicationInputDTO applicationInputDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateApplication: {}", applicationInputDTO);
        }
        return MAPPER.domainToPayloadDTO(applicationService
                .updateApplication(MAPPER.inputDTOToDomain(applicationInputDTO)));
    }

    @Historisable(form = "Administration > Applications",action = Action.DELETE)
    public DeletePayloadDTO deleteApplications(final DeleteByArrayApplicationCompositeIdInputDTO deleteDTO) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteApplications: {}", deleteDTO);
        }

        List<ApplicationComposite> deletes = new ArrayList<>();

        deleteDTO.getIds().forEach(
                e -> deletes.add(new ApplicationComposite(e.getCodeEnvironnement(), e.getCodeOrganisation(), e.getCode()))
        );

        applicationService.deleteApplications(deletes);

        return new DeletePayloadDTO(true);
    }

    public List<CodeAppDTO> findCodeApp() {
        return applicationPersistence.findCodeApp().stream()
                .map(CodeAppDTO::new)
                .collect(Collectors.toList());
    }

    public List<CodeAppDTO> findCodeAppByEnvOrgs(String codenv, List<String> codorgs) {
        return applicationPersistence.findCodeAppByEnvOrgs(codenv, codorgs).stream()
                .map(CodeAppDTO::new)
                .collect(Collectors.toList());
    }
}
