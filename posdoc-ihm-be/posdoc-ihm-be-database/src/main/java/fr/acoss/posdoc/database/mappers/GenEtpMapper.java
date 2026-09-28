package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.GenEtpEntity;
import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.OccurrenceEtapeSearchData;
import fr.acoss.posdoc.domain.genetp.model.ResGamSit;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraites;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.Map;

@Mapper
public interface GenEtpMapper {

  GenEtpMapper INSTANCE = Mappers.getMapper(GenEtpMapper.class);

  @Mapping(source = "id", target = "id")
  @Mapping(source = "genEtpEntity.typetp", target = "typetp")
  @Mapping(source = "genEtpEntity.codenv", target = "codenv")
  @Mapping(source = "genEtpEntity.codorg", target = "codorg")
  @Mapping(source = "genEtpEntity.codapp", target = "codapp")
  @Mapping(source = "genEtpEntity.percod", target = "percod")
  @Mapping(source = "genEtpEntity.codcom", target = "codcom")
  @Mapping(source = "genEtpEntity.numcom", target = "numcom")
  @Mapping(source = "genEtpEntity.codfic", target = "codfic")
  @Mapping(source = "genEtpEntity.codgam", target = "codgam")
  @Mapping(source = "genEtpEntity.numexe", target = "numexe")
  @Mapping(source = "genEtpEntity.codres", target = "codres")
  @Mapping(source = "genEtpEntity.codsit", target = "codsit")
  @Mapping(source = "genEtpEntity.coddes", target = "coddes")
  @Mapping(source = "genEtpEntity.nbrexe", target = "nbrexe")
  @Mapping(source = "genEtpEntity.codser", target = "codser")
  @Mapping(source = "genEtpEntity.codsig", target = "codsig")
  @Mapping(source = "genEtpEntity.signal", target = "signal")
  @Mapping(source = "genEtpEntity.reedit", target = "reedit")
  @Mapping(source = "genEtpEntity.fabsim", target = "fabsim")
  @Mapping(source = "genEtpEntity.statut", target = "statut")
  @Mapping(source = "genEtpEntity.codinf", target = "codinf")
  @Mapping(source = "genEtpEntity.create", target = "create")
  @Mapping(source = "genEtpEntity.valide", target = "valide")
  @Mapping(source = "genEtpEntity.debute", target = "debute")
  @Mapping(source = "genEtpEntity.termin", target = "termin")
  @Mapping(source = "genEtpEntity.invali", target = "invali")
  @Mapping(source = "genEtpEntity.suspen", target = "suspen")
  @Mapping(source = "genEtpEntity.histor", target = "histor")
  @Mapping(source = "genEtpEntity.script", target = "script")
  @Mapping(source = "genEtpEntity.stepno", target = "stepno")
  @Mapping(source = "genEtpEntity.numpid", target = "numpid")
  @Mapping(source = "genEtpEntity.etpfus", target = "etpfus")
  @Mapping(source = "genEtpEntity.clefus", target = "clefus")
  @Mapping(source = "genEtpEntity.idtfus", target = "idtfus")
  GenEtp entityToDomain(final GenEtpEntity genEtpEntity);

  @Mapping(source = "genEtp.id", target = "id")
  @Mapping(source = "genEtp.typetp", target = "typetp")
  @Mapping(source = "genEtp.codenv", target = "codenv")
  @Mapping(source = "genEtp.codorg", target = "codorg")
  @Mapping(source = "genEtp.codapp", target = "codapp")
  @Mapping(source = "genEtp.percod", target = "percod")
  @Mapping(source = "genEtp.codcom", target = "codcom")
  @Mapping(source = "genEtp.numcom", target = "numcom")
  @Mapping(source = "genEtp.codfic", target = "codfic")
  @Mapping(source = "genEtp.codgam", target = "codgam")
  @Mapping(source = "genEtp.numexe", target = "numexe")
  @Mapping(source = "genEtp.codres", target = "codres")
  @Mapping(source = "genEtp.codsit", target = "codsit")
  @Mapping(source = "genEtp.coddes", target = "coddes")
  @Mapping(source = "genEtp.nbrexe", target = "nbrexe")
  @Mapping(source = "genEtp.codser", target = "codser")
  @Mapping(source = "genEtp.codsig", target = "codsig")
  @Mapping(source = "genEtp.signal", target = "signal")
  @Mapping(source = "genEtp.reedit", target = "reedit")
  @Mapping(source = "genEtp.fabsim", target = "fabsim")
  @Mapping(source = "genEtp.statut", target = "statut")
  @Mapping(source = "genEtp.codinf", target = "codinf")
  @Mapping(source = "genEtp.create", target = "create")
  @Mapping(source = "genEtp.valide", target = "valide")
  @Mapping(source = "genEtp.debute", target = "debute")
  @Mapping(source = "genEtp.termin", target = "termin")
  @Mapping(source = "genEtp.invali", target = "invali")
  @Mapping(source = "genEtp.suspen", target = "suspen")
  @Mapping(source = "genEtp.histor", target = "histor")
  @Mapping(source = "genEtp.script", target = "script")
  @Mapping(source = "genEtp.stepno", target = "stepno")
  @Mapping(source = "genEtp.numpid", target = "numpid")
  @Mapping(source = "genEtp.etpfus", target = "etpfus")
  @Mapping(source = "genEtp.clefus", target = "clefus")
  @Mapping(source = "genEtp.idtfus", target = "idtfus")
  GenEtpEntity domainToEntity(final GenEtp genEtp);

  OccurrenceEtapeSearchData mapToOccurrenceEtapeSearchData(final Map<String, String> map);

  VolumesTraites mapToVolumesTraitesSearchData(final Map<String, Integer> map);

  ResGamSit mapToResGamSit(final Map<String, String> map);
}
