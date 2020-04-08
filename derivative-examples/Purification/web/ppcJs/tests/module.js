dojo.provide('ppcJs.tests.module');

try {
    
    dojo.require('ppcJs.tests.AccessControlTest');
    dojo.require('ppcJs.tests.DataFormatTest');
    dojo.require('ppcJs.tests.FileUtilityTest');
    dojo.require('ppcJs.tests.StoreUtilityTest');
    dojo.require('ppcJs.tests.CSVTest'); 
    dojo.require('ppcJs.tests.CompatibilityUtilitiesTest');
    dojo.require('ppcJs.tests.ReflectionTest'); 
    dojo.require('ppcJs.tests.DateStringUtilityTest'); 
//    dojo.require('ppcJs.tests.IdentityUtilityTest');  ported to intern

    //dojo.require('ppcJs.tests.CallQueueTest'); 
    dojo.require('ppcJs.tests.FlashTimerTest');
    dojo.require('ppcJs.tests.WatchdogTest');
    dojo.require('ppcJs.tests._XhrClientTest');
    dojo.require('ppcJs.tests._CookieClientTest');

    dojo.require('ppcJs.tests.SampleSetTest');
    dojo.require('ppcJs.tests.DataSampleToSeriesAdapterTest');
    dojo.require('ppcJs.tests.TimeScaleTest');

    // widgets - no longer function due to browsers' Java security restrictions
/*    dojo.require('ppcJs.tests.ExtendedSelectTest');       
    dojo.require('ppcJs.tests.LedStackTest');
    dojo.require('ppcJs.tests.iPhoneButtonTest'); 
    dojo.require('ppcJs.tests.PlayBackTest');
    dojo.require('ppcJs.tests.FadeoutAlertBoxTest');
    dojo.require('ppcJs.tests.LockedCheckBoxTest');
    dojo.require('ppcJs.tests.BinaryRadioButtonTest');
    dojo.require('ppcJs.tests.CollapseToggleTest'); 
     
    dojo.require('ppcJs.tests.AjaxStatusControlTest');
    dojo.require('ppcJs.tests.ParamControlTest');
    dojo.require('ppcJs.tests.ParamControlUITest');
    //dojo.require('ppcJs.tests.ProjectSummaryChartTest');      deprecated: not ported
    //dojo.require('ppcJs.tests.ResourceSummaryPanelUITest');   deprecated: not ported
    dojo.require('ppcJs.tests.DiagramBlockControlTest');
    //dojo.require('ppcJs.tests.MainPanelControlTest');         deprecated: not ported
    //dojo.require('ppcJs.tests.BaseControlTest');              deprecated: not ported
    //dojo.require('ppcJs.tests.AcAcControlTest');              deprecated: not ported
    //dojo.require('ppcJs.tests.DcDcControlTest');              deprecated: not ported
    dojo.require('ppcJs.tests.DcServerDataTest');
    //dojo.require('ppcJs.tests.PumpControlTest');              deprecated: not ported
    dojo.require('ppcJs.tests.WindowSelectControlTest');
    //dojo.require('ppcJs.tests.BattResourceBlockControlTest'); deprecated: not ported
    //dojo.require('ppcJs.tests.LogControlTest');               deprecated: not ported
    //dojo.require('ppcJs.tests.vaGridTest');                   deprecated: not ported
    //dojo.require('ppcJs.tests.SystemDataGridControlTest');    deprecated: not ported

    dojo.require('ppcJs.tests._PanelTest');
    dojo.require('ppcJs.tests.MovingWindowChartTest');

    dojo.require('ppcJs.tests.FileListAccessorTest'); 
    dojo.require('ppcJs.tests.FileManagerTest'); 
*/
    dojo.require('ppcJs.tests.ExtensionMapTest');
    dojo.require('ppcJs.tests._ScriptTemplateBuilderTest'); 
    dojo.require('ppcJs.tests.ScriptObjectRelMapTest');
    dojo.require('ppcJs.tests.EntryControlFactoryTest'); 
    dojo.require('ppcJs.tests.ViewStateTransitionProviderTest');
    dojo.require('ppcJs.tests.StateRegisterTest');
/*
    dojo.require('ppcJs.tests.EditControlTest'); 
    dojo.require('ppcJs.tests.ScriptEntryControlTest');
    dojo.require('ppcJs.tests.InsertCommandMenuControlTest'); 
    dojo.require('ppcJs.tests.TimeSpanControlTest');
    dojo.require('ppcJs.tests.DateTimeControlTest');
    dojo.require('ppcJs.tests.TimeOfDayControlTest');
    dojo.require('ppcJs.tests.ScriptRunnerTest');
    dojo.require('ppcJs.tests.ScriptManagerTest');
    */
}
catch (e) {
    doh.debug(e);
}