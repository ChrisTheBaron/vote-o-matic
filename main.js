function show(elem) {
    $(elem).attr('hidden', null);
}

function hide(elem) {
    $(elem).attr('hidden', true);
}

function disable(elem) {
    $(elem).attr('disabled', true);
}

function enable(elem) {
    $(elem).attr('disabled', null);
}

$(function () {

    var people = 0;
    var options = [];
    var currentPerson = 0;
    var votes = [];
    var adjustedVotes = [];

    function reset() {

        people = 0;
        options = [];
        currentPerson = 0;
        votes = [];
        adjustedVotes = [];

        $('.page#options #options-input .option').filter(function (key, val) {
            return key != 0;
        }).remove();

        hide($('.page#options #options-input .option span'));
        $('.page#options #options-input .option input').val("");

    }

    $('.page#start .btn').click(function () {
        reset();
        hide($('.page#start'));
        show($('.page#people'));
    });

    $('.page#people .btn').click(function () {

        people = $('.page#people #people-input').val();

        hide($('.page#people'));
        show($('.page#options'));

    });

    var optionUpdate = function () {

        // if there isn't a blank box, add one
        var empty = $('.page#options #options-input .option input').filter(function () {
            return $(this).val().length == 0;
        });

        if (empty.length == 0) {
            $('.page#options #options-input').append('<div class="option list-group-item flex-column align-items-start clearfix">\n\n    <div class="input-group">\n        <input type="text" class="form-control" placeholder="Put your options here...">\n        <span hidden class="input-group-btn">\n                <button tabindex="-1" class="btn btn-danger btn-secondary" type="button">X</button>\n                </span>\n    </div>\n\n</div>');
        }

        if ($(this).val().length > 0) {
            show($(this).parent().find('span'));
        } else if (empty.length == 1) {
            hide($(this).parent().find('span'));
        }

    };

    $('.page#options #options-input').on('blur', '.option input', optionUpdate);
    $('.page#options #options-input').on('focus', '.option input', optionUpdate);
    $('.page#options #options-input').on('keyup', '.option input', optionUpdate);
    $('.page#options #options-input').on('keydown', '.option input', optionUpdate);

    $('.page#options #options-input').on('click', '.option .btn', function () {
        $(this).parents('.option').remove();
    });

    $('.page#options #options-next').click(function () {

        $('.page#options #options-input .option').each(function (key) {
            var option = $(this).find('input').val();
            if (option.length > 0) {
                options[key] = option;
            }
        });

        if (options.length < 2) {
            alert("At least 2 options required");
            return false;
        }

        doVotingForPerson(0);

        hide($('.page#options'));
        show($('.page#voting'));

    });

    function doVotingForPerson(personInd) {

        $('.page#voting #voting-ind').text(personInd + 1);

        $('.page#voting #voting-input').find('.option').remove();

        $.each(options, function (key, val) {

            $('.page#voting #voting-input').append('<div data-option-id="' + key + '" class="option list-group-item flex-column align-items-start clearfix"><div class="input-group"><span class="input-group-btn"><button class="option-up btn btn-secondary btn-success" type="button">Up</button></span><input class="form-control" id="disabledInput" type="text" placeholder="' + val + '" disabled><span class="input-group-btn"><button class="option-down btn btn-secondary btn-danger" type="button">Down</button></span></div>\n</div>');

        });

        updateVotingButtons();

    }

    function updateVotingButtons() {

        enable($(".page#voting #voting-input .option .option-up"));
        enable($(".page#voting #voting-input .option .option-down"));

        disable($(".page#voting #voting-input .option").first().find(".option-up"));
        disable($(".page#voting #voting-input .option").last().find(".option-down"));

    }

    $(".page#voting #voting-input").on('click', '.option .option-up', function () {
        $(this).parents('.option').insertBefore($(this).parents('.option').prev());
        updateVotingButtons();
    });

    $(".page#voting #voting-input").on('click', '.option .option-down', function () {
        $(this).parents('.option').insertAfter($(this).parents('.option').next());
        updateVotingButtons();
    });

    function storeVotes(personInd) {
        votes[personInd] = [];
        $('.page#voting #voting-input .option').each(function (key) {
            votes[personInd].push($(this).attr('data-option-id'));
        });
    }

    function getPreferred(round) {
        var maxInd = null;
        var maxVal = 0;
        $.each(round, function (k, v) {
            if (v > maxVal) {
                maxInd = k;
                maxVal = v;
            }
        });
        return maxInd;
    }

    function getLeastPreferred(round) {
        var minInds = [];
        var minVal = null;
        $.each(round, function (k, v) {
            if (v < minVal || minVal == null) {
                minInds = [k];
                minVal = v;
            } else if (v == minVal) {
                minInds.push(k);
            }
        });
        return minInds;
    }

    function calculateWinner() {

        var winner = null;

        while (true) {

            adjustedVotes.push($.extend(true, {}, votes));

            var round = {};

            var empty = true;

            $.each(votes, function (k, v) {
                if (v.length > 0) empty = false;
                round[v[0]] = round[v[0]] ? ++round[v[0]] : 1;
            });

            // we've ran out of votes
            if (empty) break;

            var roundPreferred = getPreferred(round);

            if (round[roundPreferred] >= Math.ceil(people / 2)) {
                // has majority
                winner = roundPreferred;
                break;
            }

            var roundLeastPreferred = getLeastPreferred(round);

            if (roundLeastPreferred.length == options.length) {
                // dead tie, remove all first preferences
                for (var i in votes) {
                    votes[i].shift();
                }
            } else {

                var toRemove;

                if (roundLeastPreferred.length > 1) {
                    toRemove = roundLeastPreferred[Math.floor(Math.random() * roundLeastPreferred.length)];
                } else {
                    toRemove = roundLeastPreferred[0];
                }

                for (var k in votes) {
                    if (votes.hasOwnProperty(k)) {
                        var ind = votes[k].indexOf(toRemove);
                        if (ind >= 0) {
                            votes[k].splice(ind, 1);
                        }
                    }
                }

            }

        }

        console.log(options);
        console.log(adjustedVotes);

        return winner;

    }

    $('.page#voting #voting-next').click(function () {
        storeVotes(currentPerson);
        if (++currentPerson == people) {
            var winner = calculateWinner();
            if (winner != null) {
                $('.page#results #result').text(options[winner]);
            } else if (adjustedVotes[adjustedVotes.length - 1][0].length == 0) {
                $('.page#results #result').text("nobody. It was a tie.");
            } else {
                $('.page#results #result').text('you. You broke it. Well done.');
            }
            hide($('.page#voting'));
            show($('.page#results'));
        } else {
            doVotingForPerson(currentPerson);
        }
    });

    $('.page#results #start-again').click(function () {
        hide($('.page#results'));
        show($('.page#start'));
    })

});