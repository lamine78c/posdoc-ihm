INSERT INTO contenu(id, titre, message, activation, expiration)
VALUES (1, 'Test', '<p>Message de test</p>', '2025-08-05 00:00:00', '2099-09-05 00:00:00');

INSERT INTO contenus_regions(contenu_id, region_code)
VALUES (1, '117');

INSERT INTO organi(c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('117', 'URSSAF REGIONALE ILE DE FRANCE', '', '', '', '', 'R', '117', 'CIRSO');