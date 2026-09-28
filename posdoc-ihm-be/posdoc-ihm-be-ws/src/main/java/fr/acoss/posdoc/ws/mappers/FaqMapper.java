package fr.acoss.posdoc.ws.mappers;

import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateFaqExchangeInputDTO;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateFaqInputDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FaqMapper {

    FaqMapper INSTANCE = Mappers.getMapper(FaqMapper.class);

    Faq inputDTOToDomain(final CreateOrUpdateFaqInputDTO dto);

    FaqExchange exchangeInputDTOToDomain(final CreateFaqExchangeInputDTO dto);
}
