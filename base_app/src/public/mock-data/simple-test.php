<?php

$prevXml = "<Data_Summary u_id=\"2001\">
    <fileVersion value=\"0\"/>
    <Title u_id=\"2002\">BMS</Title>
    <timeStamp u_id=\"2003\">1518199422339</timeStamp>
    <Section name=\"EPO : Safety System\" u_id=\"2004\">
        <DataSets u_id=\"2005\">
            <EPO_Control u_id=\"2006\">
                <Cont_ResetEPO class=\"\" u_id=\"2008\">
                    <command cmd=\"Cont_ResetEPO\" confirm=\"false\" desc=\"Reset the container EPO system\" dest=\"0\"
                             disabled=\"false\" idnum=\"1\" label=\"Reset_EPO\" name=\"Cont_ResetEPO\" u_id=\"2009\"/>
                </Cont_ResetEPO>
            </EPO_Control>
            <VCU_Inputs u_id=\"2009\">
                <dyn class=\"off\" desc=\" [som-demo1-VEC:Safety_IN_1_2_Bypass]\" name=\"Door_Bypass\" u_id=\"2011\">off</dyn>
                <dyn class=\"on\" desc=\" [som-demo1-VEC:Safety_IN1_a]\" name=\"ZS301A_Switch_Door_Side_A\" u_id=\"2012\">on</dyn>
            </VCU_Inputs>
        </DataSets>
	</Section>
</Data_Summary>";


$currXml = "<Data_Summary u_id=\"2001\">
    <fileVersion value=\"0\"/>
    <Title u_id=\"2002\">BMS</Title>
    <timeStamp u_id=\"2003\">1518199422339</timeStamp>
    <Section name=\"EPO : UnSafety System\" u_id=\"1004\">
    </Section>
    <Section name=\"EPO : Safety System\" u_id=\"2004\">
        <DataSets u_id=\"2005\">
            <EPO_Control u_id=\"2006\">
                <Cont_ResetEPO class=\"\" u_id=\"2008\">
                    <command cmd=\"Cont_ResetEPO\" confirm=\"false\" desc=\"Reset the container EPO system\" dest=\"0\"
                             disabled=\"false\" idnum=\"1\" label=\"Reset_EPO\" name=\"Cont_ResetEPO\" u_id=\"2009\"/>
                </Cont_ResetEPO>
            </EPO_Control>
            <VCU_Inputs u_id=\"2009\">
                <dyn class=\"off\" desc=\" [som-demo1-VEC:Safety_IN_1_2_Bypass]\" name=\"Door_Bypass\" u_id=\"2011\">off</dyn>
                <dyn class=\"on\" desc=\" [som-demo1-VEC:Safety_IN1_a]\" name=\"ZS301A_Switch_Door_Side_A\" u_id=\"2012\">on</dyn>
                <dyn class=\"off\" desc=\" [som-demo1-VEC:Safety_IN1_b]\" name=\"ZS301B_Switch_Door_Side_B\" u_id=\"2013\">off</dyn>
            </VCU_Inputs>
        </DataSets>
	</Section>
</Data_Summary>";

$prevDom = new DOMDocument();
$prevDom->loadXML($prevXml);

$currDom = new DOMDocument();
$currDom->loadXML($currXml);

//$differ = new XMLDiff/Memory;
//$diffDom = $differ->diff($prevDom, $currDom);


echo "<pre>\n";

echo "---------------------------------\n";
echo "PrevDom:\n";
echo "---------------------------------\n";
echo $prevDom->saveXml();

echo "\n---------------------------------\n";
echo "CurrDom:\n";
echo "---------------------------------\n";
echo $currDom->saveXml();

echo "\n---------------------------------\n";
echo "Diff:\n";
echo "---------------------------------\n";
echo $diffDom->saveXml();

echo "</pre>\n";

?>

