
<#
Script by Zack Beucler

Checks chrome and firefox every X seconds to see if either has crashed.
If one has crashed, it records the timestamp to browser_results.txt



How to run:

open powershell
.\browser-died.ps1
#>



# create txt file
$result_filename = ".\browser_results.txt"
New-Item -ItemType File -Path $result_filename


# write start timestamp to file
$startTimeStamp = get-date

Add-Content $result_filename $startTimeStamp


$chrome_break = $false
$firefox_break = $false

while ($true) {

    try {
        if ((get-process chrome).Responding){
            # get timestamp
            $chromeTimeStamp = get-date
            # "chrome died: " + timestamp
            $c_line = "chrome: " + $chromeTimeStamp
            # save to txt file
            Add-Content $result_filename $c_line
            $chrome_break = $true

        } else {
            # chrome is alive
        }
    } catch {
        # chrome is probably not running
        write-output "is chrome running?"
    }



    try {
        if ((get-process firefox).Responding){
            # get timestamp
            $firefoxTimeStamp = get-date
            $f_line = "firefox: " + $firefoxTimeStamp
            # save to txt file
            Add-Content $result_filename $f_line
            $firefox_break = $true

        } else {
            # firefox is alive
        }
    } catch {
        # firefox is probably not running
        write-output "is firefox running?"
    }


    if ($chrome_break -and $firefox_break){
        write-output "both browsers died, shutting down"
        break
    }


    start-sleep -Seconds 60
}


