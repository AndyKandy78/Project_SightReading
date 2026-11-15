Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "     Casio / MIDI Device Connection Check     " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$devices = Get-PnpDevice | Where-Object { $_.FriendlyName -match 'CASIO' }

if ($devices) {
    $devices | Select-Object Status, Present, FriendlyName, InstanceId | Format-Table -AutoSize
    $active = $devices | Where-Object { $_.Present -eq $true }
    if ($active) {
        Write-Host "Status: SUCCESS! Windows sees your Casio keyboard as CONNECTED." -ForegroundColor Green
        Write-Host "Open the SightReading app in Chrome or Edge and click 'Rescan'." -ForegroundColor Green
    } else {
        Write-Host "Status: Windows recognizes the keyboard, but reports it as NOT PRESENT (Present = False)." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Troubleshooting steps:" -ForegroundColor White
        Write-Host "  1. Power: Make sure your Casio keyboard is switched ON (power light/screen lit)." -ForegroundColor Gray
        Write-Host "  2. Cable: Verify the USB cable is firmly inserted into both the keyboard and laptop." -ForegroundColor Gray
        Write-Host "  3. Port: Try a different USB port directly on your laptop (avoid unpowered hubs)." -ForegroundColor Gray
        Write-Host "  4. Cable type: Confirm your USB cable supports data transfer, not charge-only." -ForegroundColor Gray
    }
} else {
    Write-Host "No Casio device found in Windows device list." -ForegroundColor Red
    Write-Host "Try plugging in your USB cable to let Windows detect it." -ForegroundColor Gray
}

Write-Host ""
