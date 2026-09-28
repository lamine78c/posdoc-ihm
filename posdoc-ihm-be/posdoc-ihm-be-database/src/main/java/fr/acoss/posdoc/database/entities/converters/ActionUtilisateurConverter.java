package fr.acoss.posdoc.database.entities.converters;

import fr.acoss.posdoc.types.ActionUtilisateur;

import javax.persistence.AttributeConverter;

public class ActionUtilisateurConverter implements AttributeConverter<ActionUtilisateur, String> {

    @Override
    public String convertToDatabaseColumn(ActionUtilisateur attribute) {
        return attribute.getShortValue();
    }

    @Override
    public ActionUtilisateur convertToEntityAttribute(String dbData) {
        return ActionUtilisateur.fromValue(dbData);
    }
}
