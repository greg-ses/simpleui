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
                "Res16Name", "Res16Val"...)*/
//  Returns:  categories[], an array of unique category & subsystem pairs with corresponding headers

function get_unique_categories(inParams, $scope) {
    var categories = [];
    var len = inParams.length;
    var i = 0;
    var param;
    var catCount;
    var catKeys = [];
    var numResources;
    var resCount;
    var resourceHeaders = [];
    var r=0;

    for (; i < len; i++) {
        param = inParams[i];
        catSub = param.subsystem.concat( param.category );
        if ( catKeys.indexOf( catSub ) == -1) {
            catCount = catKeys.push( catSub );
            numResources = Object.keys( param.resources ).length;
            for ( ; r < numResources; r++ ) {
                resCount = resourceHeaders.push(param.resources[r].resource);
            }
            catCount = categories.push({ category: param.category, subsystem: param.subsystem, resHeaders: resourceHeaders });
            resourceHeaders = [];   //empty it out for the next unique category-subsystem pair
            r = 0;
        }
    }
    return (categories);
}