-- Créer les tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS notice_pdf (
    codnot VARCHAR(10) PRIMARY KEY,
    pdf_file_path VARCHAR(500),
    upload_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS utilog (
    c69_codulo INTEGER NOT NULL,
    s69_codsta VARCHAR(32) NOT NULL DEFAULT '',
    s69_codusr VARCHAR(12) NOT NULL DEFAULT '',
    s69_formid VARCHAR(100) NOT NULL DEFAULT '',
    d69_datulo TIMESTAMP,
    s69_action VARCHAR(32) NOT NULL DEFAULT '',
    s69_params text,
    b69_result smallint NOT NULL DEFAULT '1',
    s69_erreur text,
    PRIMARY KEY (c69_codulo)
);

-- Notices actives (perime = 0)
INSERT INTO notice(c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES
    ('CNAV', 'Notice CNAV Active', 'ED1', 10, 'L', '2024-10-10', 0, 'CIRSO'),
    ('URSSAF1', 'Notice URSSAF Active', 'ED2', 20, 'R', '2024-12-01', 0, 'CIRTIL'),
    ('CESU1', 'Notice CESU Active', 'ED3', 15, 'L', '2025-01-15', 0, 'CIRSO');

-- Notices périmées (perime = 1)
INSERT INTO notice(c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES
    ('OLD1', 'Notice périmée 1', 'ED4', 5, 'L', '2020-01-01', 1, 'CIRSO'),
    ('OLD2', 'Notice périmée 2', 'ED5', 8, 'R', '2021-06-15', 1, 'CIRTIL');

-- Notice à supprimer pour les tests
INSERT INTO notice(c26_codnot, s26_libnot, s26_fornot, n26_poinot, s26_pornot, d26_dnotir, b26_perime, s26_codsit)
VALUES
    ('TODLT', 'Notice à supprimer', 'ED6', 12, 'L', '2024-01-01', 0, 'CIRSO');

-- Genot pour tester getNoticesOccurrenceApplication
INSERT INTO gennot(c28_codenv, c28_codorg, c28_codapp, c28_percod, c28_codcom, c28_numcom, c28_codfic, c28_codnot, n28_poinot)
VALUES
    ('P', '117', 'SNV2', '251031-00', 'AD04', '00', 'L00', 'CNAV', 10),
    ('P', '117', 'SNV2', '251031-00', 'AD04', '00', 'L01', 'URSSAF1', 20);

-- Note: La table utilog n'est PAS pré-remplie car elle est gérée automatiquement
-- par l'annotation @Historisable qui insère les logs lors des opérations CRUD
