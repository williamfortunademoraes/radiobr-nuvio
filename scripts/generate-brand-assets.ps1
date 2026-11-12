# Original RADIO BR artwork. Run from the repository root on Windows.
Add-Type -AssemblyName System.Drawing
$assetsPath = Join-Path $PSScriptRoot '../assets'
function Draw-Radio($graphics, $color) {
    $pen = [System.Drawing.Pen]::new($color, 12)
    $pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawRectangle($pen, 64, 95, 128, 84)
    $graphics.DrawLine($pen, 82, 95, 172, 55)
    $graphics.DrawLine($pen, 87, 125, 87, 149)
    $graphics.DrawLine($pen, 109, 115, 109, 159)
    $graphics.DrawLine($pen, 131, 125, 131, 149)
    $graphics.DrawLine($pen, 166, 125, 174, 125)
    $font = [System.Drawing.Font]::new('Arial', 27, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new($color)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString('RADIO BR', $font, $brush, [System.Drawing.PointF]::new(128, 188), $format)
    $format.Dispose(); $brush.Dispose(); $font.Dispose(); $pen.Dispose()
}
$logo = [System.Drawing.Bitmap]::new(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($logo)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)
Draw-Radio $graphics ([System.Drawing.Color]::White)
$logo.Save((Join-Path $assetsPath 'logo.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $logo.Dispose()
$background = [System.Drawing.Bitmap]::new(1600, 900)
$graphics = [System.Drawing.Graphics]::FromImage($background)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#102923'))
$graphics.TranslateTransform(110, 160)
$graphics.ScaleTransform(1.5, 1.5)
Draw-Radio $graphics ([System.Drawing.ColorTranslator]::FromHtml('#79e3a2'))
$graphics.ResetTransform()
$brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$font = [System.Drawing.Font]::new('Arial', 52, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$graphics.DrawString('Estações de rádios - Brasil', $font, $brush, 110, 610)
$font.Dispose(); $brush.Dispose()
$background.Save((Join-Path $assetsPath 'background.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $background.Dispose()
