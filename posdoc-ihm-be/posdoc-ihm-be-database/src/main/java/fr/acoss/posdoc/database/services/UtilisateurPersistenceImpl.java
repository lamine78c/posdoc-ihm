package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.UtilisateurRepository;
import fr.acoss.posdoc.database.entities.UtilisateurEntity;
import fr.acoss.posdoc.database.mappers.UtilisateurMapper;
import fr.acoss.posdoc.domain.utilisateur.model.Utilisateur;
import fr.acoss.posdoc.domain.utilisateur.secondary.UtilisateurPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UtilisateurPersistenceImpl  extends AbstractObjectPersistence<UtilisateurEntity, String, Utilisateur>
        implements UtilisateurPersistence {

    private static final UtilisateurMapper MAPPER = UtilisateurMapper.INSTANCE;

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurPersistenceImpl(
            UtilisateurRepository utilisateurRepository) {this.utilisateurRepository = utilisateurRepository;}

    @Override
    protected JpaSpecificationExecutor<UtilisateurEntity> getSpecificationExecutor() {
        return utilisateurRepository;
    }

    @Override
    protected JpaRepository<UtilisateurEntity, String> getRepository() {
        return utilisateurRepository;
    }

    @Override
    protected Function<UtilisateurEntity, Utilisateur> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Utilisateur, UtilisateurEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }
    @Override
    @Transactional
    public void deleteAll(List<String> ids) {
        utilisateurRepository.deleteByCodeUtilisateurIn(ids);
    }

    @Override
    public List<Utilisateur> updateAll(List<Utilisateur> utilisateurs) {
        var entity = utilisateurs.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        return utilisateurRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

}

