const SUPABASE_URL = 'https://yhctamsjmbkkqhndaiov.supabase.co';

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  const SUPABASE_KEY = env?.SUPABASE_KEY || 'sb_publishable_0vdwwnPaC30Y-XcAoBZVjQ_ZJq7tvNs';

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

  try {
    const body = await request.json();
    const { actie } = body;

    // ========================
    // KLANTEN
    // ========================

 if (actie === 'getKlanten') {
  const data = await sb('klanten?order=naam.asc');
  return new Response(JSON.stringify(data), { headers: cors });
}

    if (actie === 'setKlant') {
      const { naam, code, klanttype, email, sector } = body;

      if (!naam || !code) {
        return new Response(
          JSON.stringify({ error: { message: 'Naam en code zijn verplicht' } }),
          { status: 400, headers: cors }
        );
      }

      const bestaand = await sb(`klanten?code=eq.${encodeURIComponent(code)}`);
      if (bestaand.length > 0) {
        return new Response(
          JSON.stringify({ error: { message: 'Inlogcode bestaat al' } }),
          { status: 400, headers: cors }
        );
      }

      await sb('klanten', 'POST', {
        naam,
        code,
        klanttype: klanttype || 'lead',
        email: email || '',
        sector: sector || ''
      });

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ========================
    // RAPPORTEN (1-PAGER)
    // ========================

    if (actie === 'setRapport') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;

      if (!sleutel) {
        return new Response(
          JSON.stringify({ error: { message: 'Sleutel ontbreekt' } }),
          { status: 400, headers: cors }
        );
      }

      const record = {
        html: String(html || '').substring(0, 120000),
        gepubliceerd: gepubliceerd === true || gepubliceerd === 'true',
        datum,
        bijgewerkt: new Date().toISOString(),
        ...(pdf_url ? { pdf_url } : {})
      };

      const bestaand = await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`);

      if (bestaand.length > 0) {
        await sb(`rapporten?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', record);
      } else {
        await sb('rapporten', 'POST', { sleutel, ...record });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    // ========================
    // BASISSCAN
    // ========================

    if (actie === 'setBasisscan') {
      const { sleutel, html, gepubliceerd, datum, pdf_url } = body;

      const bestaand = await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`);

      if (bestaand.length > 0) {
        await sb(`basisscans?sleutel=eq.${encodeURIComponent(sleutel)}`, 'PATCH', {
          html,
          gepubliceerd,
          datum,
          pdf_url,
          bijgewerkt: new Date().toISOString()
        });
      } else {
        await sb('basisscans', 'POST', {
          sleutel,
          html,
          gepubliceerd,
          datum,
          pdf_url
        });
      }

      return new Response(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(
      JSON.stringify({ error: { message: 'Onbekende actie' } }),
      { status: 400, headers: cors }
    );

  } catch (e) {
    return new Response(
      JSON.stringify({ error: { message: e.message } }),
      { status: 500, headers: cors }
    );
  }
}
