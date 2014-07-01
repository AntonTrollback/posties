postiesApp.directive('colorpicker', function(){
  return {
    require: '?ngModel',
    link: function (scope, elem, attrs, ngModel) {

      if(!ngModel) {
        return;
      }
      
      $(elem).colpick({ 
        layout : 'hex', 
        onSubmit: function(hsb, hex, rgb, el) {
          var hex = '#' + hex;
          $(elem).val(hex);
          $(elem).css('background', hex);
          ngModel.$setViewValue(elem.val());
          $(elem).colpickHide();
        }
      });

      elem.on('change', function () {
        scope.$apply(function () {
          console.log("changed")
        });
      });
    }
  }
});