package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateFaqExchangeInputDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FaqExchangeMapper {

    FaqExchangeMapper INSTANCE = Mappers.getMapper(FaqExchangeMapper.class);

    FaqExchange inputDTOToDomain(final CreateFaqExchangeInputDTO dto);
}
