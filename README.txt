MAGIA DI NATALE AI — SITO + PANNELLO SUPABASE

Caricare TUTTI i file e la cartella api/ nel repository GitHub, mantenendo i percorsi.
Vercel > Project > Settings > Environment Variables (Production):
SUPABASE_URL = URL del progetto Supabase (https://....supabase.co)
SUPABASE_ANON_KEY = chiave pubblica anon/publishable del progetto
SUPABASE_SERVICE_ROLE_KEY = chiave segreta service_role (SOLO VERCEL, MAI nel sito)
ORDERS_ENABLED = false (fino al completamento privacy e test; poi true)

Vercel deve essere collegato a questo repository, framework Other, root directory predefinita.
Dopo il deploy: /admin.html > login con email/password dell'utente Auth già inserito in public.admins.
Il modulo pubblico è intenzionalmente BLOCCATO finché ORDERS_ENABLED non è true.

Prima di attivare:
1. Completare informativa privacy e dati titolare nel sito. Non raccogliere dati dei minori senza base giuridica.
2. Verificare legalmente la gestione commerciale, informazioni precontrattuali e pagamenti prima di vendere.
3. Implementare rate limit/CAPTCHA server-side e protezione antiabuso prima di traffico pubblico.
4. Eseguire test invio richiesta e lettura dal pannello.
5. Nessuna email automatica al titolare è ancora configurata; controllare il pannello manualmente.
6. Il pulsante "Invia richiesta" non richiede né incassa pagamenti.

SICUREZZA: la chiave service_role non deve mai finire in GitHub o HTML.
