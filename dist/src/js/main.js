var $confirmationMessageBlock = $('.js-confirmation-message');

time_list = [
    {
        id: 113,
        dateString: "2017-10-10  13:50:00",
        serverTimezone : 7200,
        weekends: [3],

        start_hour: 9,
        start_min: 45,
        end_hour: 20,
        end_min: 0

    }
];

$confirmationMessageBlock.each(function(index, message){
    var $message = $(message),
        request_id = $message.data('requestId'),
        $min =  $message.find('.js-timer__min'),
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
            console.log('llfd');
            var timer = new Timer(time_item);
            //с БД приходит значение времени, соответствующее часовому поясу места нахождения сервера.
            // Переводим время начала отсчета(значение с БД) в часовую зону пользователя
            var localTime = timer.toLocalTime();
            //пришлось перевести отображение строки(en-US),
            //как у американцев, т.к. парсер путал месяц с днем
            // и соответственно неправильный расчет таймера шел
            var str = (new Date(localTime * 1000)).toLocaleString('en-US'); 
            timer.dateString = str;
            var results = timer.mainCheck(); 
            console.log(results);
            
            if (results.result) {
                //TODO: проверять выходной ли сейчас и нерабочее время(рабочего дня)

                if(timer.checkWorkTime()) { 
                $accept_warning.css('opacity', 1);
                var sec  = results.time_left;
                //Запуск таймера
                var interval =  setInterval(function(){
                    var timer_counter = timer.start(sec);
                    $min.text(timer_counter.minutes);
                    $sec.text(timer_counter.seconds);
                    sec--;
                    if (sec < 0){
                        clearInterval(interval);
                        $accept_warning.css('opacity', 0);     
                        $accept_warning_shop_not_work.css('opacity', 0);                       
                        $warning_msg.css('opacity', 1);
                    }
                }, 1000);
                } else {
                    var date = new Date(timer.findNextWorkTime());
                    //TODO: нужно передавать в startTimeCheck  -  true или false;   
                    var startTimeCheck = timer.startTimeChecker(timer.dateString, false),
                        start_work = ((timer.work_time.start_hour * 60 ) + timer.work_time.start_min) * 60,
                        passed_time = startTimeCheck.passed_time;
                    date.setHours(0,0,0,0);
                    date.setSeconds(timer.time_interval_seconds + start_work - passed_time);   
                                                                                     
                    $accept_warning.css('opacity', 0);     
                    $accept_warning_shop_not_work.css('opacity', 1);  
                    $warning_msg.css('opacity', 0);
                    console.log(passed_time);
                    console.log((date.toLocaleString()));
                    $count_down_end.text(date.toLocaleString());
                }


            } else {
                $accept_warning.css('opacity', 0);     
                $accept_warning_shop_not_work.css('opacity', 0);  
                $warning_msg.css('opacity', 1);
                
            }

        }
    });
});