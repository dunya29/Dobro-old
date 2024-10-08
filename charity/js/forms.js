var showMessages = function (type, messages) {
    if (typeof messages === 'object' && messages.constructor === Array) {
        if (messages.length > 0) {
            messages.forEach(function (item) {
                showMessages(type, item);
            });
        }
    } else {
        var options = {
            theme:'light'
        };
        if (typeof Noty === 'function') {
            options.timeout = type === 'error' || type === 'info' ? 0 : 1500;
            options.type = type;
            options.text = messages;
            new Noty(options).show();
        } else {
            alert(messages);
        }
    }
}
$(document).on('submit', '.form-wrapper > form', function(e){
    e.preventDefault();
    var form = $(this);
    var submitBtn = $('[type="submit"]', form);
    submitBtn.prop('disabled', true);
    var data = form.serialize();
    if (typeof Noty === 'function') {
        Noty.closeAll();
    }
    $.post('/forms',
        data,
        function (response) {
            $('.has-error', form).removeClass('has-error');
            $('div.error', form).remove();
            submitBtn.prop('disabled', false);
            if (response.status) {
                if (typeof response.redirect !== 'undefined') {
                    window.location.href = response.redirect;
                } else if (typeof response.output !== 'undefined') {
                    form.parents('.form-wrapper').html(response.output);
                } else if (typeof response.messages !== 'undefined' && response.messages.length > 0) {
                    showMessages('info', response.messages);
                } else {
                    form.get(0).reset();
                    showMessages('info', 'Сообщение отправлено');
                    $('.js-modal-close').click();
                }
            } else {
                if (typeof response.errors !== 'undefined' && Object.keys(response.errors).length > 0) {
                    for (var field in response.errors) {
                        var $field = $('[name="' + field + '"]', form).parent().addClass('has-error');
                        var errors = response.errors[field];
                        for (var error in errors) {
                            $field.append($('<div class="error">' + errors[error] + '</div>'));
                        }
                        /*
                        var el = $('.has-error:first');
                        if (el.length != 0) {
                            el.get(0).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
                        }
                        */
                    }
                }
                if (typeof response.messages !== 'undefined' && response.messages.length > 0) {
                    showMessages('error', response.messages);
                }
            }
        },
        'json'
    ).fail(function () {
        submitBtn.prop('disabled', false);
        showMessages('error', 'Произошла ошибка');
    });
});

