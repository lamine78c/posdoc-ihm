-- Commande prérequise pour la création de papaads (verify sur codeCommande)
INSERT INTO comman (c05_codenv, c05_codorg, c05_codapp, c05_codcom, s05_libcom)
VALUES ('P', '117', 'APP1', 'COM1', 'Commande Test Papaad');

-- Insert test data for papaads
INSERT INTO papaad (c79_codcom, c79_codfic, c79_cnotif, s79_libpaa, b79_period, s79_codrnd, s79_apppro, s79_typhas, s79_format, s79_isurib, b79_nstruc, b79_imprim, b79_huissi, b79_numnot, b79_strraf, b79_contra, b79_medele, b79_idtbcc)
VALUES ('COM1', 'FIC01', 'NOT1', 'Papaad Test 1', 0, 'RND1', 'APP1', 'HAS1', 'FMT1', 'N', 0, 0, 0, 0, 0, 0, 0, 0);

INSERT INTO papaad (c79_codcom, c79_codfic, c79_cnotif, s79_libpaa, b79_period, s79_codrnd, s79_apppro, s79_typhas, s79_format, s79_isurib, b79_nstruc, b79_imprim, b79_huissi, b79_numnot, b79_strraf, b79_contra, b79_medele, b79_idtbcc)
VALUES ('COM1', 'FIC02', 'NOT2', 'Papaad Test 2', 0, 'RND2', 'APP1', 'HAS2', 'FMT2', 'N', 0, 0, 0, 0, 0, 0, 0, 0);

INSERT INTO papaad (c79_codcom, c79_codfic, c79_cnotif, s79_libpaa, b79_period, s79_codrnd, s79_apppro, s79_typhas, s79_format, s79_isurib, b79_nstruc, b79_imprim, b79_huissi, b79_numnot, b79_strraf, b79_contra, b79_medele, b79_idtbcc)
VALUES ('COM1', 'FIC03', 'NOT3', 'Papaad Test 3', 0, 'RND3', 'APP1', 'HAS3', 'FMT3', 'N', 0, 0, 0, 0, 0, 0, 0, 0);
