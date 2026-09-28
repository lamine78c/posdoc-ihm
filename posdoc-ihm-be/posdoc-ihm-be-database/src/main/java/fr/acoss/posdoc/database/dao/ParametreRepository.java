package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.ParametreEntity;
import fr.acoss.posdoc.domain.parametre.model.Parametre;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_DOCAPP;
import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_DOCORG;
import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_REMISE;

@Repository
public interface ParametreRepository extends GenericRepository<ParametreEntity, String> {

    @Transactional
    void deleteByCodeIn(Iterable<String> codes);

    @Query("SELECT p.value FROM ParametreEntity p WHERE p.code = 'VERSIO'")
    String getAdelaideVersion();

    @Query("SELECT p.value FROM ParametreEntity p WHERE p.code = 'MASGAM'")
    String getValueForMASGAM();

    @Query("SELECT p.value FROM ParametreEntity p where p.code = :code")
    String getValueByCode(@Param("code")String code);

    @Query("SELECT new fr.acoss.posdoc.domain.parametre.model.Parametre(p.code, p.value, p.libelle) FROM ParametreEntity p WHERE p.code IN ('MASAPP','MASGAM','MASUTI') ORDER BY p.code")
    List<Parametre> getParamsForMasappMasgamMasuti();

    @Query("SELECT p FROM ParametreEntity p WHERE p.code like '"+PARAM_CODE_REMISE+"' ORDER BY code")
    List<ParametreEntity> getParamsDeRemise();

    @Query("SELECT p.value FROM ParametreEntity p WHERE p.code = '"+PARAM_CODE_DOCAPP+"' ORDER BY p.code")
    String getValueDocDematerialises();

    @Query("SELECT p.value FROM ParametreEntity p WHERE p.code = '"+PARAM_CODE_DOCORG+"' ORDER BY p.code")
    String getValueDocOrg();
}
