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
    theme: 'default',
    change: function() {
      console.log('Changed');
    }
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
