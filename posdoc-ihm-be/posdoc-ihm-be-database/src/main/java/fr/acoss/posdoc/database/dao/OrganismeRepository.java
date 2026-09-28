package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.OrganismeEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface OrganismeRepository extends GenericRepository<OrganismeEntity, String> {

@Query(value = "SELECT new OrganismeEntity(o.code, o.libelle, o.adresse1, o.adresse2, " +
            "            o.adresse3, o.adresse4, o.type, o.codeRegion, o.codeSite, " +
            "            (CASE WHEN EXISTS (SELECT 1 FROM ApplicationEntity a WHERE a.id.codeOrganisation = o.code) " +
            "                   OR EXISTS (SELECT 1 FROM DestinataireEntity d WHERE d.id.codeOrg = o.code) " +
            "                  THEN true ELSE false END)) " +
            "FROM OrganismeEntity o ORDER BY o.code ASC"
    )
    List<OrganismeEntity> findOrganismes();

    List<OrganismeEntity> findByCodeRegionIn( Iterable<String> regions);

    @Query(value="select c00_codorg From organi o " +
            "INNER JOIN region_mapping om ON om.codreg = o.s00_codreg   " +
            "where om.codana IN (:regions) ", nativeQuery = true)
    List<String> findCodeOrganismeByRegionAnais(@Param("regions") Iterable<String> regions);


    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query("select distinct o.code from OrganismeEntity o where o.codeRegion in (:regionCodes)")
    List<String> regionsExistsInOrganismes(@Param("regionCodes") List<String> regionCodes);

    @Query("select distinct o.code from OrganismeEntity o where o.codeSite in (:siteCodes)")
    List<String> sitesExistsInOrganismes(@Param("siteCodes") List<String> siteCodes);

    @Query("SELECT DISTINCT o.code FROM OrganismeEntity o WHERE o.type = 'R'")
    List<String> findCodeOrganismesByTypeR();

    @Query("select distinct o.codeSite from OrganismeEntity o where o.code in (:codesOrg)")
    List<String> findCodesSite(@Param("codesOrg") List<String> codesOrg);
}
