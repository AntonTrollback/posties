$(function() {
  $panels = $('.panel');

  function switchSection(id) {
    $panels.hide();
    $('#'+ id).show();
  }

  $panels.find('.minicolors').minicolors('create', {
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

  $panels.find('[data-go-to-panel]').on('click', function(e) {
    e.preventDefault();
    switchSection($(this).data('go-to-panel'));
  });

  $('.palette-item').on('click', function(e) {
    $(this).closest('.popover-body').find('.minicolors input').trigger('keyup');
  });

  $('#panelTextFont .panel-item, #panelHeadlineFont .panel-item').on('click', function(e) {
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
  });
});
