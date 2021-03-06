const $ = require('../lib/jquery-3.2.1');
const Timer = require('./Timer');

// TODO: написать отдельно красивую отдельно отрисовку таймера

var $confirmationMessageBlock = $('.js-confirmation-message');

time_list = [
    { 
        id: 113,
        dateString: '2018-08-23  12:15:00',
        serverTimezone: 10800,
        weekends: [0, 1, 2],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    }
];

$confirmationMessageBlock.each(function (index, message) {
    var $message = $(message),
        request_id = $message.data('requestId'),
        $min = $message.find('.js-timer__min'),
        $sec = $message.find('.js-timer__sec'),
        $count_down_end = $message.find('.js-countdown-end'),
        $accept_warning = $message.find('.js-accept-warning'),
        $accept_warning_shop_not_work = $message.find('.js-accept-warning-shop-not-work'),

        $warning_msg = $message.find('.js-warning-message');

    $accept_warning.css('opacity', 0);
    $warning_msg.css('opacity', 0);
    $accept_warning_shop_not_work.css('opacity', 0);




    time_list.forEach(function (time_item) {
        if (time_item.id == request_id) {
            var timer = new Timer(time_item);
            //с БД приходит значение времени, соответствующее часовому поясу места нахождения сервера.
            // Переводим время начала отсчета(значение с БД) в часовую зону пользователя
            var localTime = timer.toLocalTime();
            //пришлось перевести отображение строки(en-US),
            //как у американцев, т.к. парсер путал месяц с днем
            // и соответственно неправильный расчет таймера шел
            timer.dateString = (new Date(localTime * 1000)).toLocaleString('en-US');
            var now = Math.floor(((new Date()).getTime()) / 1000),
                startTime = Math.floor((new Date(timer.dateString).getTime()) / 1000),
                workWeekCheck = timer.workWeekChecker(startTime, now),
                work_days = timer.getDifferenceDays(timer.dateString),
                passed_time = 0;


            if (workWeekCheck.type === 'success' && workWeekCheck.result === true) {
                if (work_days.length === 1) {
                    passed_time = timer.passedTimeOneDay();
                } else {
                    passed_time = timer.passedTimeAll({ amountOfDays: work_days.length - 2 });
                }
                console.log('passed_time', passed_time);
                if (passed_time < timer.time_interval_seconds) {
                    // Выводим радость
                    if (timer.checkWorkTime()) {
                        var time_left = timer.time_interval_seconds - passed_time;
                        console.log('time_left', time_left);
                        var interval = setInterval(function () {
                            timer.start(time_left);

                            if (!time_left) {
                                clearInterval(interval);
                            }
                            var min = timer.start(time_left).minutes,
                                sec = timer.start(time_left).seconds;
                            $accept_warning.css('opacity', 1);

                            $min.text(min);
                            $sec.text(sec);
                            time_left--;
                        }, 1000);
                    } else {
                        var date = new Date(timer.findNextWorkTime());
                        date.setHours(0, 0, 0, 0);
                        date.setSeconds(timer.time_interval_seconds + timer.work_start - passed_time);
                        $count_down_end.text(date.toLocaleString());
                        $accept_warning_shop_not_work.css('opacity', 1);
                    }
                    return;
                }
            }
            //Выводим печаль-тоску
            $warning_msg.css('opacity', 1);
            return;
        }
    });
});