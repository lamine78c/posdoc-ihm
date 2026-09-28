INSERT INTO habili (id, parent_id, s97_typeit, text, ordre) values
(1, null, 'M', 'Administration', 1),
(2, 1, 'S', 'Habilitations', 1),
(3, 1, 'S', 'Organisme', 1),
(4, 3, 'S', 'Organismes', 1),
(5, 3, 'S', 'Régions', 2),
(6, 3, 'S', 'Sites', 3);

INSERT INTO path_habili (path, habili_id) values
('/admin/habilitation', 2),
('/admin/organisme#organismes', 4),
('/admin/organisme#régions', 5),
('/admin/organisme#sites', 6);

INSERT INTO profile(code, libelle)
VALUES ('NAT_ADMINISTRATEUR', 'Administrateur national'),
       ('GESTION', 'Gestionnaire'),
       ('CNE', 'CNE');

INSERT INTO profile_habili(profile_code, habili_id)
VALUES ('NAT_ADMINISTRATEUR', 1),
       ('NAT_ADMINISTRATEUR', 2),
       ('NAT_ADMINISTRATEUR', 3),
       ('NAT_ADMINISTRATEUR', 4),
       ('NAT_ADMINISTRATEUR', 5),
       ('NAT_ADMINISTRATEUR', 6),
       ('GESTION', 1),
       ('GESTION', 2),
       ('CNE', 1),
       ('CNE', 3),
       ('CNE', 4),
       ('CNE', 5),
       ('CNE', 6);

