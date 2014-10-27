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

  // Selected state for items in font lists
  $('#panelTextFont .panel-item, #panelHeadlineFont .panel-item').on('click', function(e) {
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
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
      iElement.on('blur', onChange);
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
