$(function() {
  $panel = $('.panel');
  $triggers = $panel.find('[data-panel-section]');
  $sections = $panel.find('.panel-section');

  $panel.find('.minicolors').minicolors('create', {
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

  $triggers.on('click', function(e) {
    e.preventDefault();
    switchSection($(this).data('panel-section'));
  });

  function switchSection(id) {
    $sections.hide();
    $('#'+ id).show();
  }
});
