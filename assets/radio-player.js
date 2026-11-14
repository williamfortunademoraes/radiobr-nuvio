/* global Event, requestAnimationFrame */

;(() => {
  'use strict'

  const page = document.querySelector('.radio-player')
  const logo = document.querySelector('.radio-logo')
  const bars = [...document.querySelectorAll('.radio-bars i')]
  if (!page || !logo) return

  function animate() {
    bars.forEach((bar, index) => {
      bar.style.height = `${18 + Math.abs(Math.sin(Date.now() / 420 + index * 0.73)) * 68 + Math.random() * 12}%`
    })
    requestAnimationFrame(animate)
  }

  function dominantColor(image) {
    if (!image.naturalWidth || !image.naturalHeight) return null

    const canvas = document.createElement('canvas')
    const size = 48
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null

    context.drawImage(image, 0, 0, size, size)
    const pixels = context.getImageData(0, 0, size, size).data
    const buckets = new Map()

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3]
      if (alpha < 150) continue

      const red = pixels[index]
      const green = pixels[index + 1]
      const blue = pixels[index + 2]
      const lightness =
        (Math.max(red, green, blue) + Math.min(red, green, blue)) / 2
      const chroma = Math.max(red, green, blue) - Math.min(red, green, blue)
      // Empty/white logo backgrounds should not overpower the brand color.
      if (lightness > 242 || lightness < 12) continue

      const key = [red >> 4, green >> 4, blue >> 4].join(',')
      const score = 1 + chroma / 255
      const bucket = buckets.get(key) || {
        red: 0,
        green: 0,
        blue: 0,
        weight: 0,
      }
      bucket.red += red * score
      bucket.green += green * score
      bucket.blue += blue * score
      bucket.weight += score
      buckets.set(key, bucket)
    }

    let winner = null
    for (const bucket of buckets.values()) {
      if (!winner || bucket.weight > winner.weight) winner = bucket
    }
    if (!winner) return null

    return `rgb(${Math.round(winner.red / winner.weight)} ${Math.round(winner.green / winner.weight)} ${Math.round(winner.blue / winner.weight)})`
  }

  function applyBrandColor(color) {
    page.style.setProperty('--radio-primary', color)
    page.style.setProperty(
      '--radio-secondary',
      `color-mix(in srgb, ${color} 62%, white)`,
    )
    page.dataset.colorSource = 'logo'
  }

  logo.addEventListener(
    'load',
    () => {
      try {
        const color = dominantColor(logo)
        if (color) applyBrandColor(color)
      } catch {
        // Remote logos without CORS stay on the server-side fallback palette.
      }
    },
    { once: true },
  )

  if (logo.complete) logo.dispatchEvent(new Event('load'))
  animate()
})()
