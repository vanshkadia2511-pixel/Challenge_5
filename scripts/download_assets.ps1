$ErrorActionPreference = "Continue"
$dir = "public\images"
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

$images = @(
    @{ Name = "hero-wedding-arch.jpg"; Url = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80" },
    @{ Name = "card-wedding.jpg"; Url = "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "card-birthday.jpg"; Url = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "card-community.jpg"; Url = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "dashboard-banner.jpg"; Url = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80" },
    @{ Name = "vendor-venue.jpg"; Url = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "vendor-decor.jpg"; Url = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "vendor-caterer.jpg"; Url = "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "vendor-photographer.jpg"; Url = "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "vendor-entertainment.jpg"; Url = "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80" },
    @{ Name = "vendor-invitations.jpg"; Url = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80" }
)

foreach ($img in $images) {
    $target = Join-Path $dir $img.Name
    if (Test-Path $target) {
        Write-Host "Already exists: $($img.Name)"
        continue
    }
    Write-Host "Downloading $($img.Name)..."
    try {
        Invoke-WebRequest -Uri $img.Url -OutFile $target
        $len = (Get-Item $target).Length
        Write-Host "Saved $($img.Name) ($len bytes)"
    } catch {
        Write-Host "FAILED $($img.Name): $($_.Exception.Message)"
    }
}
