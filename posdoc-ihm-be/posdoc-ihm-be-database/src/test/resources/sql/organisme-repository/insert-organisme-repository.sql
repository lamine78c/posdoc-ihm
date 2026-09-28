INSERT INTO ORGANI (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit) VALUES
    ('100', 'URSSAF DE L AUBE', NULL, NULL, NULL, NULL, 'R', '217', ''),
    ('210', 'URSSAF DE LA COTE D OR (DIJON)', NULL, NULL, NULL, NULL, 'R', '267', ''),
    ('750', 'URSSAF ILE DE FRANCE', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('800', 'ORGANISME TEST APPLI SEULE', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('850', 'ORGANISME TEST MULTI ENFANTS', NULL, NULL, NULL, NULL, 'R', '117', ''),
    ('900', 'ORGANISME TEST APPLI ET DESTINATAIRE', NULL, NULL, NULL, NULL, 'R', '117', '');

INSERT INTO applis(c04_codenv, c04_codorg, c04_codapp, s04_codsys, s04_libapp, s04_typref) VALUES
    ('T', '800', 'SNV2', 'L', 'Application 800', 'A'),
    ('T', '900', 'SNV2', 'L', 'Application 900', 'A'),
    ('T', '850', 'SNV2', 'L', 'Application 850 #1', 'A'),
    ('T', '850', 'MAS',  'L', 'Application 850 #2', 'A'),
    ('A', '850', 'SNV2', 'L', 'Application 850 #3', 'A');

INSERT INTO destin(c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES
    ('100', 'addre', 'adresse', 'ref adresse'),
    ('750', 'addre', 'adresse', 'ref adresse'),
    ('900', 'addre', 'adresse 900', 'ref 900'),
    ('850', 'addre', 'adresse 850 #1', 'ref 850 #1'),
    ('850', 'addrb', 'adresse 850 #2', 'ref 850 #2');
