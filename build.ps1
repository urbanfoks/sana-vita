# Збирає сторінки: src/pages/*.html + src/partials/{header,footer}.html -> *.html у корені.
# Перший рядок кожної сторінки: <!-- title: ... | desc: ... | nav: ключ-пункту-меню -->
# Запуск: powershell -ExecutionPolicy Bypass -File build.ps1
$root = $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$header = [IO.File]::ReadAllText("$root\src\partials\header.html", $utf8)
$footer = [IO.File]::ReadAllText("$root\src\partials\footer.html", $utf8)

Get-ChildItem "$root\src\pages" -Filter *.html | ForEach-Object {
  $src = [IO.File]::ReadAllText($_.FullName, $utf8)
  $m = [regex]::Match($src, '^\s*<!--\s*title:\s*(.*?)\s*\|\s*desc:\s*(.*?)\s*\|\s*nav:\s*(.*?)\s*-->')
  if (-not $m.Success) { throw "No meta line in $($_.Name)" }
  $title = $m.Groups[1].Value; $desc = $m.Groups[2].Value; $nav = $m.Groups[3].Value
  $body = $src.Substring($m.Length).Trim()
  # <!-- @include name --> вставляє src/partials/name.html
  $body = [regex]::Replace($body, '<!--\s*@include\s+([\w-]+)\s*-->', {
    param($mm) [IO.File]::ReadAllText("$root\src\partials\$($mm.Groups[1].Value).html", $utf8).Trim()
  })

  $h = $header
  if ($nav) { $h = $h -replace "data-nav=`"$nav`"", "data-nav=`"$nav`" aria-current=`"page`"" }

  $html = @"
<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title</title>
  <meta name="description" content="$desc">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

<!-- Згенеровано з src/ скриптом build.ps1 — редагуйте файли в src/ -->
$h
$body

$footer
<script src="script.js"></script>
</body>
</html>
"@
  [IO.File]::WriteAllText("$root\$($_.Name)", $html.Replace("`r`n", "`n"), $utf8)
  Write-Host "built $($_.Name)"
}
