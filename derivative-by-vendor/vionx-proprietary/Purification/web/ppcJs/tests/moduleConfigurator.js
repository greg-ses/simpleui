// test module containing Configurator web app components
require(['doh/runner', 'require'],
  function (doh, require) {
      try {
          // register the test page, which initiates the doh
          doh.registerUrl('BinaryMomentaryButton page test', require.toUrl('ppcJs/tests/BinaryMomentaryButtonTest.html'), 10000); // timeout test after 10 seconds
          doh.registerUrl('Comment control test', require.toUrl('ppcJs/tests/CommentTest.html'), 10000); // timeout test after 10 seconds
      } catch (e) {

          doh.debug(e);
      }
  });