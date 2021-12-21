$json = Get-Content .\package.json | ConvertFrom-Json -AsHashtable

$deps = $json.dependencies.GetEnumerator() | % {
    "'$($_.Name)@latest'"
} | Join-String -Separator " "

Invoke-Expression "npm install $deps"

$devDeps = $json.devDependencies.GetEnumerator() | % {
    "$($_.Name)@latest"
}

Invoke-Expression "npm install --save-dev $devDeps"