package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.ContenuEntity;
import fr.acoss.posdoc.domain.contenu.model.Contenu;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface ContenuMapper {

    ContenuMapper INSTANCE = Mappers.getMapper(ContenuMapper.class);

    Contenu entityToDomain(final ContenuEntity contenuEntity);

    ContenuEntity domainToEntity(final Contenu contenu);
}
