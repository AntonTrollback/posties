// Todo: create directives
$(function() {
  'use strict';

  // Navigate panels
  $('.panels').each(function() {
    var $this = $(this);
    $this.find('[data-go-to-panel]').on('click', function(e) {
      e.preventDefault();
      $this.find('.panel').hide();
      $('#'+ $(this).data('go-to-panel')).show();
    });
  });

  // Init color pickers
  $('.minicolors').minicolors('create', {
    animationSpeed: 50,
    animationEasing: 'swing',
    changeDelay: 300,
    control: 'wheel',
    defaultValue: '',
    hide: null,
    hideSpeed: 100,
    inline: true,
    letterCase: 'lowercase',
    opacity: false,
    position: 'bottom left',
    show: null,
    showSpeed: 100,
    theme: 'default'
  });

  $('#panelTextFont, #panelHeadlineFont').each(function() {
    var $panel = $(this);
    var $items = $panel.find('.panel-item');

    $(window).on('keydown', function(e) {
      if ($panel.is(':hidden')) {
        return;
      }

      e.preventDefault();

      var $selected = $panel.find('.panel-item-icon:visible').closest('.panel-item');

      $items.removeClass('is-active');

      // Key down
      if (e.which === 40) {
        var $next = $selected.next();
        if ($next.length > 0) {
          $selected = $next.trigger('click');
        } else {
          $selected = $items.eq(0).trigger('click');
        }
        return;
      }

      // Key up
      if (e.which === 38) {
        var $prev = $selected.prev();
        if ($prev.length > 0) {
          $selected = $prev.trigger('click');
        } else {
          $selected = $items.last().trigger('click');
        }
      }
    });
  });

  $('.palette-item').on('click', function(e) {
    $(this).closest('.popover-body').find('.minicolors input').trigger('keyup');
  });
});

angular.module('angular-medium-editor', []).directive('mediumEditor', function() {
  'use strict';

  return {
    require: 'ngModel',
    restrict: 'AE',
    scope: { bindOptions: '=' },
    link: function(scope, iElement, iAttrs, ctrl) {
      angular.element(iElement).addClass('angular-medium-editor');
      var opts = {};
      var placeholder = '';

      var prepOpts = function() {
        var bindOpts = {};
        if (iAttrs.options) {
          opts = scope.$eval(iAttrs.options);
        }
        if (scope.bindOptions !== undefined) {
          bindOpts = scope.bindOptions;
        }
        opts = angular.extend(opts, bindOpts);
      };

      prepOpts();
      placeholder = opts.placeholder;

      scope.$watch('bindOptions', function() {
        prepOpts();
        ctrl.editor = new MediumEditor(iElement, opts);
      });

      var onChange = function() {
        scope.$apply(function() {
          ctrl.$setViewValue(iElement.html());
        });
      };

      // view -> model

      //iElement.on('blur', onChange);
      iElement.on('input', onChange);

      // model -> view
      ctrl.$render = function() {
        if (!this.editor) {
          this.editor = new MediumEditor(iElement, opts);
        }

        iElement.html(ctrl.$isEmpty(ctrl.$viewValue) ? '<p><br></p>' : ctrl.$viewValue);
      };

    }
  };
});


angular.module('posties').directive('imageLoaded', ['$parse', function($parse) {
  'use strict';

  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      var attrHandler = $parse(attrs.imageLoaded);

      element.imagesLoaded(function() {
        $scope.$apply(function () {
          attrHandler($scope);
        });
      });
    }
  };
}]);

angular.module('posties').directive('fileChange', ['$parse', function($parse) {
  'use strict';

  var prevImage = false;
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      var attrHandler = $parse(attrs.fileChange);

      var handler = function (e) {
        $scope.$apply(function () {
          attrHandler($scope, { $event: e, $files: e.target.files });
        });
      };

      element[0].addEventListener('change', handler, false);
    }
  };
}]);

angular.module('posties').directive('stopEvents', function () {
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.bind('click', function (e) {
        e.stopPropagation();
      });
    }
  };
 });
