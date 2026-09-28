package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.FaqNotificationEntity;
import fr.acoss.posdoc.domain.faqnotification.model.FaqNotification;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface FaqNotificationMapper {

    FaqNotificationMapper INSTANCE = Mappers.getMapper(FaqNotificationMapper.class);

    FaqNotification entityToDomain(final FaqNotificationEntity faqNotificationEntity);

    FaqNotificationEntity domainToEntity(final FaqNotification faqNotification);

}
