// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html



module.exports = function (config) {
  config.set({
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--headless',
          '--remote-debugging-port=9222'
        ]
      }
    },
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      //require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    // coverageIstanbulReporter: {
    //   dir: require('path').join(__dirname, './coverage/app'),
    //   reports: ['html', 'lcovonly', 'text-summary'],
    //   fixWebpackSourcePaths: true
    // },

    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: false
  });
};





// module.exports = function (config) {
//   config.set({
//     basePath: '',
//     frameworks: ['jasmine', '@angular-devkit/build-angular'],
//     plugins: [
//       require('karma-jasmine'),
//       require('karma-chrome-launcher'),
//       require('karma-jasmine-html-reporter'),
//       require('karma-coverage'),
//       require('@angular-devkit/build-angular/plugins/karma')
//     ],
//     client: {
//       jasmine: {
//         // you can add configuration options for Jasmine here
//         // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
//         // for example, you can disable the random execution with `random: false`
//         // or set a specific seed with `seed: 4321`
//       },
//       clearContext: false // leave Jasmine Spec Runner output visible in browser
//     },
//     jasmineHtmlReporter: {
//       suppressAll: true // removes the duplicated traces
//     },
//     coverageReporter: {
//       dir: require('path').join(__dirname, './coverage/base_app'),
//       subdir: '.',
//       reporters: [
//         { type: 'html' },
//         { type: 'text-summary' }
//       ]
//     },
//     reporters: ['progress', 'kjhtml'],
//     port: 9876,
//     colors: true,
//     logLevel: config.LOG_INFO,
//     autoWatch: true,
//     browsers: ['ChromeHeadless', 'ChromeHeadlessWin'], // ['Chrome_small', 'ChromeHeadless', 'ChromeHeadlessWin'],
//     customLaunchers: {
//       // no head-full tests yet, but soon
//       Chrome_small: {
//         base: 'Chrome',
//         flags: ['--window-size=1900,1000', '--no-sandbox', '--disable-gpu']
//       },
//       ChromeHeadlessWin: {
//         base: 'ChromeHeadless',
//         flags: ['--headless', '--no-sandbox', '--disable-gpu']
//       },
//     },
//     singleRun: false,
//     restartOnFileChange: true
//   });
// };

