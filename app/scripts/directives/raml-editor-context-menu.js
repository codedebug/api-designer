/* jshint newcap: false */
(function() {
  'use strict';

  angular.module('ramlEditorApp').directive('ramlEditorContextMenu', function($window, fileList, ramlRepository, ramlEditorRemoveFilePrompt, ramlEditorFilenamePrompt, scroll) {
    function Actions(file) {
      return [
        {
          label: 'Save',
          execute: function() {
            fileList.saveFile(file);
          }
        },
        {
          label: 'Delete',
          execute: function() {
            ramlEditorRemoveFilePrompt.open(file);
          }
        },
        {
          label: 'Rename',
          execute: function() {
            ramlEditorFilenamePrompt.open(file.name).then(function(filename) {
              ramlRepository.renameFile(file, filename);
            });
          }
        }
      ];
    }

    function outOfWindow(el) {
      var rect = el.getBoundingClientRect();
      return !(rect.top >= 0 &&
               rect.left >= 0 &&
               rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
               rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }

    return {
      restrict: 'E',
      templateUrl: 'views/raml-editor-context-menu.tmpl.html',
      link: function(scope, element) {
        function positionMenu(element, offsetTarget) {
          var left = offsetTarget.offsetLeft + 0.5 * offsetTarget.offsetWidth,
              top = offsetTarget.offsetTop + 0.5 * offsetTarget.offsetHeight;

          var menuContainer = angular.element(element[0].children[0]);
          menuContainer.css('left', left + 'px');
          menuContainer.css('top', top + 'px');

          setTimeout(function() {
            if (outOfWindow(menuContainer[0])) {
              menuContainer.css('top', top - menuContainer[0].offsetHeight + 'px');
            }
          }, 0);
        }

        function close() {
          scroll.enable();
          scope.$apply(function() {
            delete contextMenuController.file;
            scope.opened = false;

            $window.removeEventListener('click', close);
            $window.removeEventListener('keydown', closeOnEscape);
          });
        }

        function closeOnEscape(e) {
          if (e.which === 27) {
            e.preventDefault();
            close();
          }
        }

        var contextMenuController = {
          open: function(event, file) {
            scroll.disable();
            this.file = file;
            scope.actions = Actions(file);

            event.stopPropagation();
            positionMenu(element, event.target);
            $window.addEventListener('click', close);
            $window.addEventListener('keydown', closeOnEscape);

            scope.opened = true;
          }
        };

        scope.registerContextMenu(contextMenuController);
      },

      scope: true
    };
  });
})();
