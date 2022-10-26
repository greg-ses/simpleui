import {SuiData} from './sui_data';
import {DisplayLogLevel, Logger, LogLevel} from './server-logger';
import * as express from 'express';
import * as cors from 'cors';
import * as os from 'os';
import {PropsFileReader} from './props-file-reader';
import {CommandArgs} from './interfaces';
import {ServerUtil} from './server-util';
import {ParamsDictionary, Request, Response} from 'express-serve-static-core';
import * as fs from 'fs';


const app = express();




/*
const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };
*/

export class SimpleUIServer {
    static SERVER_IP = '0.0.0.0';
    static BACKLOG = 511;
    static EXTERNAL_IP = SimpleUIServer.getExternalIP();
    static requestCallbacks = 0;
    static bin_dir = "";
    static newMockDataURL: any = ""; // allows us to modify the mock data requests via mock cmd requests
    static webPortString = "";
    static SIGNALS = {
        'SIGHUP': 1,
        'SIGINT': 2,
        'SIGTERM': 15
    }

    static executeMockRequest(cmdArgs: CommandArgs, props: any, req: Request<ParamsDictionary> = null, res: Response = null) {
        if (props) {
            SuiData.mockSuiRequest(cmdArgs, props, req, res);
        } else {
            Logger.log(LogLevel.ERROR, 'invalid config (no props)');
        }
    }

    static setBinDir(argv1): void {
        SimpleUIServer.bin_dir = argv1.substr(0, argv1.lastIndexOf('/'));
        console.log(`bin_dir: ${SimpleUIServer.bin_dir}`);
    }

    static getExternalIP(): string {
        let ipAddress = '0.0.0.0';
        const ifaces = os.networkInterfaces();

        Object.keys(ifaces).forEach(ifname => {
            let alias = 0;

            ifaces[ifname].forEach(iface => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }

                if (alias === 0) {
                    ipAddress = iface.address;
                    console.log(`interface: ${ifname}`);
                } else {
                    // console.log(`${ifname}:${alias}`, iface.address);
                }
                ++alias;
            });
        });

        return ipAddress;
    }

    static parseCommandLine(cmdLine: string): any {
        const cmdVars: CommandArgs = <CommandArgs> {
            valid: true,
            help: '\nSyntax:\n\n', // Each arg help is appended in arg definition

            examples: '\n\nExample for running as a daemon:' +
                '\n  node simpleui-server.js \\' +
                '\n     --appName=bms \\' +
                '\n     --webPort=2080' +

                '\n\nExample for running the test:' +
                '\n  node simpleui-server.js \\' +
                '\n    --mode=test \\' +
                '\n    --appName=bms \\' +
                '\n    --webPort=2080 \\' +
                '\n    --xmlInFile=src/public/simpleui-server/test/bms.reference.xml \\' +
                '\n    --jsonOutFile=src/public/simpleui-server/test/bms.reference.json',

            errors: 'Invalid command line:\n\n', // Each error is appended when parsing args
            mode: 'daemon',
            appName: '',
            webPort: '2080',
            xmlInFile: '',
            jsonOutFile: ''
        };

        cmdVars.help += '\n    -m or --mode=     (optional) the mode (daemon or test) - defaults to daemon';
        let match = cmdLine.match(/(\W+-m\W+|--mode=)([^ \t]+)/);
        if (match) {
            cmdVars.mode = match[2];
            if (['daemon', 'test'].indexOf(cmdVars.mode) === -1) {
                cmdVars.valid = false;
                cmdVars.errors += `Invalid arg value for "${match[1]}" - must be "daemon" or "test"\n`;
            }
        }

        cmdVars.help += '\n    -a or --appName=      (required) is the appName (the simple-ui derivative root web folder).';
        cmdVars.help += '\n                          Examples: -a bms   or  --appName=bms';
        match = cmdLine.match(/(\W+-a\W+|--appName=)([^ \t]+)/);
        if (match) {
            cmdVars.appName = match[2];
        } else {
            cmdVars.valid = false;
            cmdVars.errors += `Missing required argument "-a value" or "--appName=value"\n`;
        }

        cmdVars.help += '\n    -w or --webPort=       (optional) is the webPort prefix. Defaults to "2080" if not passed.';
        match = cmdLine.match(/(\W+-p\W+|--webPort=)([0-9]+)/);
        if (match) {
            cmdVars.webPort = match[2];
        }

        cmdVars.help += '\n    -x or --xmlInFile=    (testonly) is the input XML file that substitutes for a backend ZMQ query';
        match = cmdLine.match(/(\W+-x\W+|--xmlInFile=)([^ \t]+)/);
        if (match) {
            cmdVars.xmlInFile = match[2];
        }

        if (cmdVars.xmlInFile !== '') {
            cmdVars.mode = 'test';
        }

        if (cmdVars.mode === 'test') {
            if (cmdVars.xmlInFile === '') {
                cmdVars.valid = false;
                cmdVars.errors += `When --mode=test, --xmlInFile must have a value.\n`;
            }
        }

        return cmdVars;
    }

    static printServerInfo(cmdVars: any): void {
        Logger.log(LogLevel.INFO, `app.listen callback: ${++SimpleUIServer.requestCallbacks}`)
        Logger.log(LogLevel.INFO,
            `\n==> Server started at http://${os.hostname()}${SimpleUIServer.webPortString}\n\n==> Handled Requests:`);
        Logger.log(LogLevel.INFO, `\nNote: Only the first 5 ZMQ responses will be logged at INFO level.`);
        Logger.log(LogLevel.INFO, `      To see later responses, set the LogLevel to DEBUG with this URL:\n`);
        let hostname = `${os.hostname()}`;
        if (hostname.match(/[a-z0-9]{12}/)  && !hostname.match(/site/i)) {
            // crude attempt to see if this is a docker hostname
            hostname = 'localhost';
        }
        Logger.log(LogLevel.INFO, `          ` +
            `http://${hostname}${SimpleUIServer.webPortString}/` +
            `${cmdVars.appName.split(',')[0]}/` +
            `svr-util/SetLogLevel/DEBUG\n`);
        return;
    }

    static main() {
        try {

            Logger.logLevel = LogLevel.INFO;

            // Parse input arguments
            SimpleUIServer.setBinDir(process.argv[1]);
            const cmdVars = SimpleUIServer.parseCommandLine(process.argv.join(' '));
            if (!cmdVars.valid) {
                Logger.log(LogLevel.ERROR, `${cmdVars.errors}${cmdVars.help}`);
                return 1;
            }

            const originsWhiteList = [
                `http://localhost`,
                "http://localhost:4100",
                "http://localhost:4200",
                `http://svcapache`,
                `http://svcmariadb`,
                `http://svcnode-vts`,
                `http://svcnode-simvts`,
                `http://svcnode-ems`,
                `http://svcnode-bms`,
                `http://svcnode-simvnx1000`,
                `http://${os.hostname()}`,
                `http://127.0.0.1`,
                `http://${SimpleUIServer.getExternalIP()}`,
            ];

            const corsOptions = {
                origin: function (origin, callback) {
                    const isWhiteListed = (originsWhiteList.indexOf(origin) > -1);
                    callback(null, isWhiteListed);
                },
                credentials: true
            };

            app.use(cors(corsOptions));
            app.use(express.json() as express.RequestHandler);
            app.use(express.urlencoded({ extended: true }) as express.RequestHandler);

            const appPropFiles = PropsFileReader.getAppPropsFiles(cmdVars.appName, cmdVars.webPort);

            // handle --mode=test
            if (cmdVars.mode === 'test') {
                SimpleUIServer.executeMockRequest(cmdVars, appPropFiles);
                return 0;
            }

            // handle --mode=daemon

            // MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 SIGINT listeners added.
            // This error happens because ZMQ requests are stalling / taking too long.
            // But it's possible to experiments with upping the limit from the default of 10 as shown below.
            const maxListeners = 200;
            process.setMaxListeners(maxListeners);

            // --------------------------------------------------------------------------------------------
            // IMPORTANT NOTE ABOUT HANDLERS:
            // Any change made to the handlers below must be accounted for in the <Directory />
            // section's rewrite block that port forwards from the normal port to the simpleui-server port.
            // --------------------------------------------------------------------------------------------

            // ----------------------------------------
            // Handler for managing this app (svr-util)
            // ----------------------------------------
            Logger.log(LogLevel.INFO, `\n==> Internal Web-Server Management`);
            const suiSvrUtility = `/${cmdVars.appName.split(',')[0]}/svr-util/:svrCmdName/:svrCmdValue`;
            const svrCmds = ['SetLogLevel'];
            SimpleUIServer.webPortString = (cmdVars.webPort === '80') ? '' : `:${cmdVars.webPort}`;
            let displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${suiSvrUtility}`;
            let spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(web svr mgmt)`);
            Logger.log(LogLevel.INFO,
                `                where :svrCmdName  is (${svrCmds.join(' | ')})\n` +
                `                and   :svrCmdValue is (${Object.keys(DisplayLogLevel).join(' | ')})`);
            app.get(`${suiSvrUtility}`, (req, res) => {
                Logger.log(LogLevel.VERBOSE, `svr-util request callback: ${++SimpleUIServer.requestCallbacks}`);
                // Replies with data from a zeromq request
                try {
                    // setLogLevel command
                    if (req.params.svrCmdName === svrCmds[0]) {
                        const result = Logger.setLogLevel(req.params.svrCmdValue);
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('charset', 'UTF-8');
                        const svrCmdResponse = `{"svr-util": {` +
                            `"SvrCmd": "${req.params.svrCmdValue}", ` +
                            `"CmdValue": "${req.params.svrCmdValue}", ` +
                            `"Status": "${result}."` +
                            `}`;
                        res.send(svrCmdResponse);
                    }
            } catch (err) {
                const cmd = SuiData.getCmdFromReq(req);
                ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                    `Err in svr-util request: ${err}`,
                    'main svr-util handler', '/svr-util/cmdName/cmdValue', cmd);
            }
            });

            const displayName =
                (cmdVars.appName.indexOf(',') > -1)
                    ? `(${cmdVars.appName.replace(',', ' | ')})`
                    : `${cmdVars.appName}`;

            Logger.log(LogLevel.INFO, `\n==> /var/www/${displayName}`);


            // --------------------------------
            // Handler for properties requests
            // --------------------------------
            const propsFileQuery = `/:appName/:propsStub/query/props`;
            displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${propsFileQuery}`;
            spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(properties)`);
            app.get(`${propsFileQuery}`, async (req, res) => {
                Logger.log(LogLevel.VERBOSE, `props request callback: ${++SimpleUIServer.requestCallbacks}`);
                try {
                    const props = PropsFileReader.getProps(
                        `${req.params.propsStub}.properties`,
                        `${req.params.appName}`, cmdVars.webPort);
                    await PropsFileReader.propsFileRequest(req, res, props);
                } catch (err) {
                    const cmd = SuiData.getCmdFromReq(req);
                    ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                        `Err in props request: ${err}`,
                        'main props handler', '/query/props', cmd);
                }
            });

            // ------------------------------
            // Handler for data requests
            // ------------------------------
            // Support path # /APP_NAME/UI_PROP/TAB_NAME/query/data/zmq/PORT/COMMAND_NAME
            const dataQuery = [
                `/:appName/:propsStub/:tabName/query/data/zmq/:zmqPortExpr/:zmqCmd`,
                `/:appName/:propsStub/:tabName/query/data/zmq/:zmqPortExpr/:zmqCmd/:zmqValue`
            ];
            displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${dataQuery[1]}`;
            spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(data)`);
            app.get(dataQuery, async (req, res) => {
                // Replies with data from a zeromq request
                Logger.log(LogLevel.VERBOSE, `data request callback: ${++SimpleUIServer.requestCallbacks}`);
                try {
                    const props = PropsFileReader.getProps(
                        `${req.params.propsStub}.properties`,
                        `${req.params.appName}`, cmdVars.webPort);
                    await SuiData.suiDataRequest(req, res, props);
                } catch (err) {

                    const cmd = SuiData.getCmdFromReq(req);
                    ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                        `Err in data request: ${err}`,
                        'main data handler', '/query/data/zmq', cmd);
                }
            });


            // ------------------------------
            // Handler for cmd requests
            // ------------------------------
            // Support path # /APP_NAME/UI_PROP/TAB_NAME/query/cmd/zmq/PORT/COMMAND_NAME
            const cmdQuery = [
                `/:appName/:propsStub/:tabName/query/cmd/zmq/:zmqPortExpr/:zmqCmd`,
                `/:appName/:propsStub/:tabName/query/cmd/zmq/:zmqPortExpr/:zmqCmd/:zmqValue`
            ];

            displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${cmdQuery[1]}`;
            spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(commands)`);
            app.post(cmdQuery, async (req, res) => {
                // Replies with data from a zeromq request
                Logger.log(LogLevel.VERBOSE, `cmd request callback: ${++SimpleUIServer.requestCallbacks}`);
                try {
                    const props = PropsFileReader.getProps(
                        `${req.params.propsStub}.properties`,
                        `${req.params.appName}`, cmdVars.webPort);
                    await SuiData.suiCommandRequest(req, res, props);
                } catch (err) {

                    const cmd = SuiData.getCmdFromReq(req);
                    ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                        `Err in cmd request: ${err}`,
                        'main cmd handler', '/query/cmd/zmq', cmd);
                }
            });


            // ------------------------------
            // Handler for mock data requests
            // ------------------------------
            // Support path # /APP_NAME/UI_PROP/TAB_NAME/mock/data
            const mockDataQuery = [
                `/:appName/:propsStub/:tabName/mock/data`
            ];
            displayUrl = `http://localhost${SimpleUIServer.webPortString}${mockDataQuery[0]}`;
            spacer1 = ' '.repeat(Math.max((104 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}/${spacer1}(mock data)`);
            app.get(mockDataQuery, async (req, res) => {
                // Replies with data from a zeromq request
                Logger.log(LogLevel.VERBOSE, `data request callback: ${++SimpleUIServer.requestCallbacks}`);
                
                if (SimpleUIServer.requestCallbacks % 10 === 0) {
                    SimpleUIServer.newMockDataURL = "";
                }

                try {
                    const props = PropsFileReader.getProps(
                        `${req.params.propsStub}.properties`,
                        `${req.params.appName}`, cmdVars.webPort);

                    const mockCmdVars = cmdVars;
                    mockCmdVars.xmlInFile = SimpleUIServer.newMockDataURL !== "" ? SimpleUIServer.newMockDataURL : req.query.file;
                    mockCmdVars.versions = (typeof req.query.versions === 'string') ? parseInt(req.query.versions, 10) : 1;
                    await SimpleUIServer.executeMockRequest(mockCmdVars, props, req, res);
                } catch (err) {

                    ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                        `Err in mock data request: ${err}`,
                        'mock data handler', '/mock/data', `?file=${cmdVars.xmlInFile}`);
                }
            });


            // ------------------------------
            // Handler for mock cmd requests
            // ------------------------------
            // Support path # /APP_NAME/UI_PROP/TAB_NAME/mock/cmd
            const mockCmdQuery = [
                `/:appName/:propsStub/:tabName/mock/cmd`
            ];
            displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${mockCmdQuery[0]}`;
            spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(commands)`);
            app.post(mockCmdQuery, async (req, res) => {
                Logger.log(LogLevel.VERBOSE, `mock cmd request callback: ${++SimpleUIServer.requestCallbacks}`);
                try {
                    const cmdFilepath = req.query.file;
                    Logger.log(LogLevel.DEBUG, `mock cmd filepath: ${cmdFilepath}`);
                    SimpleUIServer.newMockDataURL = cmdFilepath;
                } catch (err) {
                    Logger.log(LogLevel.ERROR, err)
                    Logger.log(LogLevel.ERROR, 'Error in mock cmd handler')
                }
                res.json({'mock data placeholder': 123})
            });


            // -------------------------------------
            // Handler for css_elements_to_json call
            // -------------------------------------
            // Support path # /APP_NAME/UI_PROP/query/css_elements_to_json/:overlay/2
            const cssToJsonQuery = [
                `/:appName/:propsStub/query/css_elements_to_json/:overlay/:nthOverlay`
            ];
            displayUrl = `http://${os.hostname()}${SimpleUIServer.webPortString}${cssToJsonQuery[0]}`;
            spacer1 = ' '.repeat(Math.max((105 - displayUrl.length), 1));
            Logger.log(LogLevel.INFO, `Starting listener for ${displayUrl}${spacer1}(cssToJson)`);
            app.get(cssToJsonQuery, async (req, res) => {
                Logger.log(LogLevel.VERBOSE, `css_elements_to_json request callback: ${++SimpleUIServer.requestCallbacks}`);
                try {
                    const props = PropsFileReader.getProps(
                        `${req.params.propsStub}.properties`,
                        `${req.params.appName}`, cmdVars.webPort);
                    await SuiData.suiCssToJsonRequest(req, res, props);
                } catch (err) {
                    const cmd = SuiData.getCmdFromReq(req);
                    ServerUtil.logRequestDetails(LogLevel.ERROR, req,
                        `Err in cssToJsonQuery request: ${err}`,
                        'main cssToJsonQuery handler', '/query/css_elements_to_json/overlay', cmd);
                }
            });

            

            // ------------------------------
            // start the Express server
            // ------------------------------
            try {
                const server = app.listen(cmdVars.webPort, SimpleUIServer.SERVER_IP, SimpleUIServer.BACKLOG, () => SimpleUIServer.printServerInfo(cmdVars));
                

            } catch (err) {
                Logger.log(LogLevel.ERROR, `Error in app.listen(): ${err}`);
            }
        } catch (err) {
            Logger.log(LogLevel.ERROR, `Error in main: ${err}`);
        }
    }
}

SimpleUIServer.main();
