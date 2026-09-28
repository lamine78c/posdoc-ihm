package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.GenScrCompositeId;
import fr.acoss.posdoc.database.entities.GenScrEntity;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident;
import fr.acoss.posdoc.domain.occurrence.etape.model.Incidents;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenScrRepository extends GenericRepository<GenScrEntity, GenScrCompositeId> {

    @Query(" SELECT new fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident" +
            " (gs.signal, gs.dcreat, gs.script, gs.mesano, gs.ficinf, ge.typetp, ge.codcom, ge.codfic, ge.numcom, ge.codgam, ge.codsit, ge.codres) " +
            " FROM GenScrEntity gs " +
            " LEFT JOIN GenEtpEntity ge ON gs.idetap = ge.id " +
            " WHERE gs.id.codeEnv = :codenv " +
            " AND gs.id.codeOrg = :codorg " +
            " AND gs.id.codeApp = :codapp " +
            " AND gs.id.perCod = :percod " +
            " ORDER BY gs.dcreat DESC ")
    List<DetailsIncident> getDetailsIncident(@Param("codenv") String codenv, @Param("codorg") String codorg, @Param("codapp") String codapp, @Param("percod") String percod);

    @Query(" SELECT new fr.acoss.posdoc.domain.occurrence.etape.model.Incidents" +
            " (gs.dcreat, gs.script, gs.mesano) " +
            " FROM GenScrEntity gs " +
            " WHERE gs.idetap = :idetap " +
            " ORDER BY gs.dcreat DESC ")
    List<Incidents> getIncidentsByIdetap(@Param("idetap") Integer idetap);
}
