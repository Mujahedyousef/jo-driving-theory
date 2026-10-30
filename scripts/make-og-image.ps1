# يرسم صورة المشاركة الاجتماعية (1200x630) إلى public/og-image.jpg باستخدام .NET على ويندوز.
# التشغيل: powershell -ExecutionPolicy Bypass -File scripts/make-og-image.ps1
Add-Type -AssemblyName System.Drawing

$W = 1200; $H = 630
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'
$g.InterpolationMode = 'HighQualityBicubic'

function C($r, $gg, $b) { [System.Drawing.Color]::FromArgb(255, $r, $gg, $b) }

# الخلفية: تدرج أخضر مزرق
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (C 15 118 110), (C 8 51 68), 35
$g.FillRectangle($grad, $rect)

# الطريق في الأسفل
$g.FillRectangle((New-Object System.Drawing.SolidBrush (C 17 24 39)), 0, 520, $W, 110)
$dash = New-Object System.Drawing.SolidBrush (C 248 250 252)
for ($x = 20; $x -lt $W; $x += 120) { $g.FillRectangle($dash, $x, 570, 64, 7) }

# شاخصة قف (مثمن)
$cx = 175; $cy = 175; $r = 100
function Octagon($cx, $cy, $r) {
  $pts = @()
  for ($i = 0; $i -lt 8; $i++) { $a = [Math]::PI / 8 + $i * [Math]::PI / 4; $pts += New-Object System.Drawing.PointF ($cx + $r * [Math]::Cos($a)), ($cy + $r * [Math]::Sin($a)) }
  return ,$pts
}
$g.FillPolygon((New-Object System.Drawing.SolidBrush (C 255 255 255)), (Octagon $cx $cy 100))
$g.FillPolygon((New-Object System.Drawing.SolidBrush (C 214 40 40)), (Octagon $cx $cy 88))

$rtl = New-Object System.Drawing.StringFormat
$rtl.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft -bor [System.Drawing.StringFormatFlags]::NoWrap
$ctr = New-Object System.Drawing.StringFormat
$ctr.Alignment = 'Center'; $ctr.LineAlignment = 'Center'
$ctr.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft

function Font($size) { New-Object System.Drawing.Font 'Segoe UI', $size, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel) }
$white = New-Object System.Drawing.SolidBrush (C 255 255 255)
$g.DrawString('قف', (Font 62), $white, (New-Object System.Drawing.RectangleF ($cx - 90), ($cy - 60), 180, 120), $ctr)

# شاخصة تحذير (مثلث)
$tri = @((New-Object System.Drawing.PointF 175, 300), (New-Object System.Drawing.PointF 270, 455), (New-Object System.Drawing.PointF 80, 455))
$g.FillPolygon($white, $tri)
$pen = New-Object System.Drawing.Pen (C 214 40 40), 14
$pen.LineJoin = 'Round'
$g.DrawPolygon($pen, $tri)
$dark = New-Object System.Drawing.SolidBrush (C 17 24 39)
$g.FillRectangle($dark, 168, 350, 14, 52)
$g.FillEllipse($dark, 167, 412, 16, 16)

# شاخصة السرعة (دائرة)
$g.FillEllipse($white, 320, 330, 150, 150)
$pen2 = New-Object System.Drawing.Pen (C 214 40 40), 16
$g.DrawEllipse($pen2, 328, 338, 134, 134)
$g.DrawString('50', (Font 64), $dark, (New-Object System.Drawing.RectangleF 320, 330, 150, 150), $ctr)

# النصوص (من اليمين لليسار)
$textRect = { param($y, $h) New-Object System.Drawing.RectangleF 480, $y, 660, $h }
$pillBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(70, 255, 255, 255))
$g.FillRectangle($pillBrush, 600, 50, 540, 52)
$g.DrawString('فحص السواقة النظري • الأردن', (Font 30), $white, (New-Object System.Drawing.RectangleF 610, 54, 520, 46), $rtl)

$g.DrawString('دليلك للفحص النظري', (Font 84), $white, (New-Object System.Drawing.RectangleF 300, 150, 840, 130), $rtl)
$sub = New-Object System.Drawing.SolidBrush (C 230 244 242)
$g.DrawString('دروس مبسّطة وأسئلة بالشرح', (Font 50), $sub, (& $textRect 290 70), $rtl)
$g.DrawString('واختبار تجريبي مثل الامتحان', (Font 50), $sub, (& $textRect 350 70), $rtl)

# شارات صفراء
$yellow = New-Object System.Drawing.SolidBrush (C 244 180 0)
$g.FillRectangle($yellow, 890, 440, 250, 56)
$g.DrawString('مجاني بالكامل', (Font 34), $dark, (New-Object System.Drawing.RectangleF 890, 446, 250, 48), $ctr)
$g.FillRectangle($yellow, 480, 440, 395, 56)
$g.DrawString('سيارات • شاحنات • دراجات', (Font 31), $dark, (New-Object System.Drawing.RectangleF 480, 446, 395, 48), $ctr)

$out = Join-Path (Resolve-Path 'public').Path 'og-image.jpg'
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
$bmp.Save($out, $codec, $ep)
$g.Dispose(); $bmp.Dispose()
Write-Host "saved: $out"
