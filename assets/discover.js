/* global CSS, Option, localStorage */

;(() => {
  'use strict'

  const $ = (selector) => document.querySelector(selector)
  const home = {
    stations: new Map(),
    favorites: new Set(),
    data: null,
    current: null,
    volume: 0.8,
    actionsBound: false,
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
    playerMinimize: $('#global-player-minimize'),
    playToggle: $('#global-play-toggle'),
    volume: $('#global-volume'),
    mute: $('#global-mute'),
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
  function stationInitials(name) {
    const words = String(name || 'Rádio')
      .replace(/\([^)]*\)/g, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
  }
  function fallbackLogo(name, id = '') {
    const initials = stationInitials(name)
    const hash = `${name}:${id}`.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
    const hue = hash % 360
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 75% 48%)"/><stop offset="1" stop-color="hsl(${(hue + 55) % 360} 75% 28%)"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><circle cx="128" cy="32" r="34" fill="rgba(255,255,255,.14)"/><text x="80" y="94" fill="white" font-family="Arial,sans-serif" font-size="48" font-weight="700" text-anchor="middle">${initials}</text><text x="80" y="124" fill="rgba(255,255,255,.75)" font-family="Arial,sans-serif" font-size="11" letter-spacing="2" text-anchor="middle">RADIO BR</text></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }
  function stationLogo(station) {
    const fallback = fallbackLogo(station.name, station.id)
    const source = station.favicon || fallback
    return `<img src="${escapeHtml(source)}" data-fallback-src="${escapeHtml(fallback)}" alt="">`
  }

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
  function loadVolume() {
    try {
      const saved = localStorage.getItem('radio-br:volume:v1')
      const value = saved === null ? 0.8 : Number(saved)
      if (Number.isFinite(value)) home.volume = Math.min(1, Math.max(0, value))
    } catch {
      /* session-only fallback */
    }
    if (els.volume) els.volume.value = String(home.volume)
  }
  function updateMuteButton() {
    if (!els.mute) return
    const muted = els.audio.muted || home.volume === 0
    els.mute.textContent = muted ? '🔇' : '🔊'
    els.mute.setAttribute('aria-label', muted ? 'Ativar som' : 'Silenciar')
  }
  function updatePlayToggle() {
    if (!els.playToggle) return
    const playing = !els.audio.paused
    els.playToggle.textContent = playing ? '❚❚' : '▶'
    els.playToggle.setAttribute('aria-label', playing ? 'Pausar' : 'Reproduzir')
    els.player.classList.toggle('is-playing', playing)
  }
  function setVolume(value) {
    home.volume = Math.min(1, Math.max(0, Number(value)))
    els.audio.volume = home.volume
    els.audio.muted = false
    if (els.volume) els.volume.value = String(home.volume)
    updateMuteButton()
    try {
      localStorage.setItem('radio-br:volume:v1', String(home.volume))
    } catch {
      /* session-only fallback */
    }
  }
  function card(station) {
    home.stations.set(station.id, station)
    const favorite = home.favorites.has(station.id)
    const logo = stationLogo(station)
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
          .map((section, index) => {
            const contentId = `${container.id}-${section.id}-${index}`
            return `<section class="portal-subsection" data-section-id="${escapeHtml(section.id)}"><button class="portal-section-toggle" type="button" data-section-toggle="${escapeHtml(contentId)}" aria-expanded="false" aria-controls="${escapeHtml(contentId)}"><span><strong>${escapeHtml(section.title)}</strong><small>${section.stations.length} rádios disponíveis</small></span><i aria-hidden="true">+</i></button><div class="portal-subsection-content" id="${escapeHtml(contentId)}" hidden><div class="radio-grid radio-grid--compact">${section.stations.map(card).join('')}</div></div></section>`
          })
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
    const audio = els.audio
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    home.current = station
    els.player.hidden = false
    els.playerName.textContent = station.name
    els.playerMeta.textContent = location(station)
    const fallback = fallbackLogo(station.name, station.id)
    els.playerLogo.src = station.favicon || fallback
    els.playerLogo.dataset.fallbackSrc = fallback
    els.playerLogo.alt = `Logo de ${station.name}`
    audio.src = stream
    audio.volume = home.volume
    audio.load()
    if (autoplay)
      audio.play().catch(() => {
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
    if (home.actionsBound) return
    home.actionsBound = true
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return
      const toggle = event.target.closest('[data-section-toggle]')
      if (toggle) {
        const content = document.getElementById(toggle.dataset.sectionToggle)
        if (!content) return
        const expanded = toggle.getAttribute('aria-expanded') !== 'true'
        toggle.setAttribute('aria-expanded', String(expanded))
        content.hidden = !expanded
        toggle
          .closest('.portal-subsection')
          ?.classList.toggle('is-open', expanded)
        return
      }
      const favorite = event.target.closest('[data-favorite-station]')
      if (favorite) {
        event.stopPropagation()
        toggleFavorite(favorite.dataset.favoriteStation)
        return
      }
      const playButton = event.target.closest('[data-play-station]')
      if (playButton) play(home.stations.get(playButton.dataset.playStation))
    })
  }
  document.addEventListener(
    'error',
    (event) => {
      const image = event.target
      if (!image || image.tagName !== 'IMG') return
      const fallback = image.dataset.fallbackSrc
      if (!fallback || image.src === fallback) return
      image.src = fallback
      image.removeAttribute('data-fallback-src')
    },
    true,
  )
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
  els.playerMinimize?.addEventListener('click', () => {
    const minimized = els.player.classList.toggle('is-minimized')
    els.playerMinimize.textContent = minimized ? '⌃' : '⌄'
    els.playerMinimize.setAttribute(
      'aria-label',
      minimized ? 'Restaurar player' : 'Minimizar player',
    )
    els.playerMinimize.setAttribute('aria-expanded', String(!minimized))
  })
  els.playToggle?.addEventListener('click', () => {
    if (els.audio.paused) els.audio.play().catch(() => {
      els.status.textContent = 'Não foi possível reproduzir esta rádio. Tente novamente ou escolha outra estação.'
      updatePlayToggle()
    })
    else els.audio.pause()
  })
  els.volume?.addEventListener('input', () => setVolume(els.volume.value))
  els.mute?.addEventListener('click', () => {
    els.audio.muted = !els.audio.muted
    updateMuteButton()
  })
  els.audio?.addEventListener('volumechange', updateMuteButton)
  els.audio?.addEventListener('play', updatePlayToggle)
  els.audio?.addEventListener('pause', updatePlayToggle)
  els.audio?.addEventListener('error', () => {
    els.status.textContent =
      'Esta rádio não respondeu. Escolha outra estação para continuar ouvindo.'
  })
  loadVolume()
  els.audio.volume = home.volume
  updateMuteButton()
  updatePlayToggle()
  loadHome()
})()
