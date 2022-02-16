export class ClientLogger {
    static _logCount = 0;
    static _initialized = false;

    static log(feature: string, msg: string, showInMiniConsole = false, line2 = '', line3 = '') {
        ClientLogger.initialize();
        if (ClientLogger.isFeatureEnabled(feature)) {
            ClientLogger._logCount++;
            const now = new Date();
            const ts: string = now.getHours() + 'h ' + now.getMinutes() + 'm ' + now.getSeconds() + 's ' + now.getMilliseconds() + 'ms';
            const briefMsg = now.getSeconds() + 's: ' + msg;
            const fullMsgPrefix = 'Feature: ' + feature + ', logCount: ' + ClientLogger._logCount + ', ';
            if (showInMiniConsole) {
                window['logToMiniConsole'](briefMsg);
            }
            console.log(fullMsgPrefix + briefMsg);
            if (line2) {
                console.log(' '.repeat(fullMsgPrefix.length) + line2);
            }
            if (line3) {
                console.log(' '.repeat(fullMsgPrefix.length) + line3);
            }
        }
    }

    static logToMiniConsole(msg: string) {
        ClientLogger.initialize();
        window['logToMiniConsole'](msg);
        // Clear miniConsole after clearAfterMSec
        // setTimeout(() => { window['logToMiniConsole'](''); }, clearAfterMSec);
    }

    static isFeatureEnabled(feature: string) {
        return ((typeof window['LoggingFeatures'] === 'object')
            && (typeof window['LoggingFeatures'][feature] === 'boolean')
            && window['LoggingFeatures'][feature]);
    }

    static enableFeature(feature: string, enabled = true) {
        ClientLogger.initialize();
        if (typeof window['LoggingFeatures'] === 'object') {
            window['LoggingFeatures'][feature] = enabled;
        }
    }

    static setLoggingFeatures() {
        ClientLogger.initialize();

        let message =
            'To ENABLE a logging feature, type one or more numbers'
          + '(separated by spaces) from the choices below.\n\n'
          + 'To DISABLE a feature, precede the number by "-"\n';

        const features = [];
        let numFeatures = 0;
        for (const key of Object.keys(window['LoggingFeatures'])) {
            features[numFeatures++] = key;
            message += '\n  ' + numFeatures.toString() + '. ' + key + ': ' + window['LoggingFeatures'][key];
        }
        const choices = window.prompt(message, '').split(' ');

        for (const choice of choices) {
            try {
                const choiceNumber = parseInt(choice, 10);
                const absChoice = Math.abs(choiceNumber);
                if (absChoice > 0 && absChoice <= numFeatures) {
                    window['LoggingFeatures'][features[absChoice - 1]] = (choiceNumber > 0);
                }
            } catch (Exception) {
                console.log('Error setting feature.');
            }
        }
    }

    static initialize() {
        if (ClientLogger._initialized) {
            return;
        }

        window['LoggingFeatures'] = {
            'CommandButtonComponentDetails': false,
            'CommandButtonChangeDetection': false,
            'CommandButtonUpdateClass': false,
            'LogOverlayListAll': false,
            'LogOverlayList': false,
            'LogOverlayList_commands': false,
            'LogOverlayList_JSON': false,
            'LogRefreshCycle': false,
            'LogRefreshCycleInactiveTab': false,
            'LogRefreshCycleCount': false,
            'DeltaUpdate': false,
            'MiniConsole': false,
            'ServerSideJsDebugging': false
        };

        window['setLoggingFeatures'] = ClientLogger.setLoggingFeatures;

        window['logToMiniConsole'] = function(msg: string) {
            if (window['LoggingFeatures']['MiniConsole']) {
                let e = document.getElementById('miniConsole');
                if (e) {
                    if (typeof e['msgList'] === 'undefined') {
                        e['msgList'] = [];
                    }
                    e['msgList'].push(msg);

                    let contents = '';
                    for (let i = 0; i < e['msgList'].length; i++) {
                        contents = i + ':' + e['msgList'][i] + '<br>\n';
                    }
                    e.innerHTML = contents;
                    e.style.display = 'block';
                    setTimeout( () => {
                            let e1 = document.getElementById('miniConsole');
                            if (e1['msgList'].length === 1) {
                                e1['msgList'] = [];
                                e1.style.display = 'none';
                                return;
                            }

                            e['msgList'] = e['msgList'].slice(1, e['msgList'].length);
                            let contents1 = '';
                            for (let i = 0; i < e['msgList'].length; i++) {
                                contents1 = i + ':' + e['msgList'][i] + '<br>\n';
                            }
                            e.innerHTML = contents1;
                        }, 5000);
                }
            }
        };

        ClientLogger._initialized = true;
    }
}


export enum LogLevel {
    EMERGENCY,
    ALERT,
    CRITICAL,
    ERROR,
    WARNING,
    NOTICE   ,
    INFO,
    DEBUG,
    VERBOSE
}
