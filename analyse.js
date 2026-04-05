// ── JWT helpers (Web Crypto API — beschikbaar in CF Workers) ─────────────────
const jwtSecret = async (env) => {
  const secret = (env && env.JWT_SECRET) || 'gvt-dev-secret-change-in-production';
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

const jwtSign = async (payload, env) => {
  const key = await jwtSecret(env);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = header + '.' + body;
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return data + '.' + sigB64;
};

const jwtVerify = async (token, env) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key = await jwtSecret(env);
    const data = parts[0] + '.' + parts[1];
    const sig = Uint8Array.from(
      atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );
    const ok = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
    if (!ok) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};

// ── Stripe webhook handtekening verificatie ───────────────────────────────────
const verifyStripeSignature = async (payload, sigHeader, secret) => {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    acc[k] = v;
    return acc;
  }, {});

  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;

  // Bescherm tegen replay attacks: max 5 minuten oud
  const diff = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (diff > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computed === signature;
};

// Rollen per actie
const ADMIN_ACTIES = new Set([
  'getKlanten',
  'setKlant',
  'delKlant',
  'updateKlantType',
  'setRapport',
  'setBasisscan',
  'setStresstest',
  'delRapport',
  'delBasisscan',
  'delStresstest',
  'delUpload',
  'setAnalyse',
  'setMaandoverzicht',
  'delMaandoverzicht',
]);

const KLANT_ACTIES = new Set([
  'getUploads',
  'getRapporten',
  'getBasisscans',
  'getStresstesten',
  'getMaandoverzichten',
  'getAnalyse',
  'upsertUpload',
  'stuurEmail',
]);

const PUBLIEK_ACTIES = new Set(['checkLogin', 'analyse', 'validateToken']);

const SUPABASE_URL = 'https://yhctamsjmbkkqhndaiov.supabase.co';

const sb = async (env, path, method = 'GET', body = null) => {
  const SUPABASE_KEY =
    (env && env.SUPABASE_KEY) || 'sb_publishable_0vdwwnPaC30Y-XcAoBZVjQ_ZJq7tvNs';

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: method === 'POST' ? 'return=representation' : '',
    },
  };

  if (body) opts.body = JSON.stringify(body);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Supabase fout (${r.status}): ${err}`);
  }

  const txt = await r.text();
  return txt ? JSON.parse(txt) : [];
};

// ── STRIPE WEBHOOK ────────────────────────────────────────────────────────────
export async function onRequestPost_stripeWebhook({ request, env }) {
  // Wordt aangeroepen via /api/stripe-webhook
  const cors = { 'Content-Type': 'application/json' };
  const webhookSecret = env && env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET niet ingesteld');
    return new Response(JSON.stringify({ error: 'Webhook secret ontbreekt' }), { status: 500, headers: cors });
  }

  const rawBody = await request.text();
  const sigHeader = request.headers.get('stripe-signature') || '';

  const geldig = await verifyStripeSignature(rawBody, sigHeader, webhookSecret);
  if (!geldig) {
    console.error('[stripe-webhook] Ongeldige handtekening');
    return new Response(JSON.stringify({ error: 'Ongeldige handtekening' }), { status: 400, headers: cors });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Ongeldig JSON' }), { status: 400, headers: cors });
  }

  // Alleen checkout.session.completed verwerken
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email || '';

    if (email) {
      try {
        // Zoek klant op e-mailadres
        const klanten = await sb(env, `klanten?email=eq.${encodeURIComponent(email)}`);

        if (klanten.length > 0) {
          const klant = klanten[0];
          // Zet klanttype om naar doorlichting
          await sb(env, `klanten?code=eq.${encodeURIComponent(klant.code)}`, 'PATCH', {
            klanttype: 'doorlichting',
          });
          console.log(`[stripe-webhook] ${klant.naam} (${email}) omgezet naar doorlichting`);
        } else {
          console.warn(`[stripe-webhook] Geen klant gevonden voor e-mail: ${email}`);
        }
      } catch (e) {
        console.error('[stripe-webhook] Supabase fout:', e.message);
        // Toch 200 teruggeven zodat Stripe niet blijft retrying
      }
    }
  }

  return new Response(JSON.stringify({ ontvangen: true }), { headers: cors });
}

export async function onRequestPost({ request, env }) {
  // Route naar stripe-webhook handler als het pad /api/stripe-webhook is
  const url = new URL(request.url);
  if (url.pathname === '/api/stripe-webhook') {
    return onRequestPost_stripeWebhook({ request, env });
  }

  const cors = {
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { actie } = body;

    // ── Auth: JWT verificatie + rolcontrole per actie ─────────────────────────
    let jwtPayload = null;
    if (!PUBLIEK_ACTIES.has(actie)) {
      const authHeader = request.headers.get('Authorization') || '';
      const jwtToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      jwtPayload = await jwtVerify(jwtToken, env);

      if (!jwtPayload) {
        return new Response(
          JSON.stringify({ error: { message: 'Niet ingelogd of sessie verlopen' } }),
          { status: 401, headers: cors }
        );
      }

      if (ADMIN_ACTIES.has(actie) && jwtPayload.type !== 'admin') {
        return new Response(
          JSON.stringify({ error: { message: 'Geen toegang — admin vereist' } }),
          { status: 403, headers: cors }
        );
      }
    }

    // ── AI ANALYSE ────────────────────────────────────────────────────────
    if (actie === 'analyse' || !actie) {
      const { prompt, max_tokens = 1500 } = body;
      const apiKey = env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: { message: 'API key ontbreekt' } }), {
          headers: cors,
        });
      }

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: cors });
    }

    // ── SESSIE VALIDATIE ─────────────────────────────────────────────────
    if (actie === 'validateToken') {
      const authHeader = request.headers.get('Authorization') || '';
      const jwtToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const payload = await jwtVerify(jwtToken, env);

      if (!payload) {
        return new Response(JSON.stringify({ valid: false }), { status: 401, headers: cors });
      }

      const nu = Math.floor(Date.now() / 1000);
      let token = jwtToken;

      if (payload.exp - nu < 7200) {
        const nieuweExp = nu + 8 * 3600;
        token = await jwtSign({ ...payload, exp: nieuweExp }, env);
      }

      return new Response(
        JSON.stringify({
          valid: true,
          type: payload.type,
          naam: payload.naam || null,
          token,
        }),
        { headers: cors }
      );
    }

    // ── LOGIN CHECK ──────────────────────────────────────────────────────
    if (actie === 'checkLogin') {
      const { code } = body;
      const adminCode = (env && env.ADMIN_CODE) || '';

      if (!adminCode) {
        return new Response(
          JSON.stringify({
            error: { message: 'ADMIN_CODE niet geconfigureerd als environment variable' },
          }),
          { headers: cors }
        );
      }

      if (code === adminCode) {
        const exp = Math.floor(Date.now() / 1000) + 8 * 3600;
        const token = await jwtSign({ type: 'admin', exp }, env);
        return new Response(JSON.stringify({ type: 'admin', token }), { headers: cors });
      }

      const klanten = await sb(env, 'klanten');
      const klant = Array.isArray(klanten) ? klanten.find((k) => k.code === code) : null;

      if (klant) {
        const exp = Math.floor(Date.now() / 1000) + 8 * 3600;
        const token = await jwtSign(
          { type: 'klant', code: klant.code, naam: klant.naam, exp },
          env
        );

        return new Response(
          JSON.stringify({
            type: 'klant',
            token,
            klant: {
              naam: klant.naam,
              email: klant.email || '',
              sector: klant.sector || '',
              klanttype: klant.klanttype || 'lead',
              code: klant.code,
            },
          }),
          { headers: cors }
        );
      }

      return new Response(JSON.stringify({ type: 'onbekend' }), { headers: cors });
    }

    // ── KLANTEN ───────────────────────────────────────────────────────────
    if (actie === 'getKlanten') {
      const data = await sb(env, 'klanten?order=aangemaakt.asc');
      return new Response(JSON.stringify(data), { headers: cors });
    }

    if (actie === 'setKlant') {
      const { naam, code, klanttype, email, sector } = body;
      await sb(env, 'klanten', 'POST', {
        naam,
        code,
        klanttype: klanttype || 'lead',
        email: email || '',
        sector: sector || '',
      });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'updateKlantType') {
      const { code, klanttype } = body;
      await sb(env, `klanten?code=eq.${encodeURIComponent(code)}`, 'PATCH', { klanttype });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delKlant') {
      const { code } = body;
      await sb(env, `klanten?code=eq.${encodeURIComponent(code)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── UPLOADS ───────────────────────────────────────────────────────────
    if (actie === 'getUploads') {
      const data = await sb(env, 'uploads?order=aangemaakt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }

    if (actie === 'upsertUpload') {
      const { bedrijf, periode, datum, sector, pdftekst } = body;
      const bestaand = await sb(
        env,
        `uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`
      );

      if (bestaand.length > 0) {
        await sb(
          env,
          `uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`,
          'PATCH',
          {
            datum,
            sector: sector || '',
            pdftekst: (pdftekst || '').substring(0, 80000),
          }
        );
      } else {
        await sb(env, 'uploads', 'POST', {
          bedrijf,
          periode,
          datum,
          sector: sector || '',
          pdftekst: (pdftekst || '').substring(0, 80000),
        });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delUpload') {
      const { bedrijf, periode } = body;
      await sb(
        env,
        `uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`,
        'DELETE'
      );
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── ANALYSES ──────────────────────────────────────────────────────────
    if (actie === 'getAnalyse') {
      const { sleutel } = body;
      const data = await sb(env, `analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);
      return new Response(JSON.stringify({ tekst: data[0]?.tekst || '' }), { headers: cors });
    }

    if (actie === 'setAnalyse') {
      const { sleutel, tekst } = body;
      const bestaand = await sb(env, `analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);

      if (bestaand.length > 0) {
        await sb(env, `analyses?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          tekst,
          bijgewerkt: new Date().toISOString(),
        });
      } else {
        await sb(env, 'analyses', 'POST', { sleutel, tekst });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── E-MAIL VIA SERVER ─────────────────────────────────────────────────
    if (actie === 'stuurEmail') {
      const { data: emailData } = body;
      const serviceId = (env && env.EMAILJS_SERVICE_ID) || '';
      const templateId = (env && env.EMAILJS_TEMPLATE_ID) || '';
      const pubKey = (env && env.EMAILJS_PUBLIC_KEY) || '';

      if (!serviceId || !templateId || !pubKey) {
        return new Response(
          JSON.stringify({ error: { message: 'EmailJS niet geconfigureerd op server' } }),
          { headers: cors }
        );
      }

      const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: pubKey,
          template_params: emailData,
        }),
      });

      if (!resp.ok) throw new Error('EmailJS fout: ' + resp.status);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── RAPPORTEN 1-PAGER ────────────────────────────────────────────────
    if (actie === 'getRapporten') {
      const data = await sb(env, 'rapporten');
      return new Response(JSON.stringify(data), { headers: cors });
    }

    if (actie === 'setRapport') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;
      if (!sleutel) {
        return new Response(
          JSON.stringify({ error: { message: 'setRapport: sleutel ontbreekt' } }),
          { headers: cors }
        );
      }

      const bestaand = await sb(env, `rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`);

      if (bestaand.length > 0) {
        await sb(env, `rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          html: (html || '').substring(0, 200000),
          gepubliceerd: gepubliceerd === true || gepubliceerd === 'true',
          datum,
          ...(pdf_url ? { pdf_url } : {}),
        });
      } else {
        await sb(env, 'rapporten', 'POST', {
          sleutel,
          html: (html || '').substring(0, 200000),
          gepubliceerd: gepubliceerd === true || gepubliceerd === 'true',
          datum,
          ...(pdf_url ? { pdf_url } : {}),
        });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delRapport') {
      const { sleutel } = body;
      await sb(env, `rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── BASISSCANS ───────────────────────────────────────────────────────
    if (actie === 'getBasisscans') {
      const data = await sb(env, 'basisscans');
      return new Response(JSON.stringify(data), { headers: cors });
    }

    if (actie === 'setBasisscan') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;
      const bestaand = await sb(env, `basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`);

      if (bestaand.length > 0) {
        await sb(env, `basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          html,
          gepubliceerd,
          datum,
          ...(pdf_url ? { pdf_url } : {}),
        });
      } else {
        await sb(env, 'basisscans', 'POST', {
          sleutel,
          html,
          gepubliceerd,
          datum,
          ...(pdf_url ? { pdf_url } : {}),
        });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delBasisscan') {
      const { sleutel } = body;
      await sb(env, `basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── STRESSTESTEN ─────────────────────────────────────────────────────
    if (actie === 'getStresstesten') {
      const all = await sb(env, 'basisscans');
      const stresstypes = ['cashflow', 'debiteuren', 'offerte'];
      const filtered = Array.isArray(all)
        ? all.filter((r) => stresstypes.some((t) => r.sleutel && r.sleutel.endsWith('-' + t)))
        : [];
      return new Response(JSON.stringify(filtered), { headers: cors });
    }

    if (actie === 'setStresstest') {
      const { sleutel, html, gepubliceerd, datum } = body;
      const bestaand = await sb(env, 'basisscans?sleutel=eq.' + encodeURIComponent(sleutel));
      const record = {
        sleutel,
        html,
        gepubliceerd: gepubliceerd || false,
        datum: datum || new Date().toISOString(),
      };

      if (bestaand.length > 0) {
        await sb(env, 'basisscans?sleutel=eq.' + encodeURIComponent(sleutel), 'PATCH', record);
      } else {
        await sb(env, 'basisscans', 'POST', record);
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delStresstest') {
      const { sleutel } = body;
      await sb(env, 'basisscans?sleutel=eq.' + encodeURIComponent(sleutel), 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── MAANDOVERZICHTEN ─────────────────────────────────────────────────
    if (actie === 'getMaandoverzichten') {
      const { bedrijf } = body;
      const filter = bedrijf ? `bedrijf=eq.${encodeURIComponent(bedrijf)}&` : '';
      const data = await sb(env, `maandoverzichten?${filter}order=periode.desc`);
      return new Response(JSON.stringify(data), { headers: cors });
    }

    if (actie === 'setMaandoverzicht') {
      const { bedrijf, periode, html, gepubliceerd, datum, omzet, brutomarge, debiteurendagen, solvabiliteit, nettoresultaat } = body;

      const bestaand = await sb(
        env,
        `maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`
      );

      const record = {
        bedrijf, periode, html,
        gepubliceerd: gepubliceerd || false,
        datum: datum || '',
        omzet: omzet || null,
        brutomarge: brutomarge || null,
        debiteurendagen: debiteurendagen || null,
        solvabiliteit: solvabiliteit || null,
        nettoresultaat: nettoresultaat || null,
        bijgewerkt: new Date().toISOString(),
      };

      if (bestaand.length > 0) {
        await sb(env, `maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'PATCH', record);
      } else {
        await sb(env, 'maandoverzichten', 'POST', record);
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'delMaandoverzicht') {
      const { bedrijf, periode } = body;
      await sb(env, `maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(
      JSON.stringify({ error: { message: 'Onbekende actie: ' + actie } }),
      { headers: cors }
    );
  } catch (e) {
    console.error('[analyse.js] fout:', e.message);
    return new Response(JSON.stringify({ error: { message: e.message } }), {
      status: 500,
      headers: cors,
    });
  }
}

export async function onRequestOptions({ env }) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
