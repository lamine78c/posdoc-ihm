-- Table format pour les tests de base
INSERT INTO format (c17_typfor,s17_libfor) VALUES ('T','type');

-- Table Params pour getRessourcesByCodeEnvOrgsApp (avec majuscule)
INSERT INTO Params (C32_Codpar, S32_Valpar, S32_Libpar) VALUES ('OGUORG', '999', 'Code organisme de référence');

-- Table organi pour les organismes
INSERT INTO organi (C00_Codorg, S00_Liborg, S00_Adres1, S00_Adres2, S00_Adres3, S00_Adres4, S00_Typorg, S00_Codreg, S00_Codsit) VALUES
    ('117', 'URSSAF TEST 117', NULL, NULL, NULL, NULL, 'R', '117', 'CIRSO'),
    ('118', 'URSSAF TEST 118', NULL, NULL, NULL, NULL, 'R', '118', 'CIRTIL'),
    ('999', 'URSSAF DE REFERENCE', NULL, NULL, NULL, NULL, 'R', '', 'CIRTIL');

-- Table ressou pour getRessourcesByCodeEnvOrgsApp
INSERT INTO ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
    s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
    s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil) VALUES
    ('P', '117', 'SNV2', 'FT', 'CIRSO', 'RES01', 'COALA', 'Ressource Test 1', 'C', 'B', 'COALA_BA', 'RECAP_BA', '', '', '-', 0, '', '', 0, 0, NULL),
    ('P', '999', 'SNV2', 'FT', 'CIRTIL', 'RES02', 'COALA', 'Ressource Test 2', 'C', 'B', 'COALA_BA', 'RECAP_BA', '', '', '-', 0, '', '', 0, 0, NULL),
    ('P', '118', 'SNV2', 'FC', 'CIRSO', 'RES03', 'COALA', 'Ressource Test 3', 'C', 'B', 'COALA_BA', 'RECAP_BA', '', '', '-', 0, '', '', 0, 0, 'ADM');

-- Table destin pour getCodeDestinatairesByCodeOrgs
INSERT INTO destin(c10_codorg, c10_coddes, s10_libdes, s10_refpri) VALUES
    ('117', 'DES01', 'Destinataire 1', 'REF01'),
    ('117', 'DES02', 'Destinataire 2', 'REF02'),
    ('118', 'DES03', 'Destinataire 3', 'REF03');