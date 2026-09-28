package fr.acoss.posdoc.database.mappers;

import fr.acoss.posdoc.database.entities.UtilisateurEntity;
import fr.acoss.posdoc.domain.utilisateur.model.Utilisateur;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface UtilisateurMapper {

    UtilisateurMapper INSTANCE = Mappers.getMapper(UtilisateurMapper.class);

    Utilisateur entityToDomain(final UtilisateurEntity utilisateurEntity);

    UtilisateurEntity domainToEntity(final Utilisateur utilsateur);
}
