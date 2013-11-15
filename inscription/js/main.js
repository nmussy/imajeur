$(document).one('ready', function() {
    generateDOBSelect();
    $('#inputPassword').on('input', updateEntropyMeter);
    $('#inputEmailConfirmation, #inputPasswordConfirmation, #inputEmail, #inputPassword').on('input', updateConfirmationState);
    $('#selectMonth').on('change', updateNumberOfDays);
    $('#selectGender').on('click', '.btn:not(.disabled)', updateGender);
    $('#registerForm').on/*e*/('submit', sumbitRegister);
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

function updateGender() {
    $('#selectGender').children('.disabled').removeClass('disabled');
    $(this).addClass('disabled');
}

function sumbitRegister(e) {
    console.log($('#registerForm').serializeArray());
    if($('#inputEmail').val().length === 0 ||
        $('#inputEmail').val() !== $('#inputEmailConfirmation').val()) {
        $('#inputEmail').focus();
        $('#registerErrorField').html('Votre adresse email ne ne correspond pas à sa confirmation');
        return false;
    }
    if($('#selectGender').children('.disabled').length === 0) {
        $('#registerErrorField').html('Vous devez séléctionner votre sexe');
        return false;
    }
    if($('#inputPassword').val().length < 6 ||
        $('#inputPassword').val() !== $('#inputPasswordConfirmation').val()) {
        $('#inputPassword').focus();
        $('#registerErrorField').html('Votre mot de passe est trop faible ou ne ne correspond pas à sa confirmation');
        return false;
    }
    if($('#selectDay').val() === "Jour" || $('#selectMonth').val() === "Mois" || $('#selectYear').val() === "Année") {
        $('#selectDay').focus();
        $('#registerErrorField').html('Vous devez entrer une date de naissance');
        return false;
    }

    var data = $('#registerForm').serialize();
    data.push({'name': 'gender', 'value': $('#selectGender').children('.disabled').data('value')});

    $.ajax({
        url: '../php/user/inscription.php',
        type: 'post',
        data: $('#registerForm').serialize(),
        success: successRegister
    });
    return false;
}

function successRegister(data) {
    data = JSON.parse(data);
}

function generateDOBSelect() {
    for(var i = 1; i <= 31; ++i)
        $('#selectDay').append('<option>' + i + '</option>');
    for(i = 1; i <= 12; ++i)
        $('#selectMonth').append('<option>' + i + '</option>');
    for(i = 2013; i >= 1920; --i)
        $('#selectYear').append('<option>' + i + '</option>');
}

function updateNumberOfDays() {
    console.log('update');
    var numberOfDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        updatedNumberOfDays = numberOfDays[$('#selectMonth').children(':selected').html() - 1];
    if(updatedNumberOfDays > $('#selectDay').children().length - 1) {
        for(var i = $('#selectDay').children().length; i <= updatedNumberOfDays; ++i)
            $('#selectDay').append('<option>' + i + '</option>');
    } else if(updatedNumberOfDays < $('#selectDay').children().length - 1) {
        for(var j = $('#selectDay').children().length; j > updatedNumberOfDays; --j)
            $($('#selectDay').children()[j]).remove();
    }
}