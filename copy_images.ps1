$src = "C:\Users\Umar Shaikh\.gemini\antigravity-ide\brain\d737c29c-bf3c-4a1b-8c2f-862ad6057c2b"
$dest = "c:\Users\Umar Shaikh\OneDrive\Desktop\rasoi\assets\recipes"

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}

$files = @(
    @{ Pattern = "gulab_jamun_*.jpg"; Target = "gulab_jamun.jpg" },
    @{ Pattern = "lasagne_classico_*.jpg"; Target = "lasagne_classico.jpg" },
    @{ Pattern = "dal_makhani_*.jpg"; Target = "dal_makhani.jpg" },
    @{ Pattern = "paneer_butter_masala_*.jpg"; Target = "paneer_butter_masala.jpg" },
    @{ Pattern = "royal_lamb_biryani_*.jpg"; Target = "royal_lamb_biryani.jpg" },
    @{ Pattern = "chicken_tikka_masala_*.jpg"; Target = "chicken_tikka_masala.jpg" }
)

foreach ($f in $files) {
    $found = Get-ChildItem -Path $src -Filter $f.Pattern | Select-Object -First 1
    if ($found) {
        Copy-Item -Path $found.FullName -Destination (Join-Path $dest $f.Target) -Force
        Write-Host "Copied $($found.Name) -> $($f.Target)" -ForegroundColor Green
    } else {
        Write-Host "Not found: $($f.Pattern)" -ForegroundColor Red
    }
}
