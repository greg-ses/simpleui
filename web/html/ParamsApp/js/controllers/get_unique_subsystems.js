// JavaScript source code

// Input validation function
//  Parameters:  inParams, array containing all param/abstract param detail from server
                /*  from Params.php   ===>   array("catDisplayOrder", "paramDisplayOrder", "category", "paramName",
                "type", "min", "max", "description", "detail", "u_id", "subsystem", "timestamp",               
                "Res1Name", "Res1Val", "Res2Name", "Res2Val", "Res3Name", "Res3Val",
                "Res4Name", "Res4Val", "Res5Name", "Res5Val", "Res6Name", "Res6Val",
                "Res7Name", "Res7Val", "Res8Name", "Res8Val"/*, "Res9Name", "Res9Val",
                "Res10Name", "Res10Val", "Res11Name", "Res11Val", "Res12Name", "Res12Val",
                "Res13Name", "Res13Val", "Res14Name", "Res14Val", "Res15Name", "Res15Val",
                "Res16Name", "Res16Val")*/
//  Returns:  subsystems[] - array of unique subsystem names

function get_unique_subsystems(inParams) {
    var len = inParams.length;
    var i = 0;
    var param;
    var subsysCount;
    var subsystems = [];

    for (; i < len; i++) {
        param = inParams[i];
        if (subsystems.indexOf( param.subsystem ) == -1) {
          subsysCount = subsystems.push( param.subsystem );
        }
    }
    return (subsystems);
}