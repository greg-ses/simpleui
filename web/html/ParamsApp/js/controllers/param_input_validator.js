// JavaScript source code

// Input validation function
//  Parameters:  p1: input to be tested, p2: data type, p3: minimum of range or length, p4: maximum range or length
//  Returns:  True or False
function inputValidated(pVal, pType, pMin, pMax) {
    var result = false;
    var  boolValues = ["0", "1", "true", "false"];
    if (pVal) {
        pMin = Number(pMin);
        pMax = Number(pMax);
        switch (pType) {
            case "int":
                pVal = Number( pVal );
                if (((pMin <= pVal) && (pMax >= pVal)) && ((Math.floor(pVal) == pVal))) {
                    result = true;
                }
                break;
            case "float":
            case "double":
                pVal = Number( pVal );
                if ((typeof pVal === "number") && (pMin <= pVal) && (pMax >= pVal)) {
                    result = true;
                }
                break;
            case "bool":
                pVal = pVal.toLowerCase();
                if ( boolValues.indexOf( pVal ) !== -1) {
                    result = true;
                }
                break;
            case "string":
                //if ((pVal.length <= pMax) && (pVal.length >= pMin)) {
                    result = true;
                //}
                break;
            default:
                break;
        }
        if (result) {
            return (true);
        } else {
            return (false);
        }
    }
}