package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ProduiRepository;
import fr.acoss.posdoc.database.entities.ProduiCompositeId;
import fr.acoss.posdoc.database.entities.ProduiEntity;
import fr.acoss.posdoc.database.mappers.ProduiMapper;
import fr.acoss.posdoc.domain.produi.model.Produi;
import fr.acoss.posdoc.domain.produi.secondary.ProduiPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

@Service
public class ProduiPersistenceImpl extends AbstractObjectPersistence<ProduiEntity, ProduiCompositeId, Produi>
        implements ProduiPersistence {

    private static final ProduiMapper MAPPER = ProduiMapper.INSTANCE;

    private final ProduiRepository produiRepository;

    public ProduiPersistenceImpl(final ProduiRepository produiRepository) {
        this.produiRepository = produiRepository;
    }

    @Override
    protected JpaSpecificationExecutor<ProduiEntity> getSpecificationExecutor() {
        return produiRepository;
    }

    @Override
    protected JpaRepository<ProduiEntity, ProduiCompositeId> getRepository() {
        return produiRepository;
    }

    @Override
    protected Function<ProduiEntity, Produi> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Produi, ProduiEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<String> gammesExistsInProduits(List<String> gammeCodes) {
        return produiRepository.gammesExistsInProduits(gammeCodes);
    }

    @Override
    public boolean exists(Produi product) {
        return exists(new ProduiCompositeId(product.getCodenv(), product.getCodorg(), product.getCodapp(), product.getCodcom(), product.getCodfic(), product.getCodgam()));
    }

    @Override
    public void delete(Produi product) {
        delete(new ProduiCompositeId(product.getCodenv(), product.getCodorg(), product.getCodapp(), product.getCodcom(), product.getCodfic(), product.getCodgam()));
    }
}
