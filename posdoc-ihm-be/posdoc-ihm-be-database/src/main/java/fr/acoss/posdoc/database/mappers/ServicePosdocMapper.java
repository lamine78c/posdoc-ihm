package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ServicePosdocEntity;
import fr.acoss.posdoc.domain.serviceposdoc.model.ServicePosdoc;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ServicePosdocMapper {

    ServicePosdocMapper INSTANCE = Mappers.getMapper(ServicePosdocMapper.class);

    ServicePosdoc entityToDomain(final ServicePosdocEntity servicePosdocEntity);

    ServicePosdocEntity domainToEntity(final ServicePosdoc service);
}
