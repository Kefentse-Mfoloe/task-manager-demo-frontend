export async function getJson(url) {
  const res = await fetch(url)
  if (!res.ok) {
    let text = ''
    try { text = await res.text() } catch (e) { /* ignore */ }
    return { ok: false, status: res.status, text }
  }
  const data = await res.json()
  return { ok: true, data }
}

export async function postJson(url, body) {
  const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(url, opts)
  if (!res.ok) {
    // try json error payload first
    let json = null
    try { json = await res.json() } catch (e) { /* ignore */ }
    let text = json && json.error ? json.error : ''
    if (!text) {
      try { text = await res.text() } catch (e) { /* ignore */ }
    }
    return { ok: false, status: res.status, data: json, text }
  }
  const data = await res.json()
  return { ok: true, data }
}

export default { getJson, postJson }
