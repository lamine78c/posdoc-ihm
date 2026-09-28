INSERT INTO faq(id, path, question, answer, status, view_count, created_by, updated_by, created_at, updated_at)
VALUES (1, '/admin/habilitation', 'Comment ça marche ?', '', 'ENABLED', 7, 'AC75092074', 'AC75092074', '2025-12-02 00:00:00', '2025-12-02 00:00:00'),
       (2, '/suivi/facturation#facturation détaillée', 'A quoi ça sert ?', '', 'DRAFT', 4, 'AC75092074', 'AC75092074', '2025-12-02 00:00:00', '2025-12-02 00:00:00');

INSERT INTO faq_exchange(id, faq_id, author, message, created_at)
VALUES (1, 1, 'AC75092074', 'Message test', '2025-12-03 00:00:00'),
       (2, 1, 'AC75092074', 'Réponse test', '2025-12-03 01:00:00'),
       (3, 2, 'AC75092074', 'Message sur la 2e FAQ', '2025-12-03 02:00:00');

INSERT INTO faq_notification(id, faq_id, recipient_id, created_at)
VALUES (1, 1, null, '2025-12-03 00:00:00'),
       (2, 1, 'AC75092074', '2025-12-03 01:00:00');
