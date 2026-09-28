package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.DcaProductionFluxEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface DcaProductionFluxRepository extends GenericRepository<DcaProductionFluxEntity, Integer> {

    @Transactional
    void deleteByIdIn(Iterable<Integer> ids);

    @Query(value = "select (select COUNT(*) from cereus.dca_pli_detail_production hv where hv.id_production_flux=hc.id) as details, * from cereus.dca_production_flux hc", nativeQuery = true )
    List<DcaProductionFluxEntity> getProdFluxWithdetails();
}
