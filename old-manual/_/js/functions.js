// Browser detection for when you get desparate. A measure of last resort.
// http://rog.ie/post/9089341529/html5boilerplatejs

// var b = document.documentElement;
// b.setAttribute('data-useragent',  navigator.userAgent);
// b.setAttribute('data-platform', navigator.platform);

// sample CSS: html[data-useragent*='Chrome/13.0'] { ... }

//Regex email
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//Return form non corretta
function form_incorrect(el) {
    console.log(el.attr('name') + " non corretto");
    el.focus();
    return false;
}

// remap jQuery to $
(function ($) {

/* trigger when page is ready */
$(document).ready(function () {
    var email_validation = '^[\w\-\.]*[\w\.]\@[\w\.]*[\w\-\.]+[\w\-]+[\w]\.+[\w]+[\w $]';

    //Auto placeholder .IE
    $('input, textarea').placeholder();

    //Campi numerici
    $(".numeric").numeric();
    $(".integer").numeric(false, function () { alert("Solo valori interi"); this.value = ""; this.focus(); });
    $(".positive").numeric({ negative: false }, function () { alert("Valori negativi non accettati"); this.value = ""; this.focus(); });
    $(".positive-integer").numeric({ decimal: false, negative: false }, function () { alert("Solo valori interi positivi"); this.value = ""; this.focus(); });

    //Form Design Radio / Checkbox (icheck)
    $('input').iCheck({
        checkboxClass: 'icheckbox_square-blue',
        radioClass: 'iradio_square',
        increaseArea: '20%' // optional
    });

    //Controllo Generale Form
    $('.simple_form_control .control-btn').on('click', function () {
        var fControl = true, fName = $(this).parent('form').attr('name'), form = $(this).parent('form');
        //Controllo se tutti i campi required sono stati settati e diversi dalla precompilazione fblank per .IE
        form.children('input, textarea').each(function (k, v) {
            if (    //Validazione standard fields
                    ($(v).attr('required') == 'required' && $(v).val().length == 0) ||
                    //Validazione email
                    ($(v).attr('type') == 'email' && !validateEmail($(v).val()) && $(v).attr('required') == 'required')
                ) {
                fControl = form_incorrect($(v));
                return false;
            }
            //Validazione check privacy
            if ($(v).hasClass('privacy_check') && !$(v).is(':checked')) {
                fControl = form_incorrect($(v));
                $(v).parent('.icheckbox_square-blue').addClass('hover');
                return false;
            }
        });
        if(fControl && fName != null)
            document.forms[fName].submit();            
    });

    //Apertura dei dettagli parent - child
    $('.arrow-container').on('click', function () {
        var el = $(this), child = $(this).data('child'), status = $(this).data('status');
        if (child != null && status != null) {
            $('#' + child).slideToggle();
            console.log(status);
            if (status == 'closed') { el.data('status', 'open'); el.addClass('arrow-up'); }
            else if (status == 'open') { el.data('status', 'closed'); el.removeClass('arrow-up'); }
        }
    });

});


/* optional triggers

$(window).load(function() {

});

$(window).resize(function() {

});

*/

})(window.jQuery);