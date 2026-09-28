INSERT INTO gendoc(c56_datdem, c56_numdem, s56_codenv, s56_codorg, s56_codapp, s56_percod, s56_numcom, s56_codcom, s56_codfic,
                   s56_coddoc, s56_refdem, s56_typact, b56_imprim, s56_docsta, s56_docinf, d56_ddodeb, d56_ddofin, d56_ddosus,
                   n56_tpscom, b56_retour, d56_ddoimp, d56_ddoexp)
VALUES ('20250701', 40, 'P', '117', 'PNR', null, null, 'ADRH', '',
    'RSCAE', 'REST_F20190830_31129', '0', 0, 'S', '3',
    '2025-07-01 11:08:27.736', null, '2025-07-01 11:08:28.312', 0, 0, null, null),
    ('20250701', 41, 'P', '116', 'PNR', null, null, 'ABCD', '',
    'RSCAE', 'REST_F20190830_31130', '0', 0, 'S', '2',
    '2025-07-01 12:08:27.736', null, '2025-07-01 12:08:28.312', 0, 0, null, null),
    ('20250701', 42, 'P', '115', 'PNR', null, null, 'AZED', '',
    'RSCAE', 'REST_F20190830_31131', '0', 0, 'S', '1',
    '2025-07-01 13:08:27.736', null, '2025-07-01 13:08:28.312', 0, 0, null, null),
    ('20250701', 43, 'P', '117', 'SNV2', '251031-00', '00', 'AD04', 'L00',
    'RSCAE', 'REST_F20190830_31131', '0', 0, 'S', '1',
    '2025-07-01 13:08:27.736', null, '2025-07-01 13:08:28.312', 0, 0, null, null);

INSERT INTO stadoc(c72_docinf, s72_libinf)
VALUES ('1', 'stadoc1'),
    ('2', 'stadoc2'),
    ('3', 'stadoc3');

INSERT INTO sitorg(C74_Codorg, S74_Sitatt, S74_Sitscr)
VALUES ('117', 'CIRTIL', 'CIRTIL'),
    ('116', 'CIRTIL', 'CIRTIL'),
    ('115', 'CIRTIL', 'CIRTIL');