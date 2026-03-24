Ase(JSON.stringify({ ok: true }), { headers: cors });
    }

    return new Response(JSON.stringify({ error: { message: 'Onbekende actie: ' + actie } }), { headers: cors });

  } catch (e) {
    return new Response(JSON.stringify({ error: { message: e.message } }), { status: 500, headers: cors });
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
