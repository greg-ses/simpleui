<?php

/* DbSchemaDefs.php
 *
 * PHP Module containing prerequisite table and view definitions for the Parameter Editing UI.
 *
 */

require_once "ParamHelper.php";
$AbstractParameterTable = $GLOBALS["AbstractParameterTable"];
$DataParameterTable = $GLOBALS["DataParameterTable"];


define("TABLE_EXISTS_QUERY",
"select count(distinct t.table_name) as tableExists
 from information_schema.tables t
 where t.table_type = 'BASE TABLE'
 and t.table_schema = '%s'
 and t.table_name = '%s';");

define("DROP_VIEW_QUERY", "DROP VIEW IF EXISTS %s");

define("VIEW_EXISTS_QUERY",
"select count(distinct t.table_name) as viewExists
 from information_schema.views t
 where t.table_schema = '%s'
 and t.table_name = '%s';");


$requiredTables = array(

    "AbstractParameter" =>
        "CREATE TABLE `$AbstractParameterTable` (
	  `name` char(64) NOT NULL DEFAULT '',
	  `type` char(10) NOT NULL DEFAULT '',
	  `min` char(64) NOT NULL DEFAULT '',
	  `max` char(64) NOT NULL DEFAULT '',
	  `category` char(64) NOT NULL DEFAULT 'Global',
	  `displayOrder` smallint(6) NOT NULL DEFAULT '-1',
	  `description` varchar(256) NOT NULL DEFAULT '',
	  `detail` tinyint(4) NOT NULL DEFAULT '1',
	  `subsystem` char(10) NOT NULL DEFAULT '',
	  `visibility` tinyint(1) NOT NULL DEFAULT '1',
	  PRIMARY KEY (`name`,`subsystem`,`category`)
	) ENGINE=InnoDB DEFAULT CHARSET=latin1;",

    "Parameter" =>													// creates the table :(
        "CREATE TABLE `$DataParameterTable` (
	  `name` char(64) NOT NULL DEFAULT '',
	  `resource` char(16) NOT NULL DEFAULT '',
	  `timestamp` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
	  `value` char(64) NOT NULL DEFAULT '',
	  `subsystem` char(10) NOT NULL DEFAULT '',
	  PRIMARY KEY (`name`,`resource`,`timestamp`)
	) ENGINE=InnoDB DEFAULT CHARSET=latin1;"
); /* End of array $requiredTables */

$requiredViews = array(

    "ParameterCategory" =>
        "CREATE VIEW `ParameterCategory` AS
	SELECT
	    (SELECT COUNT(DISTINCT(ap1.category))
	     FROM $AbstractParameterTable ap1
	     WHERE ap1.displayOrder < ap3.displayOrder
	     AND ap1.category <> ap3.category
	    ) AS catDisplayOrder,

	    ap3.category,

	    (SELECT COUNT(DISTINCT(ap2.name))
	     from $AbstractParameterTable ap2
	     where ap2.category = ap3.category) as paramCount,

	    (SELECT COUNT(DISTINCT(ap2.name))
	     from $AbstractParameterTable ap2
	     where ap2.category = ap3.category and ap3.visibility = '1') as visibleParamCount,

	     ap3.subsystem
	FROM $AbstractParameterTable ap3
	GROUP by ap3.category, ap3.subsystem
	ORDER by ap3.displayOrder;",

    "AbstractParameterByCategory" =>
        "CREATE VIEW `AbstractParameterByCategory` AS
	SELECT
	  pc.catDisplayOrder,
	  ap.displayOrder as paramDisplayOrder,
	  pc.category,
	  ap.name as paramName,
	  `ap`.`type` as `type`, ap.min, ap.max,
	  ap.description, ap.detail, ap.subsystem
	FROM `ParameterCategory` as pc inner join `$AbstractParameterTable` as ap
	     on ap.category = pc.category
	     and ap.subsystem = pc.subsystem
	WHERE ap.visibility = TRUE
	ORDER BY pc.catDisplayOrder, ap.displayOrder;",

    "ParameterResource" =>
        "CREATE VIEW `ParameterResource` AS
SELECT
    (SELECT COUNT(DISTINCT(p1.resource))+1
     FROM $DataParameterTable as p1
     WHERE p1.resource < p2.resource
     AND p1.resource <> p2.resource
     AND p1.subsystem = p2.subsystem
     AND p1.category = p2.category
    ) AS resourceIndex,
     p2.resource
FROM $DataParameterTable p2
GROUP by p2.resource
ORDER by p2.resource;",

    "ParameterResourcePivot" =>
        "CREATE VIEW `ParameterResourcePivot` AS
	SELECT
	  apd.subsystem, catDisplayOrder, paramDisplayOrder, apd.category, paramName,
	  `type`, `min`, `max`, description, detail, `timestamp`,
	         MAX(IF(resourceIndex  = 1, p.resource, '')) AS  Res1Name,
	         MAX(IF(resourceIndex  = 1, p.value, ''))    AS  Res1Val,

	         MAX(IF(resourceIndex =  2, p.resource, '')) AS  Res2Name,
	         MAX(IF(resourceIndex =  2, p.value, ''))    AS  Res2Val,

	         MAX(IF(resourceIndex =  3, p.resource, '')) AS  Res3Name,
	         MAX(IF(resourceIndex =  3, p.value, ''))    AS  Res3Val,

	         MAX(IF(resourceIndex =  4, p.resource, '')) AS  Res4Name,
	         MAX(IF(resourceIndex =  4, p.value, ''))    AS  Res4Val,

	         MAX(IF(resourceIndex =  5, p.resource, '')) AS  Res5Name,
	         MAX(IF(resourceIndex =  5, p.value, ''))    AS  Res5Val,

	         MAX(IF(resourceIndex =  6, p.resource, '')) AS  Res6Name,
	         MAX(IF(resourceIndex =  6, p.value, ''))    AS  Res6Val,

	         MAX(IF(resourceIndex =  7, p.resource, '')) AS  Res7Name,
	         MAX(IF(resourceIndex =  7, p.value, ''))    AS  Res7Val,

	         MAX(IF(resourceIndex =  8, p.resource, '')) AS  Res8Name,
	         MAX(IF(resourceIndex =  8, p.value, ''))    AS  Res8Val,

	         MAX(IF(resourceIndex =  9, p.resource, '')) AS  Res9Name,
	         MAX(IF(resourceIndex =  9, p.value, ''))    AS  Res9Val,

	         MAX(IF(resourceIndex = 10, p.resource, '')) AS Res10Name,
	         MAX(IF(resourceIndex = 10, p.value, ''))    AS Res10Val,

	         MAX(IF(resourceIndex = 11, p.resource, '')) AS Res11Name,
	         MAX(IF(resourceIndex = 11, p.value, ''))    AS Res11Val,

	         MAX(IF(resourceIndex = 12, p.resource, '')) AS Res12Name,
	         MAX(IF(resourceIndex = 12, p.value, ''))    AS Res12Val,

	         MAX(IF(resourceIndex = 13, p.resource, '')) AS Res13Name,
	         MAX(IF(resourceIndex = 13, p.value, ''))    AS Res13Val,

	         MAX(IF(resourceIndex = 14, p.resource, '')) AS Res14Name,
	         MAX(IF(resourceIndex = 14, p.value, ''))    AS Res14Val,

	         MAX(IF(resourceIndex = 15, p.resource, '')) AS Res15Name,
	         MAX(IF(resourceIndex = 15, p.value, ''))    AS Res15Val,

	         MAX(IF(resourceIndex = 16, p.resource, '')) AS Res16Name,
	         MAX(IF(resourceIndex = 16, p.value, ''))    AS Res16Val

	FROM (`AbstractParameterByCategory` as apd
	       inner join `$DataParameterTable` as p
	       ON apd.paramName = p.name
	       and apd.category = p.category
	          and apd.subsystem = p.subsystem)
	      inner join ParameterResource as pr on p.resource = pr.resource
	GROUP BY apd.subsystem, catDisplayOrder , paramDisplayOrder, apd.category, paramName, p.timestamp
	ORDER BY apd.subsystem, catDisplayOrder, paramDisplayOrder, p.resource, p.timestamp desc;"

); /* End of array $requiredViews */


/**
 *  createRequiredDbEntities()
 *
 *  Creates a required table or view if missing.
 *
 *  Arguments:
 * 	$entityType - "BASE TABLE" or "VIEW"
 * 	$entityName - the name of the required view or table
 *
 *  Returns:
 *		"" (empty string) if the table already exists
 *     $entityName if the table/view was created
 */
function createRequiredDbEntities($dbName, $user, $pw, $dbHost, $quiet = false)
{
    $return = "\n";
    $conn = new mysqli($dbHost, $user, $pw, $dbName);

    $reqTables = $GLOBALS['requiredTables'];
    $reqViews = $GLOBALS['requiredViews'];

    /* Define any missing req table */
    foreach($reqTables as $tableName => $tableDef) {

        $query = sprintf(TABLE_EXISTS_QUERY, $dbName, $tableName);		// create a query to check if the db and table exist
        $result = $conn->query($query); 								// perform query
		if (! $result) {
			return false;
		}
        $rs = $result->fetch_array(MYSQLI_ASSOC);

		if ($rs['tableExists'] != "0") {
            $return .= $tableName . " (preexisting table)\n";
        }
    }

    /* Define any missing req view */
    foreach($reqViews as $viewName => $viewDef) {
        $query = sprintf(DROP_VIEW_QUERY, $viewName);
        $result = $conn->query($query);
        if (! $quiet) {
            printf("\n\n>> dropped view %s result: %d\n", $viewName, $result);
        }

        $query = sprintf(VIEW_EXISTS_QUERY, $dbName, $viewName);
        $result = $conn->query($query);
        $rs = $result->fetch_array(MYSQLI_ASSOC);

        if ($rs['viewExists'] == "0") {
            $return .= $viewName . " (created view)\n";
            if (! $quiet) {
                echo "\nviewDef:\n" . $viewDef;
            }
            $result = $conn->query($viewDef);
            if (! $quiet) {
                printf("\n\n>> create view %s result: %d\n", $viewName, $result);
            }
        } else {
            $return .= $viewName. " (preexisting view)\n";
        }
    }

    $conn->close();

    return $return;

}
?>

