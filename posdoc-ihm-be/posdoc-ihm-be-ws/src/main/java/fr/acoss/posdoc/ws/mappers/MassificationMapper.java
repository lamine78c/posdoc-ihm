package fr.acoss.posdoc.ws.mappers;


import fr.acoss.posdoc.domain.massification.model.OptionFields;
import fr.acoss.posdoc.ws.resolvers.payloads.ReadTmpMasPayloadDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MassificationMapper {

  MassificationMapper INSTANCE = Mappers.getMapper(MassificationMapper.class);

  ReadTmpMasPayloadDTO domainToPayloadDTO(final OptionFields optionFields);

}
