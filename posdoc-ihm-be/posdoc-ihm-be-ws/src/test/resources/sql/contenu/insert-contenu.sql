DELETE FROM contenu;
DELETE FROM contenus_regions;
DELETE FROM region;
DELETE FROM organi;


INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('116','REGION ILE DE FRANCE TGE');
INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('117','REGION ILE DE FRANCE');
INSERT INTO Region (C62_Codreg,S62_Libreg) VALUES ('217','REGION CHAMPAGNE ARDENNE');

INSERT INTO contenu(id, titre, message, activation, expiration)
	VALUES (1, 'titre 1', 'text du message un', '2023-11-10 10:00:00', '2099-11-11 10:00:00');
INSERT INTO contenu(id, titre, message, activation, expiration)
    VALUES (2, 'titre 2', 'text du message deux', '2023-11-10 10:00:00', '2099-11-11 10:00:00');

INSERT INTO contenus_regions(contenu_id, region_code) VALUES (1, '116');
INSERT INTO contenus_regions(contenu_id, region_code) VALUES (2, '217');

INSERT INTO organi(c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('116', 'URSSAF REGIONALE ILE DE FRANCE', '', '', '', '', 'R', '116', 'CIRSO');