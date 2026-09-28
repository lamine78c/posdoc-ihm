-- Insert test data for utilisateurs
INSERT INTO utilis(c99_codusr, s99_libusr, s99_profil, s99_passwd, b99_actif, s99_codenv, s99_codsit)
VALUES ('USER001', 'Utilisateur Test 1', 'ADMIN', 'password123', 1, 'P', 'SITE01'),
       ('USER002', 'Utilisateur Test 2', 'USER', 'password456', 1, 'P', 'SITE02'),
       ('USER003', 'Utilisateur Test 3', 'ADMIN', 'password789', 1, 'T', 'SITE01'),
       ('USER004', 'Utilisateur Test 4', 'USER', 'password000', 0, 'T', 'SITE02'),
       ('USER005', 'Utilisateur Test 5', 'USER', 'password111', 1, 'P', null);
