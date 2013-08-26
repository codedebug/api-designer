'use strict';

var CodeMirror = window.CodeMirror;

angular.module('codeMirror', ['raml'])
  .factory('codeMirror', function (ramlHint) {
    var editor = null,
      service = {
        CodeMirror: CodeMirror
      };

    service.initEditor = function () {

      function isLineOnlyTabs(line, indentUnit) {
        var tabRegExp = new RegExp('( ){' + indentUnit + '}', 'g');
        return line.replace(tabRegExp, '').length === 0;
      }

      CodeMirror.keyMap.tabSpace = {
        Tab: function(cm) {
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line),
              indentUnit = cm.getOption('indentUnit'), spaces, result, unitsToIndent;
        
          var tabRegExp = new RegExp('( ){' + indentUnit + '}', 'g');
          result = line.replace(tabRegExp, '');
          result = result.length ? result.slice(-1)[0] : '';

            /* If I'm in half/part of a tab, add the necessary spaces to complete the tab */
          if (result !== '' && result.replace(/ /g, '') === '') {
            unitsToIndent = indentUnit - result.length;
            /* If not ident normally */
          } else {
            unitsToIndent = indentUnit;
          }
          spaces = new Array(unitsToIndent + 1).join(' ');
          cm.replaceSelection(spaces, 'end', '+input');
        },
        Backspace: function (cm) {
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line);
          
          /* Erase in tab chunks only if all things found in the current line are tabs */
          if ( line !== '' && isLineOnlyTabs(line, cm.getOption('indentUnit')) ) {
            cm.deleteH(-2, 'char');
            return;
          }
          cm.deleteH(-1, 'char');
        },
        enter: 'newline-and-indent',
        fallthrough: ['default']
      };

      CodeMirror.commands.autocomplete = function (cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.javascript);
      };
      
      CodeMirror.registerHelper('hint', 'yaml', ramlHint.autocompleteHelper);

      editor = CodeMirror.fromTextArea(document.getElementById('code'), {
        mode: 'yaml',
        theme: 'solarized dark',
        lineNumbers: true,
        lineWrapping: true,
        autofocus: true,
        indentWithTabs: false,
        indentUnit: 2,
        tabSize: 2,
        extraKeys: {'Ctrl-Space': 'autocomplete'},
        keyMap: 'tabSpace',
        foldGutter: {
          rangeFinder: CodeMirror.fold.indent
        },
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
      });

      editor.setSize(null, '100%');

      editor.foldCode(0, {
        rangeFinder: CodeMirror.fold.indent
      });

      return editor;
    };

    service.getEditor = function () {
      return editor;
    };

    return service;
  });
