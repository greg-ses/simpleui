// ~/PubSub
// pub/sub topic definitions

define([], function () {
    return {
        //  List of user authorizations for page
        //        args: ppcJs.utilities.AccessControl.Task[]
        //        publishers: Auth panel
        //        subscribers: MainSystemPanel, MainBlockPanel
        authorizations: 'authorizations',


        //  Resource selection info
        //        args: [string] resourceId, resourceName, [bool] isMaster, [bool] subsysLocked
        //        publishers: SystemDiagram panel, ResourceSelect panel
        //        subscribers: MainSystemPanel
        selectResource: 'selectResourceBlock',


        //  (DEPRECATED) Name of selected resource
        //        args: [string] name
        //        publishers: SystemDiagramPanel, ProjectSummaryPanel
        //        subscribers: Main.html, InverterConverterSummary.html, IoPage.html, LogPanel
        resourceName: 'projectName',

        //  Last update timestamp
        //        args: [int] unix ms sinch epoch, [string] panel name
        //        publishers: IoPanel, ScriptRunner
        //        subscribers: AjaxStatusPanel
        timeUpdate: 'timeUpdate',

        //  communication timed out
        //        args: [string] panel name
        //        publishers: IoPanel, ScriptRunner
        //        subscribers: AjaxStatusPanel
        commTimeout: 'commTimeout',

        //  communication fault (server returns 4xx)
        //        args: [string] panel name
        //        publishers: IoPanel
        //        subscribers: AjaxStatusPanel
        commFault: 'commFault',

        //  fixed window
        //        args: [ppcJs.WindowSelectDto.State] windowState
        //        publishers: MultimodeChartPanel
        //        subscribers: FleetViewer
        windowData: 'windowData',

        //  full URL
        //        args: callback(string URL)
        //        publishers: WindowGrid
        //        subscribers: MovingWindowChart
        exportLink: 'exportLink'
    };
});

