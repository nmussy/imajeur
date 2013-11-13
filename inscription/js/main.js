$(document).one('ready', function() {
    $('#inputPassword').on('input', updateEntropyMeter);
    $('#inputEmailConfirmation, #inputPasswordConfirmation, #inputEmail, #inputPassword').on('input', updateConfirmationState);
});

function updateEntropyMeter() {
    if($('#inputPassword').val().length === 0) {
        $('#entropyMeter').attr('class', 'password-strength');
        return;
    }
    var score = scorePassword($('#inputPassword').val());
    if (score > 100)
        $('#entropyMeter').attr('class', 'password-strength password-very-strong');
    else if (score > 80)
        $('#entropyMeter').attr('class', 'password-strength password-strong');
    else if (score > 60)
        $('#entropyMeter').attr('class', 'password-strength password-average');
    else if (score > 30)
        $('#entropyMeter').attr('class', 'password-strength password-weak');
    else
        $('#entropyMeter').attr('class', 'password-strength password-very-weak');
}

function updateConfirmationState() {
    var parentInput, confirmationInput;
    if($(this).attr('id') === 'inputEmail' || $(this).attr('id') === 'inputPassword') {
        parentInput = $(this);
        confirmationInput = ($(this).attr('id') === 'inputPassword' ?
                       $('#inputPasswordConfirmation') :
                       $('#inputEmailConfirmation'));
    } else {
        parentInput = ($(this).attr('id') === 'inputPasswordConfirmation' ?
                       $('#inputPassword') :
                       $('#inputEmail'));
        confirmationInput = $(this);
    }
    if(confirmationInput.val().length === 0) {
        confirmationInput.parent().removeClass('has-error has-success');
    } else if(confirmationInput.val() !== parentInput.val()) {
        confirmationInput.parent().removeClass('has-success').addClass('has-error');
    } else {
        confirmationInput.parent().removeClass('has-error').addClass('has-success');
    }
}

function scorePassword(pass) {
    var score = 0;
    if (!pass)
        return score;

    var letters = {};
    for (var i  =0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score, 10);
}