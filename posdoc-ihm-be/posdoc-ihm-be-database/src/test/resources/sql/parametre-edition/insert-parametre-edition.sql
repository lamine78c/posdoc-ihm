-- Insertion des données pour les tests de ParametreEditionPersistenceImpl

-- Table params (pour le paramètre OGUORG)
INSERT INTO params (c32_codpar, s32_valpar, s32_libpar)
VALUES ('OGUORG', '999', 'Organisme de référence OGUR');

-- Table parcle (paramètres édition)
INSERT INTO parcle (c37_refcle, s37_typfor, s37_libcle, n37_numlig, n37_numcol, n37_lgncle)
VALUES ('REF001', 'PDF', 'Référence édition 1', 1, 1, 100),
       ('REF002', 'PDF', 'Référence édition 2', 2, 1, 150),
       ('REF003', 'XML', 'Référence édition 3', 1, 2, 200),
       ('REF004', 'TXT', 'Référence édition 4', 3, 1, 120);

-- Table enviro
INSERT INTO enviro (c01_codenv, s01_libenv)
VALUES ('P', 'Production'),
       ('T', 'Test'),
       ('D', 'Développement');

-- Table organi
INSERT INTO organi (c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('999', 'ORGANISME OGUR', 'Adresse 1', NULL, NULL, NULL, 'N', '117', 'CIRTIL'),
       ('750', 'URSSAF ILE DE FRANCE', 'Adresse IDF', NULL, NULL, NULL, 'R', '117', 'CIRTIL'),
       ('100', 'URSSAF TEST', 'Adresse TEST', NULL, NULL, NULL, 'R', '217', 'CIRTIL'),
       ('210', 'URSSAF DIJON', 'Adresse Dijon', NULL, NULL, NULL, 'R', '267', 'CIRTIL');

-- Table ressou (ressources)
-- c08_codenv: char(1), c08_codorg: varchar(3), c08_codapp: varchar(4), c08_codgam: varchar(2)
-- c08_codsit: varchar(6), c08_codres: varchar(8), s08_codser: varchar(8)
-- s08_typres: char(1), s08_logtrf: char(1), s08_compro: varchar(12), s08_comlia: varchar(12)
-- s08_userid: varchar(12), s08_passwd: varchar(12), s08_typfus: char(1), s08_profil: varchar(4)
INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
                    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
                    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil)
VALUES ('P', '999', 'AP1', 'G1', 'CIRTIL', 'RES001', 'SRV001',
        'Ressource test 1', 'C', 'B', 'COMP1', 'LIA1', 'user1', 'pass1',
        '-', 0, '', '', 0, 0, NULL),
       ('P', '750', 'AP1', 'G1', 'CIRTIL', 'RES002', 'SRV002',
        'Ressource test 2', 'C', 'B', 'COMP2', 'LIA2', 'user2', 'pass2',
        '-', 0, '', '', 0, 0, NULL),
       ('P', '100', 'AP1', 'G1', 'CIRTIL', 'RES003', 'SRV003',
        'Ressource test 3', 'C', 'B', 'COMP3', 'LIA3', 'user3', 'pass3',
        '-', 0, '', '', 0, 0, NULL),
       ('P', '210', 'AP1', 'G1', 'CIRTIL', 'RES004', 'SRV004',
        'Ressource test 4', 'C', 'B', 'COMP4', 'LIA4', 'user4', 'pass4',
        '-', 0, '', '', 0, 0, 'ADM'),
       ('T', '999', 'AP2', 'G2', 'CIRTIL', 'RES005', 'SRV005',
        'Ressource test 5', 'C', 'B', 'COMP5', 'LIA5', 'user5', 'pass5',
        '-', 0, '', '', 0, 0, NULL),
       ('T', '750', 'AP2', 'G2', 'CIRTIL', 'RES006', 'SRV006',
        'Ressource test 6', 'C', 'B', 'COMP6', 'LIA6', 'user6', 'pass6',
        '-', 0, '', '', 0, 0, NULL);

-- Table destin (destinataires)
-- c10_codorg: varchar(3), c10_coddes: varchar(8), s10_refpri: varchar(12)
INSERT INTO destin (c10_codorg, c10_coddes, s10_libdes, s10_refpri)
VALUES ('750', 'DEST001', 'Destinataire 1 pour 750', 'REF750-1'),
       ('100', 'DEST002', 'Destinataire 2 pour 100', 'REF100-1'),
       ('210', 'DEST003', 'Destinataire 3 pour 210', 'REF210-1'),
       ('999', 'DEST004', 'Destinataire 4 pour 999', 'REF999-1');
