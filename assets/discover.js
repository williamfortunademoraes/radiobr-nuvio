;(() => {
  'use strict'

  const form = document.querySelector('#station-search-form')
  const input = document.querySelector('#station-search')
  const results = document.querySelector('#station-results')
  const status = document.querySelector('#station-search-status')
  if (!form || !input || !results || !status) return

  const escapeHtml = (value) =>
    String(value).replace(
      /[&<>'"]/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        })[character],
    )

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const search = input.value.trim()
    if (search.length < 2) {
      status.textContent = 'Digite pelo menos 2 caracteres para buscar.'
      results.replaceChildren()
      return
    }
    status.textContent = 'Buscando rádios…'
    results.replaceChildren()
    try {
      const response = await fetch(
        `/api/stations?search=${encodeURIComponent(search)}&limit=12`,
      )
      if (!response.ok) throw new Error('Falha na busca')
      const stations = await response.json()
      if (!stations.length) {
        status.textContent = 'Nenhuma rádio encontrada. Tente outro nome.'
        return
      }
      status.textContent = `${stations.length} rádio(s) encontrada(s).`
      results.innerHTML = stations
        .map(
          (
            station,
          ) => `<a class="station-result" href="/radio/${encodeURIComponent(station.id)}">
            <span class="station-result-logo">${station.favicon ? `<img src="${escapeHtml(station.favicon)}" alt="">` : '♫'}</span>
            <span><strong>${escapeHtml(station.name)}</strong><small>${escapeHtml([station.state, station.codec, station.bitrate ? `${station.bitrate} kbps` : ''].filter(Boolean).join(' · ') || 'Rádio brasileira')}</small></span>
            <span aria-hidden="true">↗</span>
          </a>`,
        )
        .join('')
    } catch {
      status.textContent =
        'Não foi possível buscar agora. Tente novamente em instantes.'
    }
  })
})()
