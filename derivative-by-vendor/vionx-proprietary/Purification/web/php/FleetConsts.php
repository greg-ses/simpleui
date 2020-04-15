<?php

class FleetConsts
{
	public static $resources = Array("PB150"
									, "TF2000"
									, "TF2000_Quad"
									, "SSTS_r01"
									, "SSTS"
									, "SSTS_Quad_r01"
									, "SSTS_Quad"
									, "LTS"
									, "QTS"
                                    , "ETS"
                                    , "ETSJR");

	static function validResourceType($type)
	{
		return in_array($type, self::$resources);
	}
}