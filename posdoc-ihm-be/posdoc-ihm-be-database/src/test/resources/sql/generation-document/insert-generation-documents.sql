-- Insérer des données dans la table `sitorg` (SiteOrganismeEntity)
INSERT INTO public.sitorg (c74_codorg, s74_sitatt, s74_sitscr) VALUES
                                                            ('OR1', 'SITE_A', 'PROD_A'),
                                                            ('OR2', 'SITE_B', 'PROD_B');

-- Insérer des données dans la table `stadoc` (StaDocEntity)
INSERT INTO public.stadoc (c72_docinf, s72_libinf) VALUES
                                                ('F1', 'Document Info 1'),
                                                ('F2', 'Document Info 2');

-- Insérer des données dans la table `gendoc` (GenDocEntity) avec clé composite
INSERT INTO public.gendoc (
    c56_datdem, c56_numdem, -- Clé composite
    s56_codenv, s56_codorg, s56_codapp, s56_percod, s56_numcom, s56_codcom, s56_codfic, s56_coddoc,
    s56_refdem, s56_typact, b56_imprim, s56_docsta, s56_docinf,
    d56_ddodeb, d56_ddofin, d56_ddosus, n56_tpscom,
    b56_retour, d56_ddoimp, d56_ddoexp
)
VALUES ('20240523', 40, 'P', '117', 'PNR', null, null, '', '', 'RSCAE', 'REST_F20190830_31129', '0', 0, 'S', '8',
        '2024-05-23 11:08:27.736', null, '2024-05-23 11:08:28.312', 0, 0, null, null),
       ('20240201', 1001, 'T', 'OR1', 'PNR', null, null, '', '', 'RSCAE', 'REST_F20190830_31129', '0', 1, 'S', 'F1',
        '2024-05-23 11:08:27.736', null, '2024-05-23 11:08:28.312', 0, 0, null, null),
       ('20240315', 1002, 'V', 'OR2', 'PNR', null, null, '', '', 'RSCAE', 'REST_F20190830_31128', '1', 1, 'S', 'F2',
        '2024-05-23 11:08:27.736', null, '2024-05-23 11:08:28.312', 0, 0, null, null);
