# Created by: Zack Beucler
# Detects if chrome or firefox are non-responsive or frozen
# Prints what process is in a "Uninterruptible" state (D)



# white true
    # ps aux | awk '{if ($8 ="D") print}'
    # figure out how to change the above line to focus only on
        # chrome and firefox

    # wait for 60s
