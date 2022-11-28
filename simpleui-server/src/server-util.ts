/**
 * Created by jscarsdale on 2019-10-17.
 */
import { Logger, LogLevel } from './server-logger';
import { ProcessInfo } from './interfaces';
import {ParamsDictionary, Request} from 'express-serve-static-core';

export class ServerUtil {

    private static findProcess = require('find-process');
    private static trackedProcesses = new Array<ProcessInfo>();

    static deepCopy(obj: any) {
        if (typeof obj === 'undefined') {
            return obj;
        }

        return structuredClone(obj)
    }


    static htmlspecialchars(s: string) {
        const retVal =
            s.replace(/&/g, '&amp;')
                .replace(/</g, '&gt;')
                .replace(/>/g, '&lt;')
                .replace(/'/g, '&quot;')
                .replace(/"/g, '&#039;')

        return retVal;
    }

    static getServerError(errorName: string, search = '', replacement = '') {

        const SERVER_ERRORS = {
                'EMPTY_FILENAME':            {code: '1001', msg: 'Empty filename'},
                'INVALID_ERROR_CODE':        {code: '1002', msg: 'Invalid error code (%d)'},
                'INVALID_REQUEST_FILE':      {code: '1003', msg: 'Invalid file (%s) in request.'},
                'PORT_PROP_DISABLED':        {code: '1004', msg: 'In properties file, enabled flag is set to false.'},
                'NO_SERVER_RESPONSE':        {code: '1005', msg: 'No response from server.'},
                'MISSING_DEPEND_ON_PROCESS': {code: '1006', msg: 'Depends-on process "{{PROCESS}}" is not available.'},
                'ZMQ_ERROR':                 {code: '1007', msg: 'Error from ZMQ "{{ERROR}}"'}
                };
        let message = `<error>Error ${SERVER_ERRORS[errorName].code}: ${SERVER_ERRORS[errorName].msg}</error>`;
        if (search.length > 0) {
            message = message.replace(search, replacement);
        }

        return message;
    }

    static async getProcessInfo(processName: string, outProcessInfo: any) {
        // Every 1 second, see if a process named processInfo.name exists.
        // Update the processInfo.isRunning and .nextCheck members to reflect current state.

        if (processName.length === 0) {
            throw new Error('In getProcessInfo(), processName cannot be empty.');
        }

        if (! (outProcessInfo instanceof Object)) {
            throw new Error('In getProcessInfo(), outProcessInfo must an Object');
        }

        let processInfo = ServerUtil.trackedProcesses[processName];
        if (typeof processInfo === 'undefined') {
            // Create a new record
            processInfo = ServerUtil.trackedProcesses[processName] = {
                name: processName,
                isRunning: false,
                nextCheck: 0
            };
        }

        const currTimeStamp = new Date().getTime();
        if (currTimeStamp > processInfo.nextCheck) {
            // Update the process status
            processInfo.nextCheck = currTimeStamp + 1000; // 1 second from now

            await ServerUtil.findProcess('name', processInfo.name, true)
                .then((list) => {
                    processInfo.isRunning = (list.length > 0);
                    // console.log(`there are ${list.length} ${processName} process(es)`);
                }, (err) => {
                    processInfo.isRunning = false;
                    Logger.log(LogLevel.DEBUG, `Error in findProcess ${err}`);
            });
        }
        outProcessInfo['name']  = processInfo.name;
        outProcessInfo['isRunning']  = processInfo.isRunning;
        outProcessInfo['nextCheck']  = processInfo.nextCheck;

        return true;
    }


    static formatDate(d: Date, granularity = 'day') {
        const month = d.getMonth() + 1;
        const sMonth = (month < 10) ? '0' + month : '' + month;
        const day = d.getDate();
        const sDay = (day < 10) ? '0' + day : '' + day;
        if (granularity === 'second') {
            return `${d.getFullYear()}-${sMonth}-${sDay}.${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        }
        return `${d.getFullYear()}-${sMonth}-${sDay}`;
    }

    static logRequestDetails(logLevel: LogLevel, req: Request<ParamsDictionary>,
        message: string, caller: string, cmdType: string, cmd: any) {

        Logger.log(logLevel,
            `\n\n${message}` +
            `\n${caller}(` +
            `\n  req.url:                 ${req.url}` +
            `\n  req.params.appName:      ${req.params.appName}` +
            `\n  req.params.propsStub:    ${req.params.propsStub}` +
            `\n  req.params.tabName:      ${req.params.tabName}` +
            `\n  command type:            ${cmdType}` +
            `\n  req.params.zmqPortExpr:  ${req.params.zmqPortExpr}` +
            `\n  req.query.cmd:           ${req.query.cmd}` +
            `\n  req.params.zmqCmd:       ${req.params.zmqCmd}` +
            `\n  req.params.zmqValue:     ${req.params.zmqValue}` +
            `\n  source used:             ${cmd.source}` +
            `\n  cmd used:                ${cmd.cmd}\n`
        );
    }

    /**
     * parses the ZMQ ports out of a props object
     * @param props
     * @returns
     */
    static getZMQPortsFromProps(props: any) {
        let ports = []
        for (let macroIndex = 0; macroIndex < props.macro.length; macroIndex++) {
            let macro = props.macro[macroIndex];
            if (Object.getOwnPropertyNames(macro).includes('replacement') &&
                Object.getOwnPropertyNames(macro).includes('property') &&
                macro.property.endsWith('.port')) {
                let port = parseInt(macro.replacement);
                ports.push(port);
            }
        }
        return ports
    }
}
