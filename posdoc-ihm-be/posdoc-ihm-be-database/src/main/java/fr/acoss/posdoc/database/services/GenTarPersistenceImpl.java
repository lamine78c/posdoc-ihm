package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.dao.GenTarRepository;
import fr.acoss.posdoc.database.entities.GenTarCompositeId;
import fr.acoss.posdoc.database.entities.GenTarEntity;
import fr.acoss.posdoc.database.mappers.GenTarMapper;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierInput;
import fr.acoss.posdoc.domain.gentar.model.SearchFichiersByFichierMasResult;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.gentar.model.SearchFacturationsByFichierResult;
import fr.acoss.posdoc.domain.gentar.secondary.GenTarPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenTarPersistenceImpl extends AbstractObjectPersistence<GenTarEntity, GenTarCompositeId, GenTar>
    implements GenTarPersistence {

  private static final GenTarMapper MAPPER = GenTarMapper.INSTANCE;

  private final GenTarRepository genTarRepository;
  private final GenFicRepository genFicRepository;

  public GenTarPersistenceImpl(
          final GenTarRepository genTarRepository,
          final GenFicRepository genFicRepository
  ) {
    this.genTarRepository = genTarRepository;
    this.genFicRepository = genFicRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenTarEntity> getSpecificationExecutor() {
    return genTarRepository;
  }

  @Override
  protected JpaRepository<GenTarEntity, GenTarCompositeId> getRepository() {
    return genTarRepository;
  }

  @Override
  protected Function<GenTarEntity, GenTar> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenTar, GenTarEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public SearchFacturationsByFichierPayloadDTO searchFacturationsByFichier(SearchFacturationsByFichierInput query) {
    SearchFacturationsByFichierPayloadDTO result = new SearchFacturationsByFichierPayloadDTO();
    String masapp = genFicRepository.findValueByCodeMASAPP();
    if(query.getCodapp().equals(masapp)) {
      result.setFacturations(genTarRepository.searchFacturationsByFichierMas(query).stream().map(this::mapToSearchFacturationsByFichierPayloadDTO).collect(Collectors.toList()));
      result.setFichiersMas(genTarRepository.searchGenTarByFichierMas(query).stream().map(this::mapToSearchGenTarByFichierMasPayloadDTO).collect(Collectors.toList()));
    } else {
      result.setFacturations(genTarRepository.searchFacturationsByFichier(query).stream().map(this::mapToSearchFacturationsByFichierPayloadDTO).collect(Collectors.toList()));
    }
    return result;
  }

  private SearchFacturationsByFichierResult mapToSearchFacturationsByFichierPayloadDTO(Map<String, Object> source) {
    SearchFacturationsByFichierResult target = new SearchFacturationsByFichierResult();
    target.setTyptar((String) source.get(ParamsUtils.TYPTAR));
    target.setLibtar((String) source.get(ParamsUtils.LIBTAR));
    target.setNbplis((Integer) source.get(ParamsUtils.NBPLIS));
    target.setCoutot((Integer) source.get(ParamsUtils.COUTOT));
    return target;
  }

  private SearchFichiersByFichierMasResult mapToSearchGenTarByFichierMasPayloadDTO(Map<String, Object> source) {
    SearchFichiersByFichierMasResult target = new SearchFichiersByFichierMasResult();
    target.setCodenv((String) source.get(ParamsUtils.CODENV));
    target.setCodorg((String) source.get(ParamsUtils.CODORG));
    target.setCodapp((String) source.get(ParamsUtils.CODAPP));
    target.setPercod((String) source.get(ParamsUtils.PERCOD));
    target.setCodcom((String) source.get(ParamsUtils.CODCOM));
    target.setCodfic((String) source.get(ParamsUtils.CODFIC));
    target.setNumcom((String) source.get(ParamsUtils.NUMCOM));
    target.setLibtar((String) source.get(ParamsUtils.LIBTAR));
    target.setNbplis((Integer) source.get(ParamsUtils.NBPLIS));
    target.setCoutot((Integer) source.get(ParamsUtils.COUTOT));
    return target;
  }
}
