package fr.acoss.posdoc.domain.serviceposdoc.primary;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdocInput;
import fr.acoss.posdoc.domain.serviceposdoc.secondary.ServicePosdocPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;

import static fr.acoss.posdoc.domain.serviceposdoc.validators.ServicePosdocValidators.libelleValidator;
import static fr.acoss.posdoc.domain.serviceposdoc.validators.ServicePosdocValidators.urlValidator;

public class ServicePosdocService {

    private final ServicePosdocPersistence servicePosdocPersistence;

    public ServicePosdocService(final ServicePosdocPersistence servicePosdocPersistence) {
        this.servicePosdocPersistence = servicePosdocPersistence;
    }

    public List<ServicePosdoc> findAll() {
        return servicePosdocPersistence.findAll();
    }

    public List<ServicePosdoc> create(ServicePosdocInput servicePosdocInput) {
        libelleValidator().validate(servicePosdocInput.getLibelle());
        urlValidator().validate(servicePosdocInput.getUrl());
        if (servicePosdocPersistence.existsByLibelle(servicePosdocInput.getLibelle())) {
            throw new AlreadyExistingElement("Service", servicePosdocInput.getLibelle());
        }
        checkURL(servicePosdocInput.getUrl());
        Context context = ContextHolder.getContext();
        ServicePosdoc servicePosdoc = new ServicePosdoc();
        servicePosdoc.setLibelle(servicePosdocInput.getLibelle());
        servicePosdoc.setUrl(servicePosdocInput.getUrl());
        servicePosdoc.setCreatedAt(LocalDateTime.now());
        servicePosdoc.setUpdatedAt(LocalDateTime.now());
        servicePosdoc.setCreatedBy(context.getUser());
        servicePosdoc.setUpdatedBy(context.getUser());
        servicePosdocPersistence.create(servicePosdoc);
        return servicePosdocPersistence.findAll();
    }

    public List<ServicePosdoc> update(ServicePosdocInput servicePosdocInput) {
        libelleValidator().validate(servicePosdocInput.getLibelle());
        urlValidator().validate(servicePosdocInput.getUrl());
        ServicePosdoc found = servicePosdocPersistence.findById(servicePosdocInput.getId());
        if (found == null) {
            throw new ElementNotFoundException("Service", String.valueOf(servicePosdocInput.getId()));
        }
        checkURL(servicePosdocInput.getUrl());
        if (!found.getLibelle().equals(servicePosdocInput.getLibelle())
                && servicePosdocPersistence.existsByLibelle(servicePosdocInput.getLibelle())) {
            throw new AlreadyExistingElement("Service", servicePosdocInput.getLibelle());
        }
        Context context = ContextHolder.getContext();
        found.setLibelle(servicePosdocInput.getLibelle());
        found.setUrl(servicePosdocInput.getUrl());
        found.setUpdatedAt(LocalDateTime.now());
        found.setUpdatedBy(context.getUser());
        servicePosdocPersistence.update(found);
        return servicePosdocPersistence.findAll();
    }

    private void checkURL(String url) {
        if(Boolean.FALSE.equals(isValidURL(url))) {
            throw new CustomExceptionMessage("L'URL n'est pas valide");
        }
    }

    private boolean isValidURL(String url) {
        try {
            new URL(url).toURI();
            return true;
        } catch (MalformedURLException | URISyntaxException e) {
            return false;
        }
    }

    public void deleteAll(Iterable<Integer> ids) {
        servicePosdocPersistence.deleteAll(ids);
    }
}
