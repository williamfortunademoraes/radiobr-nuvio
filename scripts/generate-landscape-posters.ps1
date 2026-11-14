Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path (Get-Location) 'assets/logos/stations'
$files = Get-ChildItem $sourceDir -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg', '.jfif' -and $_.Name -notlike '*-landscape.jpg' }

function Quantize-Channel([int]$value) {
  return [Math]::Min(240, [Math]::Max(0, [int]([Math]::Floor($value / 16)) * 16))
}

foreach ($source in $files) {
  $targetPath = Join-Path $sourceDir (($source.BaseName + '-landscape.jpg'))
  try {
    $image = [System.Drawing.Image]::FromFile($source.FullName)
  } catch {
    Write-Warning "Skipping unsupported image: $($source.Name)"
    continue
  }
  $canvas = [System.Drawing.Bitmap]::new(1280, 720)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

  # Sample the logo border instead of scaling the logo into the background.
  # Quantization makes nearby shades count as the same flat background color.
  $samples = @()
  $step = [Math]::Max(1, [int]([Math]::Min($image.Width, $image.Height) / 32))
  for ($x = 0; $x -lt $image.Width; $x += $step) {
    $samples += $image.GetPixel($x, 0)
    $samples += $image.GetPixel($x, $image.Height - 1)
  }
  for ($y = 0; $y -lt $image.Height; $y += $step) {
    $samples += $image.GetPixel(0, $y)
    $samples += $image.GetPixel($image.Width - 1, $y)
  }

  $colorCounts = @{}
  foreach ($color in $samples) {
    $key = "{0},{1},{2}" -f (Quantize-Channel $color.R), (Quantize-Channel $color.G), (Quantize-Channel $color.B)
    $colorCounts[$key] = 1 + ($colorCounts[$key] ?? 0)
  }
  $dominant = $colorCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1
  $rgb = $dominant.Key.Split(',') | ForEach-Object { [int]$_ }
  $backgroundColor = [System.Drawing.Color]::FromArgb($rgb[0], $rgb[1], $rgb[2])
  $graphics.Clear($backgroundColor)

  $quality = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 90L)
  $canvas.Save($targetPath, $quality, $encoderParams)
  $encoderParams.Dispose(); $graphics.Dispose(); $canvas.Dispose(); $image.Dispose()
}

# WebP is not supported by System.Drawing on this host. Keep a curated color
# override for the known logo until a PNG/JPG replacement is supplied.
$overrides = @{
  'tmc-100-1-landscape.jpg' = [System.Drawing.Color]::FromArgb(8, 56, 16)
}
foreach ($override in $overrides.GetEnumerator()) {
  $targetPath = Join-Path $sourceDir $override.Key
  $canvas = [System.Drawing.Bitmap]::new(1280, 720)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear($override.Value)
  $quality = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 90L)
  $canvas.Save($targetPath, $quality, $encoderParams)
  $encoderParams.Dispose(); $graphics.Dispose(); $canvas.Dispose()
}
