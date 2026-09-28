package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.GenDocRepository;
import fr.acoss.posdoc.database.entities.GenDocCompositeId;
import fr.acoss.posdoc.database.entities.GenDocEntity;
import fr.acoss.posdoc.database.mappers.GenDocMapper;
import fr.acoss.posdoc.domain.gendoc.model.DocDemOccurrenceApplication;
import fr.acoss.posdoc.domain.gendoc.model.DocDematerialise;
import fr.acoss.posdoc.domain.gendoc.model.DocVideoInformationDetail;
import fr.acoss.posdoc.domain.gendoc.model.GenDoc;
import fr.acoss.posdoc.domain.gendoc.model.GenDocOrgAppCom;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoQuery;
import fr.acoss.posdoc.domain.gendoc.secondary.GenDocPersistence;
import fr.acoss.posdoc.types.LogMessages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenDocPersistenceImpl extends AbstractObjectPersistence<GenDocEntity, GenDocCompositeId, GenDoc>
    implements GenDocPersistence {

  private static final GenDocMapper MAPPER = GenDocMapper.INSTANCE;

  private static final Logger LOGGER = LoggerFactory.getLogger(GenDocPersistenceImpl.class);

  private final GenDocRepository genDocRepository;

  public GenDocPersistenceImpl(final GenDocRepository genDocRepository) {
    this.genDocRepository = genDocRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenDocEntity> getSpecificationExecutor() {
    return genDocRepository;
  }

  @Override
  protected JpaRepository<GenDocEntity, GenDocCompositeId> getRepository() {
    return genDocRepository;
  }

  @Override
  protected Function<GenDocEntity, GenDoc> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenDoc, GenDocEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  public List<GenDoc> selectAll() {
    return genDocRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }


  public List<DocDematerialise> findByCriteres(SearchDocDemQuery query) {
    query.setDate(ConvertorUtils.convertDateToDatdem(query.getDate()));
    List<DocDematerialise> listDd = new ArrayList<>();
    genDocRepository.findByCriteres(query)
    .forEach(e -> {
      DocDematerialise dd = new DocDematerialise();
      dd.setDatdem(e.get("datdem"));
      dd.setNumdem(e.get("numdem"));
      dd.setCodenv(e.get("codenv"));
      dd.setCodorg(e.get("codorg"));
      dd.setCodapp(e.get("codapp"));
      dd.setPercod(e.get("percod"));
      dd.setCodcom(e.get("codcom"));
      dd.setCodfic(e.get("codfic"));
      dd.setCoddoc(e.get("coddoc"));
      dd.setRefdem(e.get("refdem"));
      dd.setTypact(e.get("typact"));
      dd.setImprim("1".equals(e.get("imprim")));
      dd.setDocsta(e.get("docsta"));
      dd.setDocinf(e.get("docinf"));
      dd.setDdodeb(e.get("ddodeb"));
      dd.setDdofin(e.get("ddofin"));
      dd.setDdosus(e.get("ddosus"));
      dd.setTpscom(e.get("tpscom"));
      dd.setLibinf(e.get("libinf"));
      dd.setCodeSiteDematerialisation(e.get("codeSiteDematerialisation"));
      listDd.add(dd);
    });
    return listDd;
  }

  public List<DocDematerialise> findByVideoCriteres(SearchDocVideoQuery query) {
    List<DocDematerialise> listDocDematerialse = new ArrayList<>();

    PageRequest limitSize = PageRequest.of(0, 100); // 0 est la page, limitSize est le nombre d'éléments min et max retourner par l'appel
    genDocRepository.findBySpecificCriteres(query,limitSize)
            .forEach(e -> {
              DocDematerialise docDematerialise = new DocDematerialise();
              docDematerialise.setDatdem(e.get("datdem"));
              docDematerialise.setNumdem(e.get("numdem"));
              docDematerialise.setCoddoc(e.get("coddoc"));
              docDematerialise.setRefdem(e.get("refdem"));
              docDematerialise.setTypact(e.get("typact"));
              docDematerialise.setImprim("1".equals(e.get("imprim")));
              docDematerialise.setDocsta(e.get("docsta"));

              listDocDematerialse.add(docDematerialise);
            });
    return listDocDematerialse;
  }


    public DocVideoInformationDetail findByVideoInfoDetailCriteres(SearchDocVideoInfoDetailQuery query) {

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug(LogMessages.SEARCH_STARTED, query);
        }
        Map<String, Object> resultMap = genDocRepository.findBySpecificVideoInfoDetailCriteres(query);

        if (resultMap == null || resultMap.isEmpty()) {
            LOGGER.warn(LogMessages.NO_DOCUMENT_FOUND);
            return null;
        }
        return mapToDocVideoInformationDetail(resultMap);
    }

    @Override
    public List<DocDemOccurrenceApplication> getDocDemOccurrenceApplication(SearchDocDemOccurrenceApplicationQuery query) {
        return this.genDocRepository.getDocDemOccurrenceApplication(query).stream().map(this::mapToDocDemOccurrenceApplication).collect(Collectors.toList());
    }

    private DocVideoInformationDetail mapToDocVideoInformationDetail(Map<String, Object> map) {

        // Construction de l'objet DocVideoInformationDetail en utilisant Builder
        return DocVideoInformationDetail.builder()
                .coddoc((String) map.get(ParamsUtils.CODDOC))
                .refdem((String) map.get(ParamsUtils.REFDEM))
                .typact((String) map.get(ParamsUtils.TYPACT))
                .imprim("1".equals(map.get(ParamsUtils.IMPRIM)))
                .codenv((String) map.get(ParamsUtils.CODENV))
                .codorg((String) map.get(ParamsUtils.CODORG))
                .codapp((String) map.get(ParamsUtils.CODAPP))
                .percod((String) map.get(ParamsUtils.PERCOD))
                .codcom((String) map.get(ParamsUtils.CODCOM))
                .codfic((String) map.get(ParamsUtils.CODFIC))
                .docsta((String) map.get(ParamsUtils.DOCSTA))
                .docinf((String) map.get(ParamsUtils.DOCINF))
                .ddodeb((String) map.get(ParamsUtils.DDODEB))
                .ddofin((String) map.get(ParamsUtils.DDOFIN))
                .ddosus((String) map.get(ParamsUtils.DDOSUS))
                .tpscom((String) map.get(ParamsUtils.TPSCOM))
                .libinf((String) map.get(ParamsUtils.LIBINF))
                .codeSiteDematerialisation((String) map.get(ParamsUtils.CODE_SITE_DEMATERIALISATION))
                .build();

    }

    private DocDemOccurrenceApplication mapToDocDemOccurrenceApplication(Map<String, String> map) {
      return DocDemOccurrenceApplication.builder()
              .datdem(map.get(ParamsUtils.DATDEM))
              .numdem(ConvertorUtils.convertToInteger(map.get(ParamsUtils.NUMDEM)))
              .coddoc(map.get(ParamsUtils.CODDOC))
              .refdem(map.get(ParamsUtils.REFDEM))
              .typact(ConvertorUtils.getTypeFromTypact(map.get(ParamsUtils.TYPACT)))
              .ddodeb(map.get(ParamsUtils.DDODEB))
              .ddofin(map.get(ParamsUtils.DDOFIN))
              .build();
    }

    @Override
    public List<GenDocOrgAppCom> getDistinctOrgAppComFromGendoc() {
        return this.genDocRepository.getDistinctOrgAppComFromGendoc().stream().map(this::mapToGenDocOrgAppCom).collect(Collectors.toList());
    }

    private GenDocOrgAppCom mapToGenDocOrgAppCom(Map<String, String> map) {
        return GenDocOrgAppCom.builder()
                .codorg(map.get(ParamsUtils.CODORG))
                .codapp(map.get(ParamsUtils.CODAPP))
                .codcom(map.get(ParamsUtils.CODCOM))
                .build();
    }
}
