package fr.acoss.posdoc.ws.aop.annotation;

public enum Action {
    CANCEL("Annuler"),
    CREATE("Créer"),
    DELETE("Supprimer"),
    FINISH("Terminer"),
    INVALIDATE("Invalider"),
    MASSIFY("Massifier"),
    SIMULATE("Simuler"),
    UPDATE("Modifier"),
    VALIDATE("Valider"),
    UPLOAD("Charger");

    private final String libelle;

    Action (String libelle){
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}
