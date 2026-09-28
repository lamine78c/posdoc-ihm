package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.FaqEntity;
import fr.acoss.posdoc.database.entities.FaqExchangeEntity;
import fr.acoss.posdoc.domain.faq.model.Faq;
import fr.acoss.posdoc.domain.faq.model.FaqExchange;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FaqMapper {

    FaqMapper INSTANCE = Mappers.getMapper(FaqMapper.class);

    Faq entityToDomain(final FaqEntity faqEntity);

    FaqEntity domainToEntity(final Faq faq);

    FaqExchangeEntity exchangeDomainToEntity(final FaqExchange exchange);
}
