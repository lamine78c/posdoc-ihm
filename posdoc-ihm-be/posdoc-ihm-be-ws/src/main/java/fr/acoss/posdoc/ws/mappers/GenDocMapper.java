package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.gendoc.model.DocDematerialise;
import fr.acoss.posdoc.domain.gendoc.model.DocVideoInformationDetail;
import fr.acoss.posdoc.domain.gendoc.model.GenDoc;
import fr.acoss.posdoc.ws.resolvers.payloads.DocDematerialisePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DocVideoInfoDetailPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DocVideoPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.GenDocDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenDocMapper {

  GenDocMapper INSTANCE = Mappers.getMapper(GenDocMapper.class);

  GenDocDTO domainToDTO(final GenDoc genDoc);

  DocDematerialisePayloadDTO domainToPayloadDTO(final DocDematerialise docDematerialise);

  DocVideoPayloadDTO  domain2ToPayloadDTO(final DocDematerialise docDematerialise);


  DocVideoInfoDetailPayloadDTO  domainVideoToPayloadDTO(final DocVideoInformationDetail docVideoInformationDetail);
}

