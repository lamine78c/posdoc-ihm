package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdocInput;
import fr.acoss.posdoc.domain.serviceposdoc.primary.ServicePosdocService;
import fr.acoss.posdoc.exceptions.PosdocException;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.resolvers.inputs.DeleteByArrayStringIdInputDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ServicePosdocResolver extends AbstractResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(ServicePosdocResolver.class);
    private final ServicePosdocService servicePosdocService;
    private final RestTemplate restTemplate;


    public ServicePosdocResolver(final ServicePosdocService servicePosdocService, final RestTemplate restTemplate) {
        this.servicePosdocService = servicePosdocService;
        this.restTemplate = restTemplate;
    }

    public List<ServicePosdoc> findAllServices(){
        return this.servicePosdocService.findAll();
    }

    @Historisable(form = "Administration > Services", action = Action.CREATE)
    public List<ServicePosdoc> createServicePosdoc(final ServicePosdocInput servicePosdocInput) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("createServicePosdoc: {}", servicePosdocInput);
        }
        return this.servicePosdocService.create(servicePosdocInput);
    }

    @Historisable(form = "Administration > Services", action = Action.UPDATE)
    public List<ServicePosdoc> updateServicePosdoc(final ServicePosdocInput servicePosdocInput) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("updateServicePosdoc: {}", servicePosdocInput);
        }
        return this.servicePosdocService.update(servicePosdocInput);
    }

    @Historisable(form = "Administration > Service", action = Action.DELETE)
    public DeletePayloadDTO deleteServicesPosdoc(final DeleteByArrayStringIdInputDTO deletesDTO) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("deleteServicesPosdoc: {}", deletesDTO);
        }
        final List<Integer> ids = deletesDTO.getIds().stream().map(Integer::parseInt).collect(Collectors.toList());
        this.servicePosdocService.deleteAll(ids);
        return new DeletePayloadDTO(true);
    }

    public String checkServiceHealth(final String url) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("checkServiceHealth: {}", url);
        }
        try {
            return this.restTemplate.getForObject(url, String.class);
        } catch (ResourceAccessException e) {
            final String errorMessage = "Service inaccessible - Le service ne répond pas ou est injoignable: " + url;
            throw new PosdocException(errorMessage, e);
        } catch (RestClientException e) {
            final String errorMessage = "Erreur lors de la vérification du service " + url + ": " + e.getMessage();
            throw new PosdocException(errorMessage, e);
        }
    }
}
