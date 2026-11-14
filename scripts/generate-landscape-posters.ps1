Add-Type -AssemblyName System.Drawing

$sourceDir = Join-Path (Get-Location) 'assets/logos/stations'
$files = Get-ChildItem $sourceDir -File | Where-Object { $_.Extension -in '.png', '.jpg', '.jpeg', '.jfif', '.webp' -and $_.Name -notlike '*-landscape.jpg' }

foreach ($source in $files) {
  $targetPath = Join-Path $sourceDir (($source.BaseName + '-landscape.jpg'))
  $image = [System.Drawing.Image]::FromFile($source.FullName)
  $canvas = [System.Drawing.Bitmap]::new(1280, 720)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.Color]::FromArgb(12, 10, 18))

  $coverScale = [Math]::Max(1280 / $image.Width, 720 / $image.Height)
  $coverWidth = [int]($image.Width * $coverScale)
  $coverHeight = [int]($image.Height * $coverScale)
  $coverX = [int]((1280 - $coverWidth) / 2)
  $coverY = [int]((720 - $coverHeight) / 2)
  $graphics.DrawImage($image, $coverX, $coverY, $coverWidth, $coverHeight)
  $graphics.FillRectangle([System.Drawing.Brushes]::Black, 0, 0, 1280, 720)

  $containScale = [Math]::Min(660 / $image.Width, 560 / $image.Height)
  $containWidth = [int]($image.Width * $containScale)
  $containHeight = [int]($image.Height * $containScale)
  $containX = [int]((1280 - $containWidth) / 2)
  $containY = [int]((720 - $containHeight) / 2)
  $graphics.DrawImage($image, $containX, $containY, $containWidth, $containHeight)

  $quality = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 90L)
  $canvas.Save($targetPath, $quality, $encoderParams)
  $encoderParams.Dispose(); $graphics.Dispose(); $canvas.Dispose(); $image.Dispose()
}
