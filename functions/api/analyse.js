// ── JWT helpers (Web Crypto API — beschikbaar in CF Workers) ─────────────────
const jwtSecret = async (env) => {
  const secret = (env && env.JWT_SECRET) || 'gvt-dev-secret-change-in-production';
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']
  );
};

const jwtSign = async (payload, env) => {
  const key = await jwtSecret(env);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g,'');
  const body   = btoa(JSON.stringify(payload)).replace(/=/g,'');
  const data   = header + '.' + body;
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return data + '.' + sigB64;
};

const jwtVerify = async (token, env) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key  = await jwtSecret(env);
    const data = parts[0] + '.' + parts[1];
    const sig  = Uint8Array.from(atob(parts[2].replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
    const ok   = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
    if (!ok) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null;
    return payload;
  } catch { return null; }
};

// Rollen per actie
const ADMIN_ACTIES = new Set(['getKlanten','setKlant','delKlant','updateKlantType',
  'setRapport','setBasisscan','setStresstest','delRapport','delBasisscan','delStresstest',
  'delUpload','setAnalyse','setMaandoverzicht','delMaandoverzicht']);
const KLANT_ACTIES = new Set(['getUploads','getRapporten','getBasisscans','getStresstesten',
  'getMaandoverzichten','getAnalyse','upsertUpload','stuurEmail']);
const PUBLIEK_ACTIES = new Set(['checkLogin','analyse','validateToken']);

// functions/api/analyse.js — Groen van Texel
// Cloudflare Pages Function — alle API calls

const SUPABASE_URL = 'https://...supabase.co';

const sb = async (env, path, method = 'GET', body = null) => {
  const SUPABASE_KEY = env.SUPABASE_KEY || 'sb_publishable_...';

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : '',
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

const sb = async (path, method = 'GET', body = null) => {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : '',
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

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
        return new Response(JSON.stringify({ error: { message: 'Niet ingelogd of sessie verlopen' } }), { status: 401, headers: cors });
      }
      if (ADMIN_ACTIES.has(actie) && jwtPayload.type !== 'admin') {
        return new Response(JSON.stringify({ error: { message: 'Geen toegang — admin vereist' } }), { status: 403, headers: cors });
      }
    }

    // ── AI ANALYSE ────────────────────────────────────────────────────────
    if (actie === 'analyse' || !actie) {
      const { prompt, max_tokens = 1500 } = body;
      const apiKey = env.ANTHROPIC_API_KEY;
      if (!apiKey) return new Response(JSON.stringify({ error: { message: 'API key ontbreekt' } }), { headers: cors });
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens, messages: [{ role: 'user', content: prompt }] }),
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), { headers: cors });
    }

    // ── SESSIE VALIDATIE ─────────────────────────────────────────────────────────
    if (actie === 'validateToken') {
      const authHeader = request.headers.get('Authorization') || '';
      const jwtToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const payload = await jwtVerify(jwtToken, env);
      if (!payload) {
        return new Response(JSON.stringify({ valid: false }), { status: 401, headers: cors });
      }
      // Verlengen: geef nieuw token als minder dan 2u resterend
      const nu = Math.floor(Date.now()/1000);
      let token = jwtToken;
      if (payload.exp - nu < 7200) {
        const nieuweExp = nu + 8*3600;
        token = await jwtSign({ ...payload, exp: nieuweExp }, env);
      }
      return new Response(JSON.stringify({ valid: true, type: payload.type, naam: payload.naam || null, token }), { headers: cors });
    }

    // ── LOGIN CHECK ──────────────────────────────────────────────────────────
    if (actie === 'checkLogin') {
      const { code } = body;
      const adminCode = (env && env.ADMIN_CODE) || '';
      if (!adminCode) {
        return new Response(JSON.stringify({ error: { message: 'ADMIN_CODE niet geconfigureerd als environment variable' } }), { headers: cors });
      }
      // Admin check
      if (code === adminCode) {
        const exp = Math.floor(Date.now()/1000) + 8*3600; // 8 uur geldig
        const token = await jwtSign({ type: 'admin', exp }, env);
        return new Response(JSON.stringify({ type: 'admin', token }), { headers: cors });
      }
      // Klant check
      const klanten = await sb(env, 'klanten');
      const klant = Array.isArray(klanten) ? klanten.find(k => k.code === code) : null;
      if (klant) {
        const exp = Math.floor(Date.now()/1000) + 8*3600;
        const token = await jwtSign({ type: 'klant', code: klant.code, naam: klant.naam, exp }, env);
        // Stuur minimale klantinfo terug (geen wachtwoord/codes)
        return new Response(JSON.stringify({
          type: 'klant',
          token,
          klant: { naam: klant.naam, email: klant.email||'', sector: klant.sector||'', klanttype: klant.klanttype||'lead', code: klant.code }
        }), { headers: cors });
      }
      return new Response(JSON.stringify({ type: 'onbekend' }), { headers: cors });
    }

    // ── KLANTEN ───────────────────────────────────────────────────────────
    if (actie === 'getKlanten') {
      const data = await sb('klanten?order=aangemaakt.asc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setKlant') {
      const { naam, code, klanttype, email, sector } = body;
      await sb('klanten', 'POST', { naam, code, klanttype: klanttype || 'lead', email: email || '', sector: sector || '' });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'updateKlantType') {
      const { code, klanttype } = body;
      await sb(`klanten?code=eq.${encodeURIComponent(code)}`, 'PATCH', { klanttype });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delKlant') {
      const { code } = body;
      await sb(`klanten?code=eq.${encodeURIComponent(code)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── UPLOADS ───────────────────────────────────────────────────────────
    if (actie === 'getUploads') {
      const data = await sb('uploads?order=aangemaakt.desc');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setUpload') {
      const { bedrijf, periode, datum, sector, pdftekst } = body;
      // Upsert — vervang als zelfde bedrijf+periode al bestaat
      await sb('uploads', 'POST', {
        bedrijf, periode, datum, sector: sector || '',
        pdftekst: (pdftekst || '').substring(0, 80000),
      });
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'upsertUpload') {
      const { bedrijf, periode, datum, sector, pdftekst } = body;
      const bestaand = await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`);
      if (bestaand.length > 0) {
        await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'PATCH', {
          datum, sector: sector || '', pdftekst: (pdftekst || '').substring(0, 80000),
        });
      } else {
        await sb('uploads', 'POST', { bedrijf, periode, datum, sector: sector || '', pdftekst: (pdftekst || '').substring(0, 80000) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── ANALYSES ──────────────────────────────────────────────────────────
    if (actie === 'getAnalyse') {
      const { sleutel } = body;
      const data = await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);
      return new Response(JSON.stringify({ tekst: data[0]?.tekst || '' }), { headers: cors });
    }
    if (actie === 'setAnalyse') {
      const { sleutel, tekst } = body;
      const bestaand = await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`analyses?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', { tekst, bijgewerkt: new Date().toISOString() });
      } else {
        await sb('analyses', 'POST', { sleutel, tekst });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── E-MAIL VIA SERVER ────────────────────────────────────────────────────
    if (actie === 'stuurEmail') {
      const { data: emailData } = body;
      const serviceId  = (env && env.EMAILJS_SERVICE_ID)  || '';
      const templateId = (env && env.EMAILJS_TEMPLATE_ID) || '';
      const pubKey     = (env && env.EMAILJS_PUBLIC_KEY)  || '';
      if (!serviceId || !templateId || !pubKey) {
        return new Response(JSON.stringify({ error: { message: 'EmailJS niet geconfigureerd op server' } }), { headers: cors });
      }
      const resp = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: pubKey, template_params: emailData }),
      });
      if (!resp.ok) throw new Error('EmailJS fout: ' + resp.status);
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── RAPPORTEN 1-PAGER ─────────────────────────────────────────────────
    if (actie === 'getRapporten') {
      const data = await sb('rapporten');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setRapport') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;
      if (!sleutel) return new Response(JSON.stringify({ error: { message: 'setRapport: sleutel ontbreekt' } }), { headers: cors });
      const bestaand = await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          html: (html||'').substring(0,200000), gepubliceerd: gepubliceerd===true || gepubliceerd==='true', datum, ...(pdf_url ? {pdf_url} : {})
        });
      } else {
        await sb('rapporten', 'POST', { sleutel, html: (html||'').substring(0,200000), gepubliceerd: gepubliceerd===true || gepubliceerd==='true', datum, ...(pdf_url ? {pdf_url} : {}) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delRapport') {
      const { sleutel } = body;
      await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── UPLOAD VERWIJDEREN ───────────────────────────────────────────────────
    if (actie === 'delUpload') {
      const { bedrijf, periode } = body;
      await sb(`uploads?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── BASISSCANS ────────────────────────────────────────────────────────
    if (actie === 'getBasisscans') {
      const data = await sb('basisscans');
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setBasisscan') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;
      const bestaand = await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`);
      if (bestaand.length > 0) {
        await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          html, gepubliceerd, datum, ...(pdf_url ? {pdf_url} : {})
        });
      } else {
        await sb('basisscans', 'POST', { sleutel, html, gepubliceerd, datum, ...(pdf_url ? {pdf_url} : {}) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delBasisscan') {
      const { sleutel } = body;
      await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ── MAANDOVERZICHTEN ─────────────────────────────────────────────────
    // ── STRESSTESTEN ──────────────────────────────────────────────────────────────
    if (actie === 'getStresstesten') {
      // Use a separate query per type or just get all and filter client-side
      const all = await sb('basisscans');
      const stresstypes = ['cashflow','debiteuren','offerte'];
      const filtered = Array.isArray(all) ? all.filter(r => stresstypes.some(t => r.sleutel && r.sleutel.endsWith('-'+t))) : [];
      return new Response(JSON.stringify(filtered), { headers: cors });
    }
    if (actie === 'setStresstest') {
      const { sleutel, html, gepubliceerd, datum } = body;
      const bestaand = await sb('basisscans?sleutel=eq.'+encodeURIComponent(sleutel));
      const record = { sleutel, html, gepubliceerd: gepubliceerd||false, datum: datum||new Date().toISOString() };
      if (bestaand.length > 0) {
        await sb('basisscans?sleutel=eq.'+encodeURIComponent(sleutel), 'PATCH', record);
      } else {
        await sb('basisscans', 'POST', record);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delStresstest') {
      const { sleutel } = body;
      await sb('basisscans?sleutel=eq.'+encodeURIComponent(sleutel), 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    if (actie === 'getMaandoverzichten') {
      const { bedrijf } = body;
      const filter = bedrijf ? `bedrijf=eq.${encodeURIComponent(bedrijf)}&` : '';
      const data = await sb(`maandoverzichten?${filter}order=periode.desc`);
      return new Response(JSON.stringify(data), { headers: cors });
    }
    if (actie === 'setMaandoverzicht') {
      const { bedrijf, periode, html, gepubliceerd, datum, omzet, brutomarge, debiteurendagen, solvabiliteit, nettoresultaat } = body;
      const bestaand = await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`);
      const record = { bedrijf, periode, html, gepubliceerd: gepubliceerd||false, datum: datum||'', omzet: omzet||null, brutomarge: brutomarge||null, debiteurendagen: debiteurendagen||null, solvabiliteit: solvabiliteit||null, nettoresultaat: nettoresultaat||null, bijgewerkt: new Date().toISOString() };
      if (bestaand.length > 0) {
        await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'PATCH', record);
      } else {
        await sb('maandoverzichten', 'POST', record);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }
    if (actie === 'delMaandoverzicht') {
      const { bedrijf, periode } = body;
      await sb(`maandoverzichten?bedrijf=eq.${encodeURIComponent(bedrijf)}&periode=eq.${encodeURIComponent(periode)}`, 'DELETE');
      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: { message: 'Onbekende actie: ' + actie } }), { headers: cors });

  } catch (e) {
    console.error('[analyse.js] fout bij actie', body?.actie, ':', e.message);
    return new Response(JSON.stringify({ error: { message: e.message } }), { status: 200, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
