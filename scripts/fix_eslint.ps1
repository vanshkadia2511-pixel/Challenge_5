$ErrorActionPreference = "Stop"

# Fix LandingPage.tsx - void expression
$file = "d:\Challenge_5\src\ui\pages\LandingPage.tsx"
$content = [System.IO.File]::ReadAllText($file)
$content = $content.Replace(
    "onClose={() => setShowAIModal(false)}",
    "onClose={() => { setShowAIModal(false); }}"
)
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "LandingPage.tsx fixed"

# Fix VendorMarketplacePage.tsx - template literal number + unescaped quotes
$file2 = "d:\Challenge_5\src\ui\pages\VendorMarketplacePage.tsx"
$content2 = [System.IO.File]::ReadAllText($file2)
# Fix template literal number: ${vendor.rating} -> ${String(vendor.rating)}
$content2 = $content2.Replace('`\u2605 ${vendor.rating}`', '`\u2605 ${String(vendor.rating)}`')
$content2 = $content2.Replace('"${vendor.questions[0]}"', '&ldquo;{vendor.questions[0]}&rdquo;')
[System.IO.File]::WriteAllText($file2, $content2, [System.Text.Encoding]::UTF8)
Write-Host "VendorMarketplacePage.tsx fixed"

Write-Host "All done"
