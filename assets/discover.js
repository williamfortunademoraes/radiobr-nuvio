/* global CSS, Option, localStorage */

;(() => {
  'use strict'

  const $ = (selector) => document.querySelector(selector)
  const home = {
    stations: new Map(),
    favorites: new Set(),
    data: null,
    current: null,
  }
  const els = {
    form: $('#station-search-form'),
    input: $('#station-search'),
    genre: $('#station-genre'),
    region: $('#station-region'),
    status: $('#station-search-status'),
    results: $('#station-results'),
    featured: $('#featured-stations'),
    genres: $('#genre-sections'),
    regions: $('#region-sections'),
    favorites: $('#favoritos'),
    favoriteStations: $('#favorite-stations'),
    player: $('#global-player'),
    audio: $('#global-audio'),
    playerLogo: $('#global-player-logo'),
    playerName: $('#global-player-name'),
    playerMeta: $('#global-player-meta'),
    playerFavorite: $('#global-player-favorite'),
    playerClose: $('#global-player-close'),
  }
  if (!els.form || !els.featured) return

  const escapeHtml = (value) =>
    String(value ?? '').replace(
      /[&<>'"]/g,
      (char) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        })[char],
    )
  const getStream = (station) => station.urlResolved || station.url || ''
  const location = (station) =>
    [station.city, station.stateName || station.state]
      .filter(Boolean)
      .join(' · ') || 'Brasil'

  function loadFavorites() {
    try {
      const saved = JSON.parse(
        localStorage.getItem('radio-br:favorites:v1') || '[]',
      )
      if (Array.isArray(saved))
        saved.forEach((id) => typeof id === 'string' && home.favorites.add(id))
    } catch {
      /* session-only fallback */
    }
  }
  function saveFavorites() {
    try {
      localStorage.setItem(
        'radio-br:favorites:v1',
        JSON.stringify([...home.favorites]),
      )
    } catch {
      /* session-only fallback */
    }
  }
  function card(station) {
    home.stations.set(station.id, station)
    const favorite = home.favorites.has(station.id)
    const logo = station.favicon
      ? `<img src="${escapeHtml(station.favicon)}" alt="">`
      : '<span aria-hidden="true">♫</span>'
    return `<article class="radio-card" data-station-id="${escapeHtml(station.id)}"><div class="radio-card-art">${logo}</div><div class="radio-card-copy"><strong>${escapeHtml(station.name)}</strong><small>${escapeHtml(location(station))}</small><small>${escapeHtml([station.codec, station.bitrate ? `${station.bitrate} kbps` : ''].filter(Boolean).join(' · ') || 'Rádio ao vivo')}</small></div><button class="radio-card-play" type="button" data-play-station="${escapeHtml(station.id)}" aria-label="Ouvir ${escapeHtml(station.name)}">▶ Ouvir</button><button class="radio-card-favorite${favorite ? ' is-favorite' : ''}" type="button" data-favorite-station="${escapeHtml(station.id)}" aria-label="${favorite ? 'Remover' : 'Adicionar'} ${escapeHtml(station.name)} ${favorite ? 'dos' : 'aos'} favoritos" aria-pressed="${favorite}">${favorite ? '★' : '☆'}</button></article>`
  }
  function renderStations(
    container,
    stations,
    empty = 'Nenhuma rádio encontrada.',
  ) {
    if (!container) return
    const playable = (stations || []).filter((station) => getStream(station))
    container.innerHTML = playable.length
      ? playable.map(card).join('')
      : `<p class="portal-empty">${empty}</p>`
  }
  function renderSections(container, sections) {
    if (!container) return
    const visible = (sections || []).filter(
      (section) => section.stations?.length,
    )
    container.innerHTML = visible.length
      ? visible
          .map(
            (section) =>
              `<section class="portal-subsection" data-section-id="${escapeHtml(section.id)}"><div class="portal-subsection-head"><h3>${escapeHtml(section.title)}</h3></div><div class="radio-grid radio-grid--compact">${section.stations.map(card).join('')}</div></section>`,
          )
          .join('')
      : '<p class="portal-empty">Ainda não há rádios nesta seleção.</p>'
  }
  function updateFavorites() {
    const stations = [...home.stations.values()].filter((station) =>
      home.favorites.has(station.id),
    )
    if (els.favorites) els.favorites.hidden = stations.length === 0
    renderStations(els.favoriteStations, stations)
    if (els.playerFavorite && home.current) {
      const active = home.favorites.has(home.current.id)
      els.playerFavorite.textContent = active ? '★' : '☆'
      els.playerFavorite.setAttribute('aria-pressed', String(active))
    }
  }
  function toggleFavorite(id) {
    if (home.favorites.has(id)) home.favorites.delete(id)
    else home.favorites.add(id)
    saveFavorites()
    updateFavorites()
    document
      .querySelectorAll(`[data-favorite-station="${CSS.escape(id)}"]`)
      .forEach((button) => {
        const active = home.favorites.has(id)
        button.classList.toggle('is-favorite', active)
        button.textContent = active ? '★' : '☆'
        button.setAttribute('aria-pressed', String(active))
      })
  }
  function showCurrent(station, autoplay = false) {
    const stream = getStream(station)
    if (!stream || !els.audio) return
    home.current = station
    els.player.hidden = false
    els.playerName.textContent = station.name
    els.playerMeta.textContent = location(station)
    els.playerLogo.src = station.favicon || '/assets/logo.png'
    els.playerLogo.alt = `Logo de ${station.name}`
    els.audio.src = stream
    if (autoplay)
      els.audio.play().catch(() => {
        els.status.textContent =
          'Aperte play no player para iniciar esta rádio.'
      })
    updateFavorites()
  }
  function play(station) {
    if (!station) return
    showCurrent(station, true)
    try {
      localStorage.setItem('radio-br:current:v1', station.id)
    } catch {
      /* session-only fallback */
    }
  }
  function bindActions() {
    document
      .querySelectorAll('[data-play-station]')
      .forEach((button) =>
        button.addEventListener('click', () =>
          play(home.stations.get(button.dataset.playStation)),
        ),
      )
    document.querySelectorAll('[data-favorite-station]').forEach((button) =>
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        toggleFavorite(button.dataset.favoriteStation)
      }),
    )
  }
  async function search() {
    const query = els.input.value.trim()
    if (query.length < 2) {
      els.status.textContent = 'Digite pelo menos 2 caracteres para buscar.'
      els.results.replaceChildren()
      return
    }
    els.status.textContent = 'Buscando rádios…'
    try {
      const response = await fetch(
        `/api/stations?search=${encodeURIComponent(query)}&limit=12`,
      )
      if (!response.ok) throw new Error('Falha na busca')
      const stations = await response.json()
      els.status.textContent = `${stations.length} rádio(s) encontrada(s).`
      renderStations(
        els.results,
        stations,
        'Nenhuma rádio encontrada. Tente outro nome.',
      )
      bindActions()
    } catch {
      els.status.textContent =
        'Não foi possível buscar agora. Tente novamente em instantes.'
    }
  }
  function filterSections() {
    const genre = els.genre.value
    const region = els.region.value
    const data = home.data
    renderSections(
      els.genres,
      data.genres.filter(
        (section) => (!genre || section.id === genre) && !region,
      ),
    )
    renderSections(
      els.regions,
      data.regions.filter(
        (section) => (!region || section.id === region) && !genre,
      ),
    )
    bindActions()
  }
  async function loadHome() {
    loadFavorites()
    let currentId = ''
    try {
      currentId = localStorage.getItem('radio-br:current:v1') || ''
    } catch {
      /* session-only fallback */
    }
    try {
      const response = await fetch('/api/home')
      if (!response.ok) throw new Error('Falha no catálogo')
      home.data = await response.json()
      home.data.featured.forEach((station) =>
        home.stations.set(station.id, station),
      )
      renderStations(els.featured, home.data.featured)
      renderSections(els.genres, home.data.genres)
      renderSections(els.regions, home.data.regions)
      home.data.availableGenres.forEach((genre) =>
        els.genre.add(new Option(genre.name, genre.id)),
      )
      home.data.regions.forEach((region) =>
        els.region.add(new Option(region.title, region.id)),
      )
      els.status.textContent = 'Escolha uma rádio para começar a ouvir.'
      bindActions()
      updateFavorites()
      if (currentId) {
        const current = home.stations.get(currentId)
        if (current) showCurrent(current)
      }
    } catch {
      els.status.textContent =
        'Não foi possível carregar as rádios agora. Tente novamente em instantes.'
      els.featured.innerHTML =
        '<p class="portal-empty">O catálogo está temporariamente indisponível.</p>'
    }
  }
  els.form.addEventListener('submit', (event) => {
    event.preventDefault()
    search()
  })
  els.genre.addEventListener('change', filterSections)
  els.region.addEventListener('change', filterSections)
  els.playerFavorite?.addEventListener(
    'click',
    () => home.current && toggleFavorite(home.current.id),
  )
  els.playerClose?.addEventListener('click', () => {
    els.audio.pause()
    els.audio.removeAttribute('src')
    els.player.hidden = true
    try {
      localStorage.removeItem('radio-br:current:v1')
    } catch {
      /* session-only fallback */
    }
  })
  loadHome()
})()
