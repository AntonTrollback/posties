(function(window, document, $) {
  'use strict';

  /**
   * Init app
   */

  var app = {};

  $(function() {
    app.data.init();

    app.header.init();
    app.window.init();
    app.optionsDisplayer.init();
    app.optionsControls.init();

    $('.panels').each(function() {
      app.panel.init($(this));
    });

    //$('.js-list').each(function() {
    //  app.panelList.init($(this));
    //});

    window.app = app;
  });

  /**
   * Header module
   */

  app.header = {
    init: function() {
      this.$el = $('.js-header');
      this.$windowToggle = this.$el.find('.js-windowToggle');

      this.binds();
    },
    binds: function() {
      var that = this;

      this.$windowToggle.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        that.handleClick($(this));
      });

      app.event.listen('window', 'close', $.proxy(this.deselect, this));
    },
    handleClick: function($toggle) {
      if ($toggle.is('.is-active')) {
        return app.event.fire('window', 'close');
      }

      this.deselect();
      $toggle.addClass('is-active');
      app.event.fire('window', 'open', {windowName: $toggle.data('target')});
    },
    deselect: function() {
      this.$windowToggle.removeClass('is-active');
    }
  };

  /**
   * Account and options windows
   */

  app.window = {
    init: function() {
      this.$windows = $('.js-window');
      this.$body = $('body');

      this.binds();
    },
    binds: function() {
      app.event.listen('window', 'open', $.proxy(this.openWindow, this));
      app.event.listen('window', 'close', $.proxy(this.closeWindow, this));

      this.$windows.on('click', function(e) {
        e.stopPropagation();
      });
    },
    openWindow: function(data) {
      var that = this;

      this.$windows.removeClass('is-visible');
      $(data.windowName).addClass('is-visible');

      this.$body.on('click', function() {
        that.closeWindow();
        app.event.fire('window', 'close');
      });
    },
    closeWindow: function () {
      this.$windows.removeClass('is-visible');
      this.$body.off('click');
    }
  };

  /**
   * Panel navigation
   */

  app.panel = {
    init: function($el) {
      this.$el = $el;
      this.$panels = $el.find('.panel');
      this.$triggers = $el.find('[data-go-to-panel]');
      this.binds();
    },
    binds: function() {
      var that = this;

      this.$triggers.on('click', function(e) {
        e.preventDefault();
        that.$panels.hide();
        $('#' + $(this).data('go-to-panel')).show();
      });
    }
  }

  /**
   * Panel navigation
   */

  app.panelList = {
    init: function($el) {
      this.$el = $el;
      this.$items = $el.find('.js-listItem');
      this.$selected = this.$el.find('.js-listItemStatus:not(.u-isHidden)').closest('.js-listItem');
      this.binds();
    },
    binds: function() {
      var that = this;

      $(window).on('keydown', function(e) {
        that.handleKeydown(e);
      });
    },
    handleKeydown: function(e) {
      console.log('arrow')
      if (this.$el.is(':hidden')) { return; }
      console.log('yes')

      var down = 38;
      var up = 40;

      this.$items.removeClass('is-active');

      if (e.which === down || e.wich === up) {
        e.preventDefault();
      }

      if (e.which === 38) { return this.goUp(); }
      if (e.which === 40) { return this.goDown(); }
    },
    goUp: function() {
      var $prev = this.$selected.prev();

      if ($prev.length > 0) {
        this.$selected = $prev.trigger('click');
      } else {
        this.$selected = this.$items.last().trigger('click');
      }
    },
    goDown: function() {
      var $next = this.$selected.next();

      if ($next.length > 0) {
        this.$selected = $next.trigger('click');
      } else {
        this.$selected = this.$items.eq(0).trigger('click');
      }
    }
  }

  /**
   * Data container
   */

  app.data = {
    init: function() {
      this.options = SITE_DATA.options;
      console.log('Initial data: ', this.options);
      this.binds();
    },
    binds: function() {
      var that = this;

      app.event.listen('options', 'update', function(data) {
        that.options = data;
        console.log('New data: ', that.options);
      });
    }
  }

  /**
   * Design update
   */

  app.optionsDisplayer = {
    init: function() {
      this.$el = $('.js-styles');
      this.template = 'styles.html';
      this.binds();
    },
    binds: function() {
      app.event.listen('options', 'update', $.proxy(this.render, this));
    },
    render: function(data) {
      var html = Handlebars.templates[this.template](data)
      this.$el.html(html);
    }
  }

  app.optionsControls = {
    init: function() {
      this.$el = $('.js-options');
      this.$startPanel = this.$el.find('#panelPrimarySettings');
      this.$boxToggle = this.$el.find('.js-boxToggle');
      this.$textFontItem = this.$el.find('.js-textFontSelect');
      this.$headingFontItem = this.$el.find('.js-headingFontSelect');

      this.startPanelTemplate = 'options-start.html';

      this.binds();
    },
    binds: function() {
      var that = this;

      this.$boxToggle.on('change', function() {
        that.updateData();
      });

      this.$textFontItem.on('click', function(e) {
        e.preventDefault();
        that.selectTextFont($(this).data('font'));
      })

      this.$headingFontItem.on('click', function(e) {
        e.preventDefault();
        that.selectHeadingFont($(this).data('font'));
      })

      this.$el.find('.palette-item').on('click', function(e) {
        $(this).closest('.popover-body').find('.minicolors input').trigger('keyup');
      });
    },
    selectTextFont: function(value) {
      this.$textFontItem.find('.js-listItemStatus:not(.u-isHidden)').addClass('u-isHidden');
      this.$el
        .find('.js-textFontSelect[data-font="' + value + '"] .js-listItemStatus')
        .removeClass('u-isHidden');
      this.updateData();
    },
    selectHeadingFont: function(value) {
      this.$headingFontItem.find('.js-listItemStatus:not(.u-isHidden)').addClass('u-isHidden');
      this.$el
        .find('.js-headingFontSelect[data-font="' + value + '"] .js-listItemStatus')
        .removeClass('u-isHidden');
      this.updateData();
    },
    initMiniColors: function() {
      this.$el.find('.minicolors').minicolors('create', {
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
        change: function(hex, opacity) {
          updateData();
        }
      });
    },
    updateData: function() {
      var data = {
        boxes: this.$boxToggle.is(':checked'),
        text_font: this.$el.find('.js-listItemStatus:not(.u-isHidden)').closest('.js-textFontSelect').data('font'),
        heading_font: this.$el.find('.js-listItemStatus:not(.u-isHidden)').closest('.js-headingFontSelect').data('font'),
        text_color: this.$el.find('.js-textColor').val(),
        background_color: this.$el.find('.js-backgroundColor').val(),
        part_background_color: this.$el.find('.js-partBackgroundColor').val()
      };
      app.event.fire('options', 'update', data);
    },
    renderStart: function(data) {
      var html = Handlebars.templates[this.startPanelTemplate](data)
      this.$startPanel.html(html);
    }
  }

  /**
   * Event listener
   */

  app.event = {
    listen: function(type, method, func) {
      // callbacks obj
      this.callbacks = this.callbacks || {};
      // type obj
      this.callbacks[type] = this.callbacks[type] || {};
      // methods arr
      this.callbacks[type][method] = this.callbacks[type][method] || [];
      // push function
      this.callbacks[type][method].push(func);
    },
    fire: function(type, method, data) {
      // if we have any callbacks of this type
      if (this.callbacks && this.callbacks[type] && this.callbacks[type][method]) {
        // loop callbacks
        for (var i=0; i < this.callbacks[type][method].length; i += 1) {
          // make sure function exists
          if (this.callbacks[type][method][i] && typeof this.callbacks[type][method][i] === 'function') {
            // call
            this.callbacks[type][method][i].call(null, data);
          }
        }
      }
    }
  };

})(window, document, jQuery);