-- Organisme générique utilisé par getRessourcesGamSitRes
INSERT INTO Params (C32_Codpar, S32_Valpar, S32_Libpar) VALUES ('OGUORG', '999', 'Organisme de référence OGUR');

INSERT INTO organi (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit) VALUES
    ('750', 'URSSAF ILE DE FRANCE', NULL, NULL, NULL, NULL, 'R', '', 'CIRTIL'),
    ('117', 'URSSAF REGIONALE ILE DE FRANCE', NULL, NULL, NULL, NULL, 'R', '117', 'CIRSO'),
    ('770', 'URSSAF DE SEINE ET MARNE', NULL, NULL, NULL, NULL, 'R', '117', 'CIRSO'),
    ('999', 'URSSAF DE REFERENCE (GESLOT)', NULL, NULL, NULL, NULL, 'R', '', 'CIRTIL');

INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil) VALUES
    ('P', '750', 'SNV2', 'FT', 'CIRTIL', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'NODIST_BA',
    'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null),
    ('P', '750', 'SNV2', 'FT', 'CIRSO', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'NODIST_BA',
    'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null),
    ('P', '117', 'SNV2', 'FT', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '117', 'SNV2', 'FT', 'CIRSO', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '770', 'SNV2', 'FC', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '770', 'SNV2', 'FC', 'CIRSO', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '999', 'SNV2', 'FC', 'CIRTIL', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '999', 'SNV2', 'FC', 'CIRSO', 'COALA', 'COALA', 'FT - DEPOT FORMAT TXT pour COALA', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, null),
    ('P', '117', 'SNV2', 'FT', 'CIRSO', 'RESADM', 'COALA', 'Ressource reservee au profil administrateur', 'C', 'B', 'COALA_BA',
    'RECAP_BA', 'transfert', 'transfert', '-', 0, '', '', 0, 0, 'ADM');