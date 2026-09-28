package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.GenProRepository;
import fr.acoss.posdoc.database.entities.GenProCompositeId;
import fr.acoss.posdoc.database.entities.GenProEntity;
import fr.acoss.posdoc.database.mappers.GenProMapper;
import fr.acoss.posdoc.domain.genpro.model.GenPro;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierPayloadDTO;
import fr.acoss.posdoc.domain.genpro.secondary.GenProPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenProPersistenceImpl extends AbstractObjectPersistence<GenProEntity, GenProCompositeId, GenPro>
    implements GenProPersistence {

  private static final GenProMapper MAPPER = GenProMapper.INSTANCE;

  private final GenProRepository genProRepository;

  public GenProPersistenceImpl(final GenProRepository genProRepository) {
    this.genProRepository = genProRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenProEntity> getSpecificationExecutor() {
    return genProRepository;
  }

  @Override
  protected JpaRepository<GenProEntity, GenProCompositeId> getRepository() {
    return genProRepository;
  }

  @Override
  protected Function<GenProEntity, GenPro> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenPro, GenProEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  public void termineGenPro(OccurrenceApplicationInput paramData) {
    String codenv = paramData.getCodEnv();
    String codorg = paramData.getCodOrg();
    String codapp = paramData.getCodApp();
    String percod = paramData.getPerCod();
    this.genProRepository.termineGenPro(codenv, codorg, codapp, percod);
  }

  @Override
  public List<SearchProduitsByFichierPayloadDTO> searchProduitsByFichier(SearchProduitsByFichierInput query) {
    return this.genProRepository.searchProduitsByFichier(query).stream().map(this::mapToSearchProduitsByFichierPayloadDTO).collect(Collectors.toList());
  }

  private SearchProduitsByFichierPayloadDTO mapToSearchProduitsByFichierPayloadDTO(Map<String, Object> source) {
    SearchProduitsByFichierPayloadDTO target = new SearchProduitsByFichierPayloadDTO();
    target.setCodgam((String) source.get(ParamsUtils.CODGAM));
    target.setLibgam((String) source.get(ParamsUtils.LIBGAM));
    target.setProsta((String) source.get(ParamsUtils.PROSTA));
    target.setProinf((String) source.get(ParamsUtils.PROINF));
    target.setDprodd((LocalDateTime) source.get(ParamsUtils.DPRODD));
    target.setDprods((LocalDateTime) source.get(ParamsUtils.DPRODS));
    target.setDprodt((LocalDateTime) source.get(ParamsUtils.DPRODT));
    target.setPagfic((Integer) source.get(ParamsUtils.PAGFIC));
    target.setPlific((Integer) source.get(ParamsUtils.PLIFIC));
    target.setRejfic((Integer) source.get(ParamsUtils.REJFIC));
    return target;
  }
}
