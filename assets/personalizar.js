;(() => {
  'use strict'

  const dataElement = document.getElementById('radio-br-data')
  const form = document.getElementById('config-form')
  if (!dataElement || !form) return

  let data
  try {
    data = JSON.parse(dataElement.textContent || '{}')
  } catch {
    return
  }

  const collectionOrder = Array.isArray(data.collections)
    ? data.collections.map((item) => item.id)
    : []
  const genreOrder = Array.isArray(data.genres)
    ? data.genres.map((item) => item.id)
    : []
  const stateOrder = Array.isArray(data.states)
    ? data.states.map((item) => item.code)
    : []
  const collectionNames = new Map(
    (data.collections || []).map((item) => [item.id, item.name]),
  )
  const genreNames = new Map(
    (data.genres || []).map((item) => [item.id, item.name]),
  )
  const stateNames = new Map(
    (data.states || []).map((item) => [item.code, item.name]),
  )

  const selection = {
    collections: new Set(['editorial', 'featured', 'all']),
    genres: new Set(),
    allStates: true,
    states: new Set(),
    logos: true,
    step: 1,
  }

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches

  const allStatesInput = document.getElementById('all-states')
  const logosInput = document.getElementById('show-logos')
  const includeMainInput = document.getElementById('include-main')
  const includeUnknownInput = document.getElementById('include-unknown')

  const summaryCollections = document.getElementById('summary-collections')
  const summaryGenres = document.getElementById('summary-genres')
  const summaryStates = document.getElementById('summary-states')
  const summaryOptions = document.getElementById('summary-options')
  const activeFilters = document.getElementById('active-filters')
  const reviewCount = document.getElementById('review-count')
  const summaryWarning = document.getElementById('summary-warning')

  const reviewCollections = document.getElementById('review-collections')
  const reviewGenres = document.getElementById('review-genres')
  const reviewStates = document.getElementById('review-states')
  const reviewOptions = document.getElementById('review-options')
  const includedCategories = document.getElementById('included-categories')

  const result = document.getElementById('result')
  const resultUrl = document.getElementById('result-url')
  const manifestJson = document.getElementById('manifest-json')
  const openManifest = document.getElementById('open-manifest')
  const installStremio = document.getElementById('install-stremio')
  const copyButton = document.getElementById('copy-url')
  const errorBox = document.getElementById('step-error')
  const generateButton = document.getElementById('generate-addon')

  function collectionInputs() {
    return Array.from(
      form.querySelectorAll('input[name="collections"]'),
    )
  }

  function genreInputs() {
    return Array.from(form.querySelectorAll('input[name="genres"]'))
  }

  function stateInputs() {
    return Array.from(form.querySelectorAll('input[name="states"]'))
  }

  function selectedNames(order, names, selected) {
    return order.filter((id) => selected.has(id)).map((id) => names.get(id) || id)
  }

  function fillReviewList(element, items, emptyText) {
    if (!element) return
    element.replaceChildren()
    if (items.length === 0) {
      const empty = document.createElement('span')
      empty.className = 'review-empty'
      empty.textContent = emptyText
      element.append(empty)
      return
    }
    for (const item of items) {
      const chip = document.createElement('span')
      chip.textContent = item
      element.append(chip)
    }
  }

  function fillChipCloud(element, items) {
    if (!element) return
    element.replaceChildren()
    if (items.length === 0) {
      const empty = document.createElement('span')
      empty.className = 'chip-empty'
      empty.textContent = 'Nenhuma categoria selecionada'
      element.append(empty)
      return
    }
    for (const item of items) {
      const chip = document.createElement('span')
      chip.textContent = item
      element.append(chip)
    }
  }

  function activeFilterCount() {
    let count = selection.collections.size + selection.genres.size
    if (!selection.allStates && selection.states.size > 0) count += 1
    if (!selection.logos) count += 1
    return count
  }

  function validationMessage() {
    if (selection.collections.size === 0 && selection.genres.size === 0)
      return 'Selecione pelo menos uma coleção ou gênero.'
    if (!selection.allStates && selection.states.size === 0)
      return 'Selecione pelo menos um estado ou marque “Todos os estados”.'
    return ''
  }

  function renderSummary() {
    const collections = selectedNames(
      collectionOrder,
      collectionNames,
      selection.collections,
    )
    const genres = selectedNames(genreOrder, genreNames, selection.genres)
    const states = selection.allStates
      ? ['Todos os estados']
      : selectedNames(stateOrder, stateNames, selection.states)
    const options = [
      selection.logos ? 'Logotipos visíveis' : 'Logotipos ocultos',
    ]

    if (summaryCollections)
      summaryCollections.textContent = collections.length
        ? collections.join(' · ')
        : 'Nenhuma'
    if (summaryGenres)
      summaryGenres.textContent = genres.length ? genres.join(' · ') : 'Nenhum'
    if (summaryStates)
      summaryStates.textContent = states.length
        ? states.join(' · ')
        : 'Nenhum'
    if (summaryOptions) summaryOptions.textContent = options.join(' · ')

    const count = activeFilterCount()
    if (activeFilters) activeFilters.textContent = String(count)
    if (reviewCount) reviewCount.textContent = String(count)

    const message = validationMessage()
    if (summaryWarning) summaryWarning.textContent = message

    fillReviewList(reviewCollections, collections, 'Nenhuma coleção')
    fillReviewList(reviewGenres, genres, 'Nenhum gênero')
    fillReviewList(reviewStates, states, 'Nenhum estado')
    fillReviewList(reviewOptions, options, 'Padrão')

    fillChipCloud(includedCategories, [...collections, ...genres])
  }

  function syncUi() {
    for (const input of collectionInputs())
      input.checked = selection.collections.has(input.value)
    for (const input of genreInputs())
      input.checked = selection.genres.has(input.value)

    if (allStatesInput) allStatesInput.checked = selection.allStates
    for (const input of stateInputs()) {
      input.checked = selection.states.has(input.value)
      input.disabled = selection.allStates
    }

    if (logosInput) logosInput.checked = selection.logos
    if (includeMainInput) {
      const featured = selection.collections.has('featured')
      const all = selection.collections.has('all')
      includeMainInput.checked = featured && all
      includeMainInput.indeterminate = featured !== all
    }
    if (includeUnknownInput)
      includeUnknownInput.checked = selection.collections.has('unknown')

    renderSummary()
  }

  function showError(message) {
    if (!errorBox) return
    errorBox.textContent = message
    errorBox.hidden = false
    if (result) result.hidden = true
  }

  function hideError() {
    if (!errorBox) return
    errorBox.hidden = true
    errorBox.textContent = ''
  }

  function showStep(step, scroll = true) {
    selection.step = Math.min(5, Math.max(1, Number(step) || 1))

    for (const panel of form.querySelectorAll('.wizard-step')) {
      const active = Number(panel.dataset.step) === selection.step
      panel.hidden = !active
      panel.classList.toggle('is-active', active)
    }

    for (const button of document.querySelectorAll('.step-button')) {
      const active = Number(button.dataset.stepTarget) === selection.step
      button.classList.toggle('is-active', active)
      if (active) button.setAttribute('aria-current', 'step')
      else button.removeAttribute('aria-current')
    }

    if (selection.step === 5) renderSummary()
    if (!scroll) return

    const top = form.getBoundingClientRect().top + window.scrollY - 94
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })

    const heading = form.querySelector(
      `.wizard-step[data-step="${selection.step}"] h2`,
    )
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }

  function buildPayload() {
    const payload = { v: 1 }
    const collections = collectionOrder.filter((id) =>
      selection.collections.has(id),
    )
    const genres = genreOrder.filter((id) => selection.genres.has(id))
    const states = selection.allStates
      ? []
      : stateOrder.filter((code) => selection.states.has(code))

    if (collections.length) payload.c = collections
    if (genres.length) payload.g = genres
    if (states.length) payload.s = states
    if (!selection.logos) payload.o = { logos: false }
    return payload
  }

  function showResult(url, encoded, manifest) {
    if (!result) return
    hideError()

    if (resultUrl) resultUrl.value = url
    if (manifestJson)
      manifestJson.textContent = JSON.stringify(manifest, null, 2)
    if (openManifest) openManifest.href = url
    if (installStremio)
      installStremio.href = `stremio://${window.location.host}/${encoded}/manifest.json`

    result.hidden = false
    result.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    const heading = document.getElementById('result-title')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }

  async function generate() {
    const message = validationMessage()
    if (message) {
      showError(message)
      showStep(5)
      return
    }

    hideError()
    const original = generateButton ? generateButton.innerHTML : ''
    if (generateButton) {
      generateButton.disabled = true
      generateButton.textContent = 'Gerando...'
    }

    try {
      const payload = buildPayload()
      const encoded = encodeURIComponent(JSON.stringify(payload))
      const url = `${window.location.origin}/${encoded}/manifest.json`
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        const serverMessage =
          body && typeof body.message === 'string' ? body.message : ''
        throw new Error(
          serverMessage ||
            'Não foi possível validar a configuração no servidor.',
        )
      }
      showResult(url, encoded, body)
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar a URL. Tente novamente.',
      )
      showStep(5)
    } finally {
      if (generateButton) {
        generateButton.disabled = false
        generateButton.innerHTML = original
      }
    }
  }

  form.addEventListener('change', (event) => {
    const target = event.target
    if (!(target instanceof HTMLInputElement)) return

    if (target.name === 'collections') {
      if (target.checked) selection.collections.add(target.value)
      else selection.collections.delete(target.value)
    } else if (target.name === 'genres') {
      if (target.checked) selection.genres.add(target.value)
      else selection.genres.delete(target.value)
    } else if (target.name === 'states') {
      if (target.checked) selection.states.add(target.value)
      else selection.states.delete(target.value)
      if (selection.states.size > 0) selection.allStates = false
    } else if (target.id === 'all-states') {
      selection.allStates = target.checked
      if (selection.allStates) selection.states.clear()
    } else if (target.id === 'show-logos') {
      selection.logos = target.checked
    } else if (target.id === 'include-main') {
      if (target.checked) {
        selection.collections.add('featured')
        selection.collections.add('all')
      } else {
        selection.collections.delete('featured')
        selection.collections.delete('all')
      }
    } else if (target.id === 'include-unknown') {
      if (target.checked) selection.collections.add('unknown')
      else selection.collections.delete('unknown')
    }

    syncUi()
  })

  document.addEventListener('click', (event) => {
    const element = event.target
    if (!(element instanceof Element)) return

    const stepTarget = element.closest('[data-step-target]')
    if (stepTarget) {
      event.preventDefault()
      showStep(Number(stepTarget.dataset.stepTarget))
      return
    }

    const next = element.closest('[data-step-next]')
    if (next) {
      event.preventDefault()
      showStep(selection.step + 1)
      return
    }

    const previous = element.closest('[data-step-prev]')
    if (previous) {
      event.preventDefault()
      showStep(selection.step - 1)
      return
    }

    const action = element.closest('[data-action]')
    if (!action) return

    switch (action.dataset.action) {
      case 'select-all-genres':
        for (const id of genreOrder) selection.genres.add(id)
        break
      case 'clear-genres':
        selection.genres.clear()
        break
      case 'select-all-states':
        selection.allStates = true
        selection.states.clear()
        break
      case 'clear-states':
        selection.allStates = false
        selection.states.clear()
        break
      default:
        return
    }
    event.preventDefault()
    syncUi()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    void generate()
  })

  if (copyButton && resultUrl) {
    copyButton.addEventListener('click', async () => {
      const value = resultUrl.value
      if (!value) return
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value)
        } else {
          resultUrl.select()
          document.execCommand('copy')
        }
        copyButton.textContent = 'Copiado!'
        window.setTimeout(() => {
          copyButton.textContent = 'Copiar URL'
        }, 2000)
      } catch {
        resultUrl.select()
        copyButton.textContent = 'Selecione e copie'
      }
    })
  }

  syncUi()
  showStep(1, false)
})()
