// ;(function(){
    function Timer(opt) {
        this.time = opt.time || 0;
        this.work_time = {  // рабочее время магазина
            start_hour: opt.start_hour || 9,
            start_min:  opt.start_min  || 0,
            end_hour:   opt.end_hour   || 18,
            end_min:    opt.end_min    || 0
        };
        this.weekends = opt.weekends || [6,0];//выходные дни по-умолчанию - 6-cб, 0-вс.
        this.serverTimezone = opt.serverTimezone || 7200; // часовой пояс сервера

        this.time_interval_minutes = opt.time_interval_minutes || 30; //время, которое дается, чтобы принять заказ(в минутах)
        this.time_interval_seconds = this.time_interval_minutes * 60; //время, которое дается, чтобы принять заказ(в секундах)
        this.dateString = opt.dateString;
    }


    /**
     * Переводит время из какой-либо таймзоны в локальное время
     *
     * @param timezone {number} - время таймзоны в секундах даты, которую нужно перевести в локальное время
     * @param dateTime {string} - дата, которую нужно перевести в локал. время

     * @return localTime_sec - переданное время в пересчета на локальное в секундах
     * */
    Timer.prototype.toLocalTime = function () {
        var serverTz = this.serverTimezone, // часовой пояс в секуднах
            dateString = this.dateString,
            date = new Date(dateString),
            serverTime = date.getTime(),
            localTz = -date.getTimezoneOffset() * 60,//часовой пояс в секундах будет сохранен
            localTime,
            localTime_sec;
        localTime = serverTime - (serverTz - localTz)*1000; //расчет в милисекундах
        localTime_sec = Math.floor(localTime / 1000);
        return localTime_sec;
    };

    Timer.prototype.toHumanTime = function (seconds, time_type_arr) {
        var time_obj = {};
        time_type_arr.forEach(function (t) {
            switch (t) {
                case 'seconds':
                    time_obj.seconds = (((seconds % 31536000) % 86400) % 3600) % 60;
                    break;
                case 'minutes':
                    time_obj.minutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
                    break;
                case 'hours':
                    time_obj.hours = Math.floor(((seconds % 31536000) % 86400) / 3600);
                    break;
                case 'days':
                    time_obj.days = Math.floor((seconds % 31536000) / 86400);
                    break;
                case 'years':
                    time_obj.years = Math.floor(seconds / 31536000);
                    break;
            }
        });
        return time_obj;
    };

    /** 
    * Проверяет сколько дней прошло между тем, как пользователь подтвердил, что хочет сделать заказ и тем, как магазин зашел к себе в аккаунт
    *
    * @param startTime {number} - время в сек от 1января 1970года=), время от которого начался отсчет времени
    * @param now  {number} -      время в сек от 1января 1970года=), время сейчас
    *@return - если прошло меньше недели, то выводит true  
    * **/
    Timer.prototype.workWeekChecker = function (startTime, now) {
        var difference = now - startTime,
            difference_days = this.toHumanTime(difference, ['days']).days;
        if(difference_days !== difference_days || typeof difference_days !== 'number'){
            console.error('Кажется что-то пошло не так, полученные аргументы - невалидны');
            return {
                result: false,
                type: 'error'
            };
        }
        if( difference_days < 7){
            return {
                result: true,
                type: 'success',
                difference_days: difference_days
            };
        } else {
            return {
                result: false,
                type: 'success',
                difference_days: difference_days
            };
        } 
    };
    /*
    *
    * **/
    Timer.prototype.getDifferenceDays = function (startTime, endTime) {

        var getDayStart = (new Date(startTime)).getDay(),
            getDayEnd   = (endTime) ? (new Date(endTime)).getDay() : (new Date()).getDay(),
            weekends = this.weekends,
            days = [],
            i;
        //выделяем дни недели между "конечным" и "начальным" временем
        // Пример:
            // start - "2017-10-05 14:00:00"
            // now   - "2017-10-10 14:00:00"
            // на выходе days = [4, 5, 6, 0, 1, 2]
        if (getDayStart > getDayEnd) {
            for (i = getDayStart; i < 7; i++){
                days.push(i);
            }
            for (i = 0; i <= getDayEnd ; i++){
                days.push(i);
            }
        } else {
            for (i = getDayStart; i <= getDayEnd; i++){
                days.push(i);
            }
        }
        //выделяет элементы массивов, которые различаются
        Array.prototype.diff = function(a) {
            return this.filter(function(i){return a.indexOf(i) < 0;});
        };
        console.log(days + '   ' +  weekends);
        return days.diff(weekends);
    };

    /**
    * @param startTime {number} - начальное время в секундах
    *
    * @param isToday {boolean}  - сегодняшний ли день
    * **/
    Timer.prototype.startTimeChecker = function (startTime, isToday, endTime) {
        var time   = new Date(startTime),
            endTime = (endTime) ? new Date(endTime) : new Date(),
            seconds = time.getSeconds(),
            minutes = time.getMinutes(),
            hours = time.getHours(),
            endTime_h = endTime.getHours(),
            endTime_m = endTime.getMinutes(),
            endTime_s = endTime.getSeconds(),
            secondsEndTime = (endTime_h * 60 + endTime_m) * 60 + endTime_s,
            secondsStartTime = (hours * 60 + minutes) * 60 + seconds,
            work_start = (this.work_time.start_hour * 60 + this.work_time.start_min) * 60,
            work_end = (this.work_time.end_hour * 60 + this.work_time.end_min) * 60;

        if ((work_start <= secondsStartTime) && (secondsStartTime <= work_end)) {
            console.log('==========');
            if ((secondsEndTime - secondsStartTime < this.time_interval_seconds) && !isToday){
                return {
                    result: true,
                    passed_time: work_end - secondsStartTime
                };
            } else if ((secondsEndTime - secondsStartTime > this.time_interval_seconds) && isToday) {
                return {
                    result: true,
                    passed_time: secondsEndTime - secondsStartTime
                };
            } else {
                return {
                    result: false
                };
            }
        } else {
            if (secondsStartTime < work_start) {
                return {
                    result: true,
                    passed_time: 0
                };
            }
        }
    };

    /**
    * @param passed_time {number} - время уже которое натрекано на данный момент(в сек)
     * **/
    Timer.prototype.nowTimeChecker = function (passed_time) {
        var date = new Date(),
            seconds = date.getSeconds(),
            minutes = date.getMinutes(),
            hours = date.getHours(),
            getDate = date.getDate(),
            month = date.getMonth(),
            year = date.getYear(),
            secondsNow = (hours * 60 + minutes) * 60 + seconds, //сколько прошло секунд от 00:00 до данного момента,
            startTime = new Date(this.dateString),
            startTimeSeconds = (startTime.getHours() * 60 + startTime.getMinutes()) * 60 + startTime.getSeconds(),
            work_start = (this.work_time.start_hour * 60 + this.work_time.start_min) * 60, // сколько сек прошло от 00:00 до начала рабоч дня
            work_end = (this.work_time.end_hour * 60 + this.work_time.end_min) * 60, // сколько сек прошло от 00:00 до конца рабоч дня
            time_left;
        // console.log('seconds work interval ' + this.time_interval_seconds);
        // console.log('passed_time  '+ passed_time);
        console.log('seconds now  ' + secondsNow);
        // console.log('work_start   ' + work_start);
        // console.log('work_end   ' + work_end);
        console.log('startTime Seconds ' + startTimeSeconds );



        if ((work_start <= secondsNow) && (secondsNow <= work_end))  { 
            if(passed_time === 0){
                //Проверяем сегодня ли покупатель сделал заказ
                if (getDate === startTime.getDate() &&
                    month   === startTime.getMonth() &&
                    year    === startTime.getYear())
                    {
                        time_left = secondsNow - startTimeSeconds;
                    } else {
                        return {
                            result: true,
                            time_left : secondsNow - work_start
                        };
                    }
                if (time_left > this.time_interval_seconds){
                    return {
                        result: false
                    };
                } else {
                    return {
                        result: true,
                        time_left: this.time_interval_seconds - time_left
                    };
                }

            } else if (passed_time > 0) {
                time_left = secondsNow - startTimeSeconds + passed_time;
            }
            if (time_left > this.time_interval_seconds){
                return {
                    result: false
                };
            } else {
                return {
                    result: true,
                    time_left: this.time_interval_seconds - time_left
                };
            }

        } else {
            if (secondsNow < work_start){
                return {
                    result: true,
                    time_left: time_left
                };
            } else {
                return {
                    result: false
                };
            }
        }
    };

/**
* запуска отсчет таймера
* @param sec {number} - сколько осталось секунд
* @return seconds {string} - сколько сек осталось (0-59) 
* @return minutes {string} - сколько минут осталось (0-59)           
*/
    Timer.prototype.start = function (sec) {
        var timeObj = this.toHumanTime(sec, ['seconds', 'minutes', 'hours']),
            seconds = timeObj.seconds,
            minutes = timeObj.minutes;
        if (timeObj.seconds < 10) {
            seconds = '0' + timeObj.seconds;
            if (timeObj.seconds < 0){
                seconds = 59;
                minutes--;
                if (timeObj.minutes < 10){
                    minutes = '0' + timeObj;
                } if(timeObj.minutes < 0) {
                    minutes = '00';
                    seconds = '00';
                    return ;
                }
            }
        }
        return {
            seconds: seconds,
            minutes: minutes
        };
    };

    Timer.prototype.mainCheck = function (endTime) {
        var now = endTime ? Math.floor(((new Date(endTime)).getTime())/1000) : Math.floor(((new Date()).getTime())/1000),
            startTime = Math.floor((new Date(this.dateString).getTime())/1000),
            workWeekCheck = this.workWeekChecker(startTime,  now),
            diff_days = this.getDifferenceDays(this.dateString),
            nowTimeChecker;
        //1-ый этап проверки
      //  console.log(workWeekCheck);
        if (workWeekCheck.type ==='success' && workWeekCheck.result === true ){
            //2-ой этап проверки
            if (diff_days.length <= 2){
                if (workWeekCheck.difference_days > 0){
                    var startTimeCheck = this.startTimeChecker(this.dateString);
                    if (startTimeCheck.result){
                        nowTimeChecker = this.nowTimeChecker(startTimeCheck.passed_time);
                        if (nowTimeChecker.result){
                            return {
                                result: true,
                                time_left: nowTimeChecker.time_left
                            };
                        } else {
                            return {
                                result: false
                            };
                        }
                    } else {
                        return {
                            result: false
                        };
                    }
                    //значит, что подтверждение от покупателя было, в тот же день, что и магазин зашел к себе на акк
                } else if (workWeekCheck.difference_days === 0){
                    var passed_time = 0;
                    nowTimeChecker = this.nowTimeChecker(passed_time);
                    console.log('time checker', nowTimeChecker);
                    if (nowTimeChecker.result){
                        return {
                            result: true,
                            time_left: nowTimeChecker.time_left
                        };
                    } else {
                        return {
                            result:  false
                        };
                    }
                } else {
                    return {
                        result: false
                    };
                }
            } else {
                return {
                    result: false
                };
            }
        } else {
            return {
                result: false
            };
        }
    };

/**
*Проверяем, рабочее ли сейчас время магазина
*
*@return {boolean} - true - работает магазин, false - не работает 
*/
    Timer.prototype.checkWorkTime = function(endTime) {
        var date = endTime ? new Date(endTime) : new Date(),
        day = date.getDay(),
        seconds = date.getSeconds(),
        minutes = date.getMinutes(),
        hours = date.getHours(),
        secondsNow = (hours * 60 + minutes) * 60 + seconds, //сколько прошло секунд от 00:00 до данного момента,
        work_start = (this.work_time.start_hour * 60 + this.work_time.start_min) * 60, // сколько сек прошло от 00:00 до начала рабоч дня
        work_end = (this.work_time.end_hour * 60 + this.work_time.end_min) * 60; // сколько сек прошло от 00:00 до конца рабоч дня

        // рабочий ли сейчас день
        if(this.weekends.indexOf(day) === -1){
            //рабочее ли сейчас время 
            return (secondsNow >= work_start) && (secondsNow <= work_end) ;
        } else {
            return false;
        }
    };


    Timer.prototype.findNextWorkTime = function (endTime) {
        var date = endTime ? new Date(endTime) : new Date(),
            getDate = date.getDate();
            seconds = date.getSeconds(),
            minutes = date.getMinutes(),
            hours = date.getHours(),
            secondsNow = (hours * 60 + minutes) * 60 + seconds, //сколько прошло секунд от 00:00 до данного момента,
            work_start = (this.work_time.start_hour * 60 + this.work_time.start_min) * 60, // сколько сек прошло от 00:00 до начала рабоч дня
            work_end = (this.work_time.end_hour * 60 + this.work_time.end_min) * 60; // сколько сек прошло от 00:00 до конца рабоч дня
        
        if( (this.weekends.indexOf(getDate) === -1) && (secondsNow < work_end)) {
            return date.setHours(this.work_time.start_hour, this.work_time.start_min, 0, 0); 
        } else {
            Array.prototype.diff = function(a) {
            return this.filter(function(i){return a.indexOf(i) < 0;}); };

            var week_array = [0,1,2,3,4,5,6],
                work_days = week_array.diff(this.weekends),
                i;
                for (i = 0, max = work_days.length; i < max; i++){
                    if( getDate >= work_days[i] ){
                        date = date.setDay(date.getDay() + (getDate - work_days[i]));
                        date = date.setHours(this.work_time.start_hour, this.work_time.start_min, 0, 0); 
                        return date;
                    }
                }
        }
    };
    
    

// }());

