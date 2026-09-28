package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.genetp.model.GenEtp;
import fr.acoss.posdoc.domain.genetp.model.VolumesTraites;
import fr.acoss.posdoc.ws.resolvers.payloads.VolumesTraitesPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.query.GenEtpDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface GenEtpMapper {

  GenEtpMapper INSTANCE = Mappers.getMapper(GenEtpMapper.class);

  GenEtpDTO domainToDTO(final GenEtp genEtp);

  VolumesTraitesPayloadDTO domainToPayloadDTO(final VolumesTraites volumesTraites);
}

