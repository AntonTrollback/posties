// Todo: create directives
$(function() {

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
  return {
    restrict: 'A',
    link: function($scope, element, attrs) {
      var attrHandler = $parse(attrs['imageLoaded']);

      element.imagesLoaded(function() {
        $scope.$apply(function () {
          attrHandler($scope);
        });
      });
    }
  };
}]);

angular.module('posties').directive('fileChange', ['$parse', function($parse) {
  var prevImage = false;
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      var attrHandler = $parse(attrs['fileChange']);

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
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element.bind('click', function (e) {
                e.stopPropagation();
            });
        }
    };
 });



angular.module('posties').directive('showErrors', function ($timeout, showErrorsConfig) {
  var getShowSuccess, linkFn;
  getShowSuccess = function (options) {
    var showSuccess;
    showSuccess = showErrorsConfig.showSuccess;
    if (options && options.showSuccess != null) {
      showSuccess = options.showSuccess;
    }
    return showSuccess;
  };
  linkFn = function (scope, el, attrs, formCtrl) {
    var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
    blurred = false;
    options = scope.$eval(attrs.showErrors);
    showSuccess = getShowSuccess(options);
    inputEl = el[0].querySelector('[name]');
    inputNgEl = angular.element(inputEl);
    inputName = inputNgEl.attr('name');
    if (!inputName) {
      throw 'show-errors element has no child input elements with a \'name\' attribute';
    }
    inputNgEl.bind('blur', function () {
      blurred = true;
      return toggleClasses(formCtrl[inputName].$invalid);
    });
    scope.$watch(function () {
      return formCtrl[inputName] && formCtrl[inputName].$invalid;
    }, function (invalid) {
      if (!blurred) {
        return;
      }
      return toggleClasses(invalid);
    });
    scope.$on('show-errors-check-validity', function () {
      return toggleClasses(formCtrl[inputName].$invalid);
    });
    scope.$on('show-errors-reset', function () {
      return $timeout(function () {
        el.removeClass('has-error');
        el.removeClass('has-success');
        return blurred = false;
      }, 0, false);
    });
    return toggleClasses = function (invalid) {
      el.toggleClass('has-error', invalid);
      if (showSuccess) {
        return el.toggleClass('has-success', !invalid);
      }
    };
  };
  return {
    restrict: 'A',
    require: '^form',
    compile: function (elem, attrs) {
      if (!elem.hasClass('form-group')) {
        throw 'show-errors element does not have the \'form-group\' class';
      }
      return linkFn;
    }
  };
});

angular.module('posties').provider('showErrorsConfig', function () {
  var _showSuccess;
  _showSuccess = false;
  this.showSuccess = function (showSuccess) {
    return _showSuccess = showSuccess;
  };
  this.$get = function () {
    return { showSuccess: _showSuccess };
  };
});
