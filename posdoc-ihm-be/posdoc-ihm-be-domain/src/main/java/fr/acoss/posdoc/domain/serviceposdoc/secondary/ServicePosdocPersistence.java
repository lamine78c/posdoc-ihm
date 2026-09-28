package fr.acoss.posdoc.domain.serviceposdoc.secondary;

import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;

import java.util.List;

public interface ServicePosdocPersistence {
    List<ServicePosdoc> findAll();
    ServicePosdoc create(ServicePosdoc servicePosdoc);
    ServicePosdoc update(ServicePosdoc servicePosdoc);
    void deleteAll(Iterable<Integer> ids);
    ServicePosdoc findById(Integer id);
    boolean existsByLibelle(String libelle);
}
