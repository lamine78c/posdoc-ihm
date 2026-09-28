-- Insert test data for production flux
INSERT INTO cereus.dca_production_flux (id, nom_archive_retour, date_production, date_poste, nom_fichier_retour, nombre_plis_fabriques)
VALUES (1, 'archive_1.zip', '2026-04-01 10:00:00', '2026-04-02 09:00:00', 'retour_1.txt', 100);

INSERT INTO cereus.dca_production_flux (id, nom_archive_retour, date_production, date_poste, nom_fichier_retour, nombre_plis_fabriques)
VALUES (2, 'archive_2.zip', '2026-04-03 10:00:00', '2026-04-04 09:00:00', 'retour_2.txt', 200);

INSERT INTO cereus.dca_production_flux (id, nom_archive_retour, date_production, date_poste, nom_fichier_retour, nombre_plis_fabriques)
VALUES (3, 'archive_3.zip', '2026-04-05 10:00:00', '2026-04-06 09:00:00', 'retour_3.txt', 300);

-- Pli details pour tester le count dans la sous-requête getProdFluxWithdetails
INSERT INTO cereus.dca_pli_detail_production (id, id_production_flux) VALUES (1, 1);
INSERT INTO cereus.dca_pli_detail_production (id, id_production_flux) VALUES (2, 1);
INSERT INTO cereus.dca_pli_detail_production (id, id_production_flux) VALUES (3, 2);
