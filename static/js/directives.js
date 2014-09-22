$(function() {
  $panels = $('.panel');
  $navigators = $panels.find('[data-go-to-panel]');

  $panels.find('.minicolors').minicolors('create', {
    animationSpeed: 50,
    animationEasing: 'swing',
    change: null,
    changeDelay: 0,
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

  $navigators.on('click', function(e) {
    e.preventDefault();
    switchSection($(this).data('go-to-panel'));
  });

  function switchSection(id) {
    $panels.hide();
    $('#'+ id).show();
  }

  $panels.on('click', '.panel-nav-item.is-static.is-narrow', function(e) {
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
  });
});
