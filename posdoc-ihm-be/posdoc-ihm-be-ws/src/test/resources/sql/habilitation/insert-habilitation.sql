-- Insert test data for habilitations
INSERT INTO habili(id, parent_id, s97_typeit, text, ordre)
VALUES (1, null, 'M', 'Administration', 1),
       (2, null, 'M', 'Suivi', 2),
       (3, null, 'M', 'Référentiels', 3),
       (11, 1, 'S', 'Habilitations', 1),
       (12, 1, 'S', 'Environnements', 2),
       (13, 1, 'S', 'Utilisateurs', 3),
       (21, 2, 'S', 'Editions', 1),
       (22, 2, 'S', 'Facturation', 2),
       (23, 2, 'S', 'Production', 3),
       (31, 3, 'S', 'Clients', 1),
       (32, 3, 'S', 'Imprimés', 2);
