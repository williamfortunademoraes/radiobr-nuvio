import {
  COLLECTION_DEFINITIONS,
  musicGenreDefinitions,
  type CollectionId,
} from '../config/addon-config.js'
import { STATES, STATE_REGIONS } from '../stations/states.js'
import type { Station } from '../stations/types.js'

const GITHUB_URL = 'https://github.com/williamfortunademoraes/radiobr-nuvio'
const RADIO_BROWSER_URL = 'https://www.radio-browser.info/'

const ICON_PATHS: Record<string, string> = {
  star: '<path d="M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9 6.6 19.8l1-6.1L3.2 9.4l6.1-.9L12 3z"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3z"/>',
  news: '<path d="M4 5h16v14H4z"/><path d="M7 9h10M7 13h6M7 17h8"/>',
  sports:
    '<path d="M8 4h8v4a4 4 0 01-8 0V4z"/><path d="M8 5H5a3 3 0 003 3"/><path d="M16 5h3a3 3 0 01-3 3"/><path d="M12 12v5"/><path d="M9 21h6"/><path d="M10 17h4"/>',
  music:
    '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
  sparkle:
    '<path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z"/>',
  wave: '<path d="M3 12h2l2-6 3 12 3-9 2 5 2-3h4"/>',
  question:
    '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4"/><path d="M12 17h.01"/>',
  headphones:
    '<path d="M4 14v-2a8 8 0 0116 0v2"/><path d="M4 14h2a2 2 0 012 2v2a2 2 0 01-2 2H4v-6z"/><path d="M20 14h-2a2 2 0 00-2 2v2a2 2 0 002 2h2v-6z"/>',
  shield:
    '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  link: '<path d="M10 13a5 5 0 007.1 0l2-2a5 5 0 00-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 00-7.1 0l-2 2A5 5 0 0012 20.1l1.1-1.1"/>',
}

const SHOWCASE = [
  {
    name: 'Rádios em destaque',
    icon: 'star',
    tone: 'violet',
    copy: 'As 25 rádios mais bem posicionadas no ranking nacional.',
  },
  {
    name: 'Notícias e esportes',
    icon: 'news',
    tone: 'blue',
    copy: 'Jornalismo, futebol, debates e cobertura ao vivo.',
  },
  {
    name: 'Sertanejo',
    icon: 'music',
    tone: 'amber',
    copy: 'Do universitário à moda de viola.',
  },
  {
    name: 'Samba e pagode',
    icon: 'music',
    tone: 'rose',
    copy: 'Samba de raiz, rodas, clássicos e pagode.',
  },
  {
    name: 'Rock',
    icon: 'bolt',
    tone: 'red',
    copy: 'Clássico, alternativo, nacional e punk.',
  },
  {
    name: 'Gospel',
    icon: 'sparkle',
    tone: 'cyan',
    copy: 'Música cristã, louvor e programação religiosa.',
  },
  {
    name: 'Pop',
    icon: 'star',
    tone: 'pink',
    copy: 'Hits, top 40 e pop contemporâneo.',
  },
  {
    name: 'MPB',
    icon: 'wave',
    tone: 'teal',
    copy: 'Música popular brasileira em todas as fases.',
  },
  {
    name: 'Música eletrônica',
    icon: 'wave',
    tone: 'indigo',
    copy: 'Dance, house, techno, trance e EDM.',
  },
]

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  )
}

function icon(name: string): string {
  const path = ICON_PATHS[name] ?? ICON_PATHS.star
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`
}

function head(title: string, description: string, configPage = false) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#090612">
    <meta name="description" content="${escapeHtml(description)}">
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="/assets/logo.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/site.css">
    ${configPage ? '<script src="/assets/personalizar.js" defer></script>' : ''}
  </head>
  <body>`
}

function header(active: 'inicio' | 'personalizar') {
  return `    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="site-header">
      <div class="shell header-inner">
        <a class="brand" href="/" aria-label="RADIO BR — página inicial">
          <img src="/assets/logo.png" alt="" width="44" height="44">
          <span class="brand-copy">
            <strong>RADIO BR</strong>
            <small>Estações de rádios - Brasil</small>
          </span>
        </a>
        <nav class="main-nav" aria-label="Navegação principal">
          <a href="/"${active === 'inicio' ? ' aria-current="page"' : ''}>Início</a>
          <a href="/personalizar"${active === 'personalizar' ? ' aria-current="page"' : ''}>Personalizar</a>
          <a href="/#sobre">Sobre</a>
        </nav>
        <a class="btn btn-primary btn-sm header-cta" href="/personalizar">Personalizar</a>
      </div>
    </header>`
}

function footer() {
  return `    <footer class="site-footer">
      <div class="shell footer-grid">
        <div class="footer-brand">
          <a class="brand brand--footer" href="/">
            <img src="/assets/logo.png" alt="" width="40" height="40">
            <span class="brand-copy"><strong>RADIO BR</strong><small>Rádio brasileira, do seu jeito.</small></span>
          </a>
          <p>Um addon independente para descobrir e ouvir rádios brasileiras no Nuvio e no Stremio.</p>
        </div>
        <div class="footer-column">
          <h3>Navegar</h3>
          <a href="/">Início</a>
          <a href="/personalizar">Personalizar</a>
          <a href="/#sobre">Sobre o projeto</a>
        </div>
        <div class="footer-column">
          <h3>Dados e reprodução</h3>
          <a href="${RADIO_BROWSER_URL}" target="_blank" rel="noreferrer">Radio Browser</a>
          <a href="${GITHUB_URL}" target="_blank" rel="noreferrer">GitHub do projeto</a>
          <span>Streams diretos das emissoras</span>
        </div>
        <div class="footer-column footer-note">
          <h3>Transparência</h3>
          <p>Sem conta, sem banco de dados e sem retransmissão de áudio. Nomes, logotipos e transmissões pertencem às respectivas emissoras.</p>
        </div>
      </div>
      <div class="shell footer-bottom">
        <span>RADIO BR · Projeto independente</span>
        <span>Fonte de dados pública: Radio Browser</span>
      </div>
    </footer>
  </body>
</html>`
}

function showcaseCard(item: (typeof SHOWCASE)[number]) {
  return `<article class="collection-card">
    <div class="collection-icon tone-${item.tone}">${icon(item.icon)}</div>
    <div class="collection-copy">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.copy)}</p>
    </div>
    <span class="collection-arrow" aria-hidden="true">↗</span>
  </article>`
}

export function renderLandingPage(): string {
  return `${head(
    'RADIO BR — Suas rádios. Do seu jeito.',
    'Monte sua própria seleção de rádios brasileiras e leve suas coleções favoritas para o Nuvio ou Stremio.',
  )}
${header('inicio')}
    <main id="conteudo">
      <section class="hero shell">
        <div class="hero-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Rádio brasileira, sem fronteiras</span>
          <h1>Suas rádios.<br><span class="gradient-text">Do seu jeito.</span></h1>
          <p class="hero-lead">Monte sua própria seleção de rádios brasileiras e leve suas coleções favoritas para o Nuvio.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" href="/personalizar">Personalizar minhas rádios <span aria-hidden="true">→</span></a>
            <a class="btn btn-ghost btn-lg" href="#sobre">Conhecer o projeto</a>
          </div>
          <ul class="hero-points">
            <li>${icon('shield')} Sem conta ou cadastro</li>
            <li>${icon('link')} URL exclusiva e reproduzível</li>
            <li>${icon('headphones')} Streams diretos das emissoras</li>
          </ul>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="hero-glow hero-glow--one"></div>
          <div class="hero-glow hero-glow--two"></div>
          <div class="hero-grid-pattern"></div>
          <div class="player-card">
            <div class="player-topline">
              <span class="live-pill"><span class="live-dot"></span> AO VIVO</span>
              <span class="player-signal">RADIO BR</span>
            </div>
            <div class="player-art">
              <img src="/assets/logo.png" alt="">
              <div class="equalizer"><span></span><span></span><span></span><span></span><span></span></div>
            </div>
            <div class="player-info">
              <span class="player-kicker">Sua rádio favorita</span>
              <strong>Estações do Brasil</strong>
              <span class="player-tags">Notícias · Música · Esportes</span>
            </div>
            <div class="player-progress"><span></span></div>
            <div class="player-controls">
              <span>◀</span><span class="play-button">▶</span><span>▶</span>
            </div>
          </div>
          <div class="floating-card floating-card--one">
            <span class="floating-icon tone-violet">${icon('star')}</span>
            <span><strong>Rádios em destaque</strong><small>Curadoria editorial</small></span>
          </div>
          <div class="floating-card floating-card--two">
            <span class="floating-icon tone-cyan">${icon('wave')}</span>
            <span><strong>10 gêneros</strong><small>Do sertanejo ao rock</small></span>
          </div>
        </div>
      </section>

      <section class="stats-band shell" aria-label="Números do RADIO BR">
        <div class="stat"><strong>Até 100</strong><span>estações no lote consultado</span></div>
        <div class="stat"><strong>9</strong><span>gêneros consolidados</span></div>
        <div class="stat"><strong>27</strong><span>UFs e Distrito Federal</span></div>
        <div class="stat"><strong>0</strong><span>contas ou cadastros</span></div>
      </section>

      <section class="section shell" id="colecoes">
        <div class="section-head">
          <div>
            <span class="eyebrow"><span class="eyebrow-dot"></span> Coleções</span>
            <h2>Uma grade que combina com você.</h2>
          </div>
          <p>Escolha as coleções que fazem sentido para o seu dia. Você pode começar com destaques e adicionar só o que quiser ouvir.</p>
        </div>
        <div class="collection-grid">
          ${SHOWCASE.map(showcaseCard).join('\n          ')}
        </div>
      </section>

      <section class="section shell how-it-works">
        <div class="section-head">
          <div>
            <span class="eyebrow"><span class="eyebrow-dot"></span> Como funciona</span>
            <h2>Três passos. Nenhuma conta.</h2>
          </div>
        </div>
        <div class="steps-grid">
          <article class="step-card">
            <span class="step-number">01</span>
            <h3>Escolha suas coleções</h3>
            <p>Ative destaques, notícias e esportes, gêneros musicais e os estados que quiser acompanhar.</p>
          </article>
          <article class="step-card">
            <span class="step-number">02</span>
            <h3>Gere sua URL</h3>
            <p>A central monta uma configuração compacta e devolve um manifesto JSON só com as suas escolhas.</p>
          </article>
          <article class="step-card">
            <span class="step-number">03</span>
            <h3>Instale no Nuvio</h3>
            <p>Cole a URL no seu cliente. A configuração continua valendo quando você reinstalar o addon.</p>
          </article>
        </div>
      </section>

      <section class="section shell about-section" id="sobre">
        <div class="about-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> Sobre o RADIO BR</span>
          <h2>Rádio brasileira com curadoria aberta.</h2>
          <p>O RADIO BR transforma o diretório público do Radio Browser em uma experiência de descoberta para o Nuvio e o Stremio. O catálogo é dinâmico: as estações vêm da fonte pública e os filtros são aplicados sobre os dados reais das emissoras.</p>
          <p>Os streams são URLs públicas cadastradas pelas próprias rádios. O projeto não faz proxy, retransmissão ou conversão de áudio. Nomes, logotipos e transmissões pertencem às respectivas emissoras e provedores.</p>
          <div class="about-links">
            <a class="btn btn-ghost" href="${GITHUB_URL}" target="_blank" rel="noreferrer">Ver no GitHub <span aria-hidden="true">↗</span></a>
            <a class="text-link" href="${RADIO_BROWSER_URL}" target="_blank" rel="noreferrer">Conhecer o Radio Browser</a>
          </div>
        </div>
        <aside class="about-card">
          <div class="about-card-icon">${icon('shield')}</div>
          <h3>Transparência por padrão</h3>
          <ul>
            <li>Sem conta, painel administrativo ou banco de dados.</li>
            <li>Configuração validada no servidor.</li>
            <li>Cache compartilhado para reduzir consultas à fonte.</li>
            <li>IDs de estação e URLs de stream preservados.</li>
          </ul>
        </aside>
      </section>

      <section class="shell cta-band">
        <div>
          <span class="eyebrow"><span class="eyebrow-dot"></span> Pronto quando você estiver</span>
          <h2>Monte sua seleção em poucos minutos.</h2>
          <p>Você recebe uma URL exclusiva, copia e instala no Nuvio ou no Stremio.</p>
        </div>
        <a class="btn btn-primary btn-lg" href="/personalizar">Personalizar minhas rádios <span aria-hidden="true">→</span></a>
      </section>
    </main>
${footer()}`
}

export function renderRadioPlayerPage(station: Station, baseUrl: string): string {
  const name = escapeHtml(station.name)
  const slogan = escapeHtml(station.slogan ?? '')
  const about = escapeHtml(station.about ?? '')
  const logo = escapeHtml(station.favicon ?? `${baseUrl}/assets/logo.png`)
  const stream = escapeHtml(station.urlResolved ?? station.url ?? '')
  const primary = /fm\s+o\s+dia/i.test(station.name)
    ? '#ef233c'
    : /smooth|jazz/i.test(station.name)
      ? '#b91c3b'
      : '#7c3aed'
  const secondary = /fm\s+o\s+dia/i.test(station.name)
    ? '#fbbf24'
    : /smooth|jazz/i.test(station.name)
      ? '#f4e4b5'
      : '#22d3ee'
  return `${head(`${name} — RADIO BR`, `Ouça ${name} ao vivo.`, false)}
<main class="radio-player" style="--radio-primary:${primary};--radio-secondary:${secondary}">
  <div class="radio-visual" aria-hidden="true"><div class="radio-orb radio-orb-a"></div><div class="radio-orb radio-orb-b"></div><div class="radio-grid"></div><div class="radio-bars">${Array.from({ length: 28 }, () => '<i></i>').join('')}</div></div>
  <section class="radio-panel">
    <a class="radio-back" href="/">← RADIO BR</a>
    <img class="radio-logo" src="${logo}" alt="Logo de ${name}">
    <p class="radio-live">● AO VIVO</p>
    <h1>${name}</h1>
    ${slogan ? `<p class="radio-slogan">${name} – ${slogan}</p>` : ''}
    ${about ? `<p class="radio-about">${about}</p>` : ''}
    <audio controls autoplay preload="none" src="${stream}"></audio>
  </section>
</main>
<script>
  const bars=[...document.querySelectorAll('.radio-bars i')];
  function animate(){bars.forEach((bar,i)=>bar.style.height=(18+Math.abs(Math.sin(Date.now()/420+i*.73))*68+Math.random()*12)+'%');requestAnimationFrame(animate)} animate();
</script>
</body></html>`
}

function collectionCards() {
  return COLLECTION_DEFINITIONS.map((collection) => {
    const checked =
      collection.id === 'editorial' || collection.id === 'all' ? ' checked' : ''
    return `<label class="option-card">
      <input type="checkbox" name="collections" value="${collection.id}"${checked}>
      <span class="option-body">
        <span class="option-icon tone-${collectionTone(collection.id)}">${icon(collection.icon)}</span>
        <span class="option-copy">
          <strong>${escapeHtml(collection.name)}</strong>
          <small>${escapeHtml(collection.description)}</small>
        </span>
        <span class="switch" aria-hidden="true"></span>
      </span>
    </label>`
  }).join('\n      ')
}

function collectionTone(id: CollectionId): string {
  switch (id) {
    case 'editorial':
      return 'amber'
    case 'all':
      return 'indigo'
    case 'news-sports':
      return 'blue'
    default:
      return 'slate'
  }
}

function genreChips() {
  return musicGenreDefinitions()
    .map(
      (genre) => `<label class="chip">
        <input type="checkbox" name="genres" value="${genre.id}">
        <span>${escapeHtml(genre.name)}</span>
      </label>`,
    )
    .join('\n        ')
}

function stateFields() {
  return STATE_REGIONS.map((region) => {
    const states = STATES.filter((state) => state.region === region)
    return `<fieldset class="state-region">
          <legend>${escapeHtml(region)}</legend>
          <div class="state-grid">
            ${states
              .map(
                (
                  state,
                ) => `<label class="state-chip" title="${escapeHtml(state.name)}">
              <input type="checkbox" name="states" value="${state.code}" disabled>
              <span>${state.code}</span>
            </label>`,
              )
              .join('\n            ')}
          </div>
        </fieldset>`
  }).join('\n        ')
}

function dataScript() {
  const data = {
    collections: COLLECTION_DEFINITIONS.map(({ id, name }) => ({ id, name })),
    genres: musicGenreDefinitions(),
    states: STATES.map(({ code, name, region }) => ({ code, name, region })),
  }
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function renderConfigPage(): string {
  return `${head(
    'Central de personalização — RADIO BR',
    'Escolha coleções, gêneros e estados e gere uma URL exclusiva do RADIO BR para instalar no Nuvio ou Stremio.',
    true,
  )}
${header('personalizar')}
    <main id="conteudo">
      <section class="config-intro shell">
        <span class="eyebrow"><span class="eyebrow-dot"></span> Central de personalização</span>
        <h1>Monte seu <span class="gradient-text">RADIO BR</span>.</h1>
        <p>Escolha as coleções, os gêneros e os estados que quer receber. No fim, você recebe uma URL exclusiva com um manifesto JSON gerado para a sua seleção.</p>
      </section>

      <div class="wizard-layout shell">
        <form class="wizard" id="config-form" novalidate>
          <ol class="stepper" aria-label="Etapas da personalização">
            <li><button type="button" class="step-button is-active" data-step-target="1" aria-current="step"><span>1</span><small>Coleções</small></button></li>
            <li><button type="button" class="step-button" data-step-target="2"><span>2</span><small>Gêneros</small></button></li>
            <li><button type="button" class="step-button" data-step-target="3"><span>3</span><small>Estados</small></button></li>
            <li><button type="button" class="step-button" data-step-target="4"><span>4</span><small>Experiência</small></button></li>
            <li><button type="button" class="step-button" data-step-target="5"><span>5</span><small>Revisão</small></button></li>
          </ol>

          <section class="wizard-step is-active" data-step="1" aria-labelledby="step-1-title">
            <div class="step-heading">
              <span class="step-kicker">Etapa A</span>
              <h2 id="step-1-title">Coleções principais</h2>
              <p>Ative as coleções que farão parte da instalação. Você pode mudar tudo depois gerando uma nova URL.</p>
            </div>
            <fieldset class="option-grid">
              <legend class="sr-only">Coleções principais</legend>
              ${collectionCards()}
            </fieldset>
            <p class="step-note">Destaques editoriais e catálogo completo formam a instalação padrão. As demais coleções são opcionais.</p>
            <div class="step-actions">
              <span></span>
              <button type="button" class="btn btn-primary" data-step-next>Escolher gêneros <span aria-hidden="true">→</span></button>
            </div>
          </section>

          <section class="wizard-step" data-step="2" aria-labelledby="step-2-title" hidden>
            <div class="step-heading">
              <span class="step-kicker">Etapa B</span>
              <h2 id="step-2-title">Gêneros musicais</h2>
              <p>Selecione quantos gêneros quiser. Cada gênero ganha uma coleção e também aparece em “Rádios por gênero”.</p>
            </div>
            <div class="bulk-actions">
              <button type="button" class="text-button" data-action="select-all-genres">Selecionar todos</button>
              <button type="button" class="text-button text-button--muted" data-action="clear-genres">Limpar</button>
            </div>
            <div class="chip-grid" role="group" aria-label="Gêneros musicais">
              ${genreChips()}
            </div>
            <p class="step-note">A classificação usa somente as tags reais da Radio Browser. Não inferimos gênero pelo nome da estação.</p>
            <div class="step-actions">
              <button type="button" class="btn btn-ghost" data-step-prev>Voltar</button>
              <button type="button" class="btn btn-primary" data-step-next>Escolher estados <span aria-hidden="true">→</span></button>
            </div>
          </section>

          <section class="wizard-step" data-step="3" aria-labelledby="step-3-title" hidden>
            <div class="step-heading">
              <span class="step-kicker">Etapa C</span>
              <h2 id="step-3-title">Onde você quer ouvir?</h2>
              <p>Deixe em “Todos os estados” para não filtrar, ou escolha um ou vários estados.</p>
            </div>
            <label class="toggle-row toggle-row--large">
              <span>
                <strong>Todos os estados</strong>
                <small>Sem filtro de localização. Inclui estações de todo o Brasil.</small>
              </span>
              <input type="checkbox" id="all-states" checked>
              <span class="switch" aria-hidden="true"></span>
            </label>
            <div class="bulk-actions">
              <button type="button" class="text-button" data-action="select-all-states">Selecionar todos</button>
              <button type="button" class="text-button text-button--muted" data-action="clear-states">Limpar</button>
            </div>
            <div class="state-regions" id="state-regions">
              ${stateFields()}
            </div>
            <p class="step-note"><strong>Cidades:</strong> a arquitetura já está preparada, mas o filtro por cidade ainda não é exibido porque o campo de cidade da Radio Browser não é confiável o suficiente. Não inferimos localização pelo nome da estação, domínio ou telefone.</p>
            <div class="step-actions">
              <button type="button" class="btn btn-ghost" data-step-prev>Voltar</button>
              <button type="button" class="btn btn-primary" data-step-next>Definir experiência <span aria-hidden="true">→</span></button>
            </div>
          </section>

          <section class="wizard-step" data-step="4" aria-labelledby="step-4-title" hidden>
            <div class="step-heading">
              <span class="step-kicker">Etapa D</span>
              <h2 id="step-4-title">Elementos da experiência</h2>
              <p>Ajuste o que o addon envia para o cliente. Alguns controles são best-effort: o Nuvio pode aplicar substitutos próprios.</p>
            </div>
            <div class="toggle-list">
              <label class="toggle-row">
                <span><strong>Mostrar logotipos das rádios</strong><small>Quando o cliente permitir, usamos o favicon público da estação como pôster.</small></span>
                <input type="checkbox" id="show-logos" checked>
                <span class="switch" aria-hidden="true"></span>
              </label>
              <label class="toggle-row">
                <span><strong>Incluir coleções principais</strong><small>Mantém “Rádios em destaque” e “Todas as rádios” na instalação.</small></span>
                <input type="checkbox" id="include-main" checked>
                <span class="switch" aria-hidden="true"></span>
              </label>
              <label class="toggle-row">
                <span><strong>Incluir outros gêneros</strong><small>Adiciona outros gêneros e estações sem gênero informado.</small></span>
                <input type="checkbox" id="include-unknown">
                <span class="switch" aria-hidden="true"></span>
              </label>
            </div>
            <div class="included-card">
              <h3>Categorias incluídas</h3>
              <div class="chip-cloud" id="included-categories"></div>
              <p>A lista reflete as escolhas das etapas A e B. Você pode voltar e ajustar antes de revisar.</p>
            </div>
            <div class="step-actions">
              <button type="button" class="btn btn-ghost" data-step-prev>Voltar</button>
              <button type="button" class="btn btn-primary" data-step-next>Revisar configuração <span aria-hidden="true">→</span></button>
            </div>
          </section>

          <section class="wizard-step" data-step="5" aria-labelledby="step-5-title" hidden>
            <div class="step-heading">
              <span class="step-kicker">Etapa E</span>
              <h2 id="step-5-title">Revisão</h2>
              <p>Confira sua seleção. A URL só é gerada depois que o servidor valida a configuração.</p>
            </div>
            <div class="review-grid">
              <div class="review-block"><h3>Coleções</h3><div class="review-list" id="review-collections"></div></div>
              <div class="review-block"><h3>Gêneros</h3><div class="review-list" id="review-genres"></div></div>
              <div class="review-block"><h3>Estados</h3><div class="review-list" id="review-states"></div></div>
              <div class="review-block"><h3>Experiência</h3><div class="review-list" id="review-options"></div></div>
            </div>
            <div class="review-count"><strong id="review-count">0</strong> filtros ativos</div>
            <ul class="review-warnings">
              <li>O filtro por cidade ainda não está disponível; apenas estados.</li>
              <li>A filtragem por estado usa o campo <code>state</code> da Radio Browser e o lote de estações disponível no cache. Emissoras sem UF informada podem ficar de fora.</li>
              <li>O Nuvio pode não exibir todos os controles do protocolo Stremio. A URL personalizada e o manifesto continuam válidos.</li>
            </ul>
            <div class="alert alert-error" id="step-error" role="alert" hidden></div>
            <div class="step-actions">
              <button type="button" class="btn btn-ghost" data-step-prev>Voltar</button>
              <button type="submit" class="btn btn-primary btn-lg" id="generate-addon">Gerar meu addon <span aria-hidden="true">→</span></button>
            </div>
          </section>
        </form>

        <aside class="summary-card" aria-label="Resumo da personalização">
          <div class="summary-head">
            <span class="summary-kicker">Sua seleção</span>
            <h2>Resumo</h2>
          </div>
          <dl class="summary-list">
            <div><dt>Coleções</dt><dd id="summary-collections">Rádios em destaque + Todas</dd></div>
            <div><dt>Gêneros</dt><dd id="summary-genres">Nenhum</dd></div>
            <div><dt>Estados</dt><dd id="summary-states">Todos os estados</dd></div>
            <div><dt>Experiência</dt><dd id="summary-options">Logotipos visíveis</dd></div>
          </dl>
          <div class="summary-count"><strong id="active-filters">3</strong><small>filtros ativos</small></div>
          <p class="summary-warning" id="summary-warning" role="status"></p>
          <button type="button" class="btn btn-primary btn-block" data-step-target="5">Revisar e gerar</button>
          <p class="summary-note">Sem cadastro. Sua configuração fica apenas na URL gerada.</p>
        </aside>
      </div>

      <section class="result-panel shell" id="result" aria-labelledby="result-title" hidden>
        <div class="result-head">
          <div>
            <span class="eyebrow"><span class="eyebrow-dot"></span> Tudo pronto</span>
            <h2 id="result-title">Sua URL personalizada</h2>
            <p>Guarde este endereço. Ele contém a sua configuração e pode ser reutilizado para reinstalar o addon.</p>
          </div>
          <span class="result-badge">${icon('link')} Configuração persistente</span>
        </div>
        <div class="url-box">
          <label class="sr-only" for="result-url">URL de instalação personalizada</label>
          <input id="result-url" type="text" readonly>
          <button type="button" class="btn btn-primary" id="copy-url">Copiar URL</button>
        </div>
        <div class="result-actions">
          <a class="btn btn-ghost" id="open-manifest" href="#" target="_blank" rel="noreferrer">Abrir manifesto <span aria-hidden="true">↗</span></a>
          <a class="btn btn-ghost" id="install-stremio" href="#">Abrir no Stremio <span aria-hidden="true">↗</span></a>
        </div>
        <div class="manifest-preview">
          <div class="manifest-preview-head">
            <h3>Manifesto gerado</h3>
            <span>JSON dinâmico · somente leitura</span>
          </div>
          <pre><code id="manifest-json"></code></pre>
        </div>
        <div class="install-help">
          <div>
            <h3>Instalar no Nuvio</h3>
            <ol>
              <li>Copie a URL acima.</li>
              <li>Abra a área de addons do Nuvio.</li>
              <li>Escolha instalar por URL e cole o endereço.</li>
            </ol>
          </div>
          <div>
            <h3>Instalar no Stremio</h3>
            <ol>
              <li>Use o botão “Abrir no Stremio” ou copie a URL.</li>
              <li>Confirme a instalação do addon.</li>
              <li>Abra a seção de catálogos do addon.</li>
            </ol>
          </div>
        </div>
        <p class="result-note">Validação feita no servidor. Se o cliente recusar a URL personalizada, a instalação padrão em <a href="/manifest.json">/manifest.json</a> continua disponível.</p>
      </section>
    </main>
    <script id="radio-br-data" type="application/json">${dataScript()}</script>
${footer()}`
}
