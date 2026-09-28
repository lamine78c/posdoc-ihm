INSERT INTO Parres (C36_Refdis,S36_Libdis,S36_Logtrf,S36_Comdis)
VALUES ('ABORT','Commande ABORT','B','FIC("/adlrun/shref/s03_dis_exit.sh")'),
       ('ADL_PLATYPUS','Distribution des fichiers LST pour PLATYPUS','F','"binary;passive;mkdir /adldatas/platytest/";CODORG;"/";CODCOM;";cd /adldatas/platytest/";CODORG;"/";CODCOM;";put ";F_PRODUIT;" ";LCASE(CODENV);"_";CODORG;"_";LCASE(ESP(CODCOM));".";LCASE(ESP(CODFIC));".";DROITE(DATJOU,6);TIMJOU;".lst"'),
       ('BUROTIK_10','Transfert Bureautique','F','"binary;mkdir /bureautique/Fbureautique/";CODCOM;";put ";F_PRODUIT;" /bureautique/Fbureautique/";CODCOM;"/";LCASE(CODCOM);".";LCASE(ESP(CODFIC));".";DATJOU;TIMJOU;NUMCOM');
INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
                    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
                    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil)
VALUES ('T', '750', 'SNV2', 'MA', 'CIRTIL', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'ABORT',
       'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null),
       ('P', '100', 'TEST', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'ABORT',
       'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
       ('D', '904', 'SNV2', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'ADL_PLATYPUS',
       'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null);