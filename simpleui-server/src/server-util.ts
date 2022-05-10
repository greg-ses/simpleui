/**
 * Created by jscarsdale on 2019-10-17.
 *
 * For deepCopy() function.
 *
 * Based on deepClone() example from
 *     https://stackoverflow.com/questions/40291987/javascript-deep-clone-object-with-circular-references/40293777#40293777
 *
 *     and
 *
 *     function deepCopy() from ../nodejs/json-normalizer.ts
 */
import { Logger, LogLevel } from './server-logger';
import { ProcessInfo } from './interfaces';
import {ParamsDictionary, Request} from 'express-serve-static-core';

export class ServerUtil {

    private static findProcess = require('find-process');
    private static trackedProcesses = new Array<ProcessInfo>();

    static deepCopy(obj: any) {

        if (typeof obj === 'undefined') {
            // return value is also undefined
            return obj;
        }

        let clonedObject: any;

        if (obj instanceof Array) {
            clonedObject = Object.assign([], obj);

            for (let j = 0; j < obj.length; j++) {
                clonedObject[j] = ServerUtil.deepCopy(obj[j]);
            }

            return clonedObject;

        } else if (['number', 'string', 'boolean'].indexOf(typeof obj) > -1) {
            return obj;
        } else {

            clonedObject = Object.assign({}, obj);

            const allKeys = Object.keys(clonedObject);

            for (let i = 0; i < allKeys.length; i++) {
                if (clonedObject[allKeys[i]] instanceof Array) {
                    clonedObject[allKeys[i]] = ServerUtil.deepCopy(clonedObject[allKeys[i]]);
                } else if (clonedObject[allKeys[i]] instanceof Date) {
                    clonedObject[allKeys[i]] = new Date(clonedObject[allKeys[i]].valueOf());
                } else if (clonedObject[allKeys[i]] instanceof Object){
                    clonedObject[allKeys[i]] = ServerUtil.deepCopy(clonedObject[allKeys[i]]);
                }
            }
            return clonedObject;
        }
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
                    Logger.log(LogLevel.DEBUG, `Error in findProcess`);
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

        let row = (s1: string, s2: string, s3: string, s4: string): string => {
            let S1 = s1 || ''; let S2 = s2 || ''; let S3 = s3 || ''; let S4 = s4 || '';
            let pad1 = ' '.repeat(26).substring(0, Math.max(1, S1.length - 26 + 1));
            let pad2 = ' '.repeat(20).substring(0, Math.max(1, S2.length - 26 + 1));
            let pad3 = ' '.repeat(26).substring(0, Math.max(1, S3.length - 26 + 1));
            return `\n  ${S1}${pad1}${S2}${pad2}${S3}${pad3}${S4}`;
        };

        let reqQueryCmd = Array.isArray(req?.query?.cmd)
            ? req.query.cmd.join.toString()
            : typeof req?.query?.cmd === "string" ? req.query.cmd
                : `[UNKNOWN - type is ${typeof req.query.cmd}]`;

        let reqQueryFile = Array.isArray(req?.query?.file)
            ? req.query.file.join.toString()
            : typeof req?.query?.file === "string" ? req.query.file
                : `[UNKNOWN - type is ${typeof req.query.file}]`;

        Logger.log(logLevel,
            `\n\n${message}` +
            `\n${caller}(` +
            `\n  "req.url:" ${req.url}` +
            row("req.params.appName:", req.params.appName, "req.params.propsStub:", req.params.propsStub) +
            row("req.params.tabName:", req.params.tabName, "cmdType:", cmdType) +
            row("req.params.zmqPortExpr:", req.params.zmqPortExpr, "req.params.zmqCmd:", req.params.zmqCmd) +
            row("req.params.zmqValue:", req.params.zmqValue, "req.query.cmd:", reqQueryCmd) +
            row("req.query.file:", reqQueryFile, "cmd.source:", cmd.source)
        );
    }
}
