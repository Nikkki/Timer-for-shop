// ;(function(){
    function Timer(opts) {
        //Если конструктор Timer вызван без new 
        if  (!(this instanceof Timer)) {
            return new Timer(opts);
        }
    
        this.work_time = {  // рабочее время магазина
            start_hour: opts.start_hour === undefined ? 9 : opts.start_hour,
            start_min:  opts.start_min === undefined ? 0 : opts.start_min,
            end_hour:   opts.end_hour === undefined ? 18 : opts.end_hour,
            end_min:    opts.end_min === undefined ? 0 : opts.end_min
        };
        this.work_end = (this.work_time.end_hour * 60 + this.work_time.end_min) * 60; // сколько сек прошло от 00:00 до конца рабоч дня
        
        this.work_start = (this.work_time.start_hour * 60 + this.work_time.start_min) * 60; // сколько сек прошло от 00:00 до начала рабоч дня
        
        this.weekends = opts.weekends || [6, 0];//выходные дни по-умолчанию - 6-cб, 0-вс.
        this.serverTimezone = opts.serverTimezone === undefined ? 7200 : opts.serverTimezone; // часовой пояс сервера

        this.time_interval_minutes = opts.time_interval_minutes === undefined ? 30 : opts.time_interval_minutes; //время, которое дается, чтобы принять заказ(в минутах)
        this.time_interval_seconds = this.time_interval_minutes * 60; //время, которое дается, чтобы принять заказ(в секундах)
        this.dateString = opts.dateString;// получаем строку с датой для объекта Date()
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
    * Проверяет сколько дней прошло между тем, как пользователь подтвердил, 
    * что хочет сделать заказ и тем, как магазин зашел к себе в аккаунт
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
        return days.diff(weekends);
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

    /**Сколько времени уже прошло, если отчет времени(заказ принял пользователь) начался в тот же, что и проходит проверка времени
     * 
     * @param {string} startTime - время, от которого начинается отсчет времени(в формате "2017-10-05 14:00:00")
     * @param {string} endTime  - время, когда проходит проверка времени((в формате "2017-10-05 14:00:00"))
     * @return {number} - сколько секунд прошло
     */
    Timer.prototype.passedTimeOneDay = function(endTime, startTime) {
        var /*now*/ endDate   = endTime   ? new Date(endTime)   : new Date(),
            /*startTime*/startDate = startTime ? new Date(startTime) : new Date(this.dateString),
            secondsEnd = (endDate.getHours() * 60 + endDate.getMinutes()) * 60 + endDate.getSeconds(), //сколько прошло секунд от 00:00 до данного момента,
            secondsStart = (startDate.getHours() * 60 + startDate.getMinutes()) * 60 + startDate.getSeconds(); //сколько прошло секунд от 00:00 до принятие заказа пользователем,
        var passed_time = 0;
        if ((this.work_start <= secondsEnd) && (secondsEnd <= this.work_end)){
            if (secondsStart < this.work_start){
                passed_time = secondsEnd - this.work_start;
            } else {
                passed_time = secondsEnd - secondsStart;
            }
            return passed_time;
        }  
        
        if (secondsEnd > this.work_end) {
            if (secondsStart < this.work_start) {
                passed_time = this.work_end - this.work_start;
            } 
            if ((this.work_start <= secondsStart) && (secondsStart <= this.work_end)){
                passed_time = this.work_end - secondsStart;
            } 
            return passed_time;
        } 
        return passed_time;
    };

    /**
     * 
     * @return {number} - сколько секунд прошло
     */
    Timer.prototype.passedTimeFirstDay = function(startTime) {
        var startDate = startTime ? new Date(startTime) : new Date(this.dateString), /*startTime*/
            secondsStart = (startDate.getHours() * 60 + startDate.getMinutes()) * 60 + startDate.getSeconds(), //сколько прошло секунд от 00:00 до принятие заказа пользователем,
            passed_time = 0;
        if ( (this.work_start <= secondsStart) && (secondsStart <= this.work_end) ){
            return this.work_end - secondsStart;
        }    
        if (secondsStart < this.work_end) {
            return this.work_end - this.work_start;
        }
        return passed_time;
    };

    /**
     * 
     * @return {number} - сколько секунд прошло
     */
    Timer.prototype.passedTimeLastDay = function(endTime) {
        var /*now*/ endDate   = endTime   ? new Date(endTime)   : new Date(),
            secondsEnd = (endDate.getHours() * 60 + endDate.getMinutes()) * 60 + endDate.getSeconds(), //сколько прошло секунд от 00:00 до данного момента,
            passed_time = 0;
        if ((this.work_start <= secondsEnd) && (secondsEnd <= this.work_end)){
            return secondsEnd - this.work_start;
        }
        if(secondsEnd > this.work_end) {
            return this.work_end - this.work_start;
        }
        return passed_time;
    };

    /**
     * Сколько времени прошло в дни(кроме первого и последнего дня)
     * @param {number} amountOfDays - сколько таких дней
     */
    Timer.prototype.passedTimeSimpleWorkDay = function (amountOfDays) {
        if (amountOfDays === 0){
            return 0;
        }
        var work_day_seconds = this.work_end - this.work_start;
        return work_day_seconds * amountOfDays;
    };

    /**
     * 
     */
    Timer.prototype.passedTimeAll = function(options) {
        options = options || {};
        startTime = options.startTime || null;
        endTime = options.endTime || null;
        amountOfDays = options.amountOfDays;
        return  this.passedTimeLastDay(endTime) + 
                this.passedTimeFirstDay(startTime) +
                this.passedTimeSimpleWorkDay(amountOfDays);
    };

    /**
    *Проверяем, рабочее ли сейчас время магазина
    *
    *@return {boolean} - true - работает магазин, false - не работает 
    */
    Timer.prototype.checkWorkTime = function(endTime) {
        var date = endTime ? new Date(endTime) : new Date(),
        day = date.getDay(),
        secondsNow = (date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds(); //сколько прошло секунд от 00:00 до данного момента,

        // рабочий ли сейчас день
        if(this.weekends.indexOf(day) === -1){
            //рабочее ли сейчас время 
            return (secondsNow >= this.work_start) && (secondsNow <= this.work_end) ;
        }
        return false;
        
    };

/**
 * Определяем следующий рабочий день
 */
    Timer.prototype.findNextWorkTime = function (endTime) {
        var date = endTime ? new Date(endTime) : new Date(),
            getDay = date.getDay(),
            secondsNow = date.getSeconds() + 60 * (date.getHours() * 60 + date.getMinutes()); //сколько прошло секунд от 00:00 до данного момента,
        //сегодня ли рабочий день начнется
        if( (this.weekends.indexOf(getDay) === -1) && (secondsNow < this.work_end)) {
            return date.setHours(this.work_time.start_hour, this.work_time.start_min, 0, 0); 
        } 
        Array.prototype.diff = function(a) {
            return this.filter(function(i){return a.indexOf(i) < 0;}); 
        };
        
        var week_array = [0,1,2,3,4,5,6],
            work_days = week_array.diff(this.weekends),
            i, work_days_length, days_to_next_work_day, next_work_day;

        work_days_length = work_days.length;

        for ( i = 0; i < work_days_length; i++){
            if (getDay >= work_days[i]){
                if (i + 1 === work_days_length) {
                    next_work_day = work_days[0];
                    days_to_next_work_day = 7 - getDay - next_work_day; 
                }                
                next_work_day = work_days[i + 1];
                days_to_next_work_day = next_work_day - getDay;
                break;
            }      
            if (getDay < work_days[0]){
                next_work_day = work_days[0];
                days_to_next_work_day = next_work_day - getDay;
                break;
            }      
        }
        //устанавливаем следующий рабочий день
        date.setDate(date.getDate() + days_to_next_work_day);
        //устанавливаем начало рабочих часов
        date = date.setHours(this.work_time.start_hour, this.work_time.start_min, 0, 0); 
        return date;        
    };
    
    

// }());

