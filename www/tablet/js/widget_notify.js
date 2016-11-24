
var Modul_notify= function () {

    // privat sub function
    function notify (text) {
      // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support system notifications");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(text);
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(text);
          }
        });
      }
    }


    // mandatory function, get called on start up
    function init () {
        var me = this;
        this.elements = $('div[data-type="'+this.widgetname+'"]',this.area);
        this.elements.each(function(index) {

            var elem = $(this);
            elem.initData('get'             ,'STATE');
            elem.initData('pre-text'        , '');
            elem.initData('post-text'       , '');
            elem.initData('filter'          , '.*');
            elem.initData('mode'            , 'notification');

            // subscripe my readings for updating
            me.addReading(elem,'get');
        });
    };

    // mandatory function, get called after start up once and on every FHEM poll response
    // here the widget get updated
    function update (dev,par) {
        me = this;
        this.elements.filterDeviceReading('get',dev,par)
        .each(function(index) {
            var elem = $(this);
            var mode = elem.data('mode');
            var value = elem.getReading('get').val;
            if (value && elem.data('initDone') && value.match(new RegExp('^' + elem.data('filter') + '$')) ){
                var text = ftui.getPart(value,elem.data('part'));
                text = me.substitution(text, elem.data('substitution'));
                text = me.map(elem.data('map-get'), text, text);
                text = me.fix(text, elem.data('fix'));
                text = elem.data('pre-text') + text + elem.data('post-text');
                if ( mode === 'notification' ){
                   notify(text);
                } else if ( mode === 'toast-error' ){
                    ftui.toast(text,'error');
                } else {
                    ftui.toast(text);
                }
            } else {
                elem.data('initDone',1);
            }
        });
    };

    // public
    // inherit all public members from base class
    return $.extend(new Modul_widget(), {
        //override or own public members
        widgetname: 'notify',
        init: init,
        update: update,
    });
};