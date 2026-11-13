
const { db, reply, configured } = require('./_common');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return reply(res, 405, { error: 'Metodo non consentito' });
  }

  if (!configured()) {
    return reply(res, 503, { error: 'Servizio in configurazione' });
  }

  if (process.env.ORDERS_ENABLED !== 'true') {
    return reply(res, 503, {
      error: 'Richieste temporaneamente non attive.'
    });
  }

  const x = req.body || {};

  if (x.website) {
    return reply(res, 200, { id: '00000000' });
  }

  if (x.adult !== true || x.privacy !== true) {
    return reply(res, 400, {
      error: 'Conferma obbligatoria mancante'
    });
  }

  const clean = (v, n) =>
    typeof v === 'string' ? v.trim().slice(0, n) : '';

  const email = clean(x.customer_email, 254);
  const name = clean(x.child_name, 40);
  const plan = x.package_type;

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !name ||
    !['base', 'premium'].includes(plan)
  ) {
    return reply(res, 400, {
      error: 'Controlla i dati obbligatori'
    });
  }

  let order;

  try {
    const result = await db('orders?select=id', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        customer_email: email,
        child_name: name,
        name_pronunciation: clean(x.name_pronunciation, 60),
        child_hobby: clean(x.child_hobby, 90),
        dedication: clean(x.dedication, 250),
        package_type: plan,
        price_cents: plan === 'base' ? 990 : 1499,
        status: 'new'
      })
    });

    order = result[0];

    if (!order || !order.id) {
      throw new Error('ID ordine non restituito');
    }
  } catch (e) {
    console.error('Errore salvataggio:', e.message);
    return reply(res, 500, {
      error: 'Errore durante il salvataggio'
    });
  }

  // Notifica email: non blocca il salvataggio dell'ordine.
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.NOTIFICATION_EMAIL;

  if (apiKey && recipient) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Magia di Natale AI <onboarding@resend.dev>',
          to: [recipient],
          subject: 'Nuova richiesta - Magia di Natale AI',
          text:
            'Hai ricevuto una nuova richiesta!\n\n' +
            'Pacchetto: ' +
            (plan === 'base' ? 'Messaggio Magico' : 'Natale da Sogno') +
            '\nImporto: ' +
            (plan === 'base' ? '9,90 EUR' : '14,99 EUR') +
            '\nID ordine: ' + order.id +
            '\n\nAccedi al pannello amministratore:\n' +
            'https://babbo-natale.vercel.app/admin.html'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Errore Resend:',
          response.status,
          errorText.slice(0, 500)
        );
      }
    } catch (e) {
      console.error('Errore notifica email:', e.message);
    }
  } else {
    console.warn('Notifiche email non configurate');
  }

  return reply(res, 201, { id: order.id });
};
