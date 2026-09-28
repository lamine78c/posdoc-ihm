INSERT INTO profile(code, libelle)
VALUES ('NAT_ADMINISTRATEUR', 'Administrateur national'),
       ('GESTION', 'Gestionnaire'),
       ('CNE', 'CNE');

INSERT INTO habili(id, parent_id, s97_typeit, text, ordre)
VALUES (1, null, 'M', 'Administration', 1),
       (2, null, 'M', 'Suivi', 2),
       (11, 1, 'S', 'Habilitations', 1),
       (12, 1, 'S', 'Environnements', 2),
       (21, 2, 'S', 'Editions', 1),
       (22, 2, 'S', 'Facturation', 2);

INSERT INTO profile_habili(profile_code, habili_id)
VALUES ('NAT_ADMINISTRATEUR', 1),
       ('NAT_ADMINISTRATEUR', 2),
       ('NAT_ADMINISTRATEUR', 11),
       ('NAT_ADMINISTRATEUR', 12),
       ('NAT_ADMINISTRATEUR', 21),
       ('NAT_ADMINISTRATEUR', 22),
       ('GESTION', 2),
       ('GESTION', 21),
       ('GESTION', 22),
       ('CNE', 2),
       ('CNE', 21),
       ('CNE', 22);
