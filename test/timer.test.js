const expect = require('chai').expect;
const Timer = require('../src/js/code/Timer');



describe('timer', () => {
    it('Check IS working time now', () => {
        const timer = new Timer({
            id: 113,
            dateString: '2018-08-22  08:00:00',
            serverTimezone: 10800,
            weekends: [5, 6],
            start_hour: 9,
            start_min: 0,
            end_hour: 18,
            end_min: 0
        });
        let time = '2018-08-22  12:00:00';
        expect(timer.checkWorkTime(time)).to.equal(true);

        time = '2018-08-22  08:00:00';
        expect(timer.checkWorkTime(time)).to.equal(false);

        time = '2018-08-25  08:00:00';
        expect(timer.checkWorkTime(time)).to.equal(false);

        time = '2018-08-22  09:00:00';
        expect(timer.checkWorkTime(time)).to.equal(true);

        time = '2018-08-22  18:00:00';
        expect(timer.checkWorkTime(time)).to.equal(true);
    });

    // ------------------------------------------------------------------------

    it('How much time was passed from start time to certain time in seconds', () => {
        const timer = new Timer({
            id: 113,
            dateString: '2018-08-22  08:00:00',
            serverTimezone: 10800,
            weekends: [5, 6],
            start_hour: 9,
            start_min: 0,
            end_hour: 18,
            end_min: 0
        });
        let time = '2018-08-22  04:00:00';
        expect(timer.passedTimeLastDay(time)).to.equal(0);

        time = '2018-08-22  09:00:00';
        expect(timer.passedTimeLastDay(time)).to.equal(0);

        time = '2018-08-25  10:00:00';
        expect(timer.passedTimeLastDay(time)).to.equal(3600);

        time = '2018-08-22  18:00:00';
        expect(timer.passedTimeLastDay(time)).to.equal(32400);

        time = '2018-08-25  19:00:00';
        expect(timer.passedTimeLastDay(time)).to.equal(32400);
    });

    // ------------------------------------------------------------------------

    it('How much time was passed from certain time to end of work time in seconds', () => {
        const timer = new Timer({
            id: 113,
            dateString: '2018-08-20  14:59:00',
            serverTimezone: 10800,
            weekends: [5, 6],
            start_hour: 9,
            start_min: 0,
            end_hour: 18,
            end_min: 0
        });

        // тест на рабочее време
        let time = '2018-08-20  17:59:59';
        expect(timer.passedTimeFirstDay(time)).to.equal(1);

        time = '2018-08-20  10:00:00';
        expect(timer.passedTimeFirstDay(time)).to.equal(28800);

        time = '2018-08-20  18:00:00';
        expect(timer.passedTimeFirstDay(time)).to.equal(0);

        time = '2018-08-20  09:00:00';
        expect(timer.passedTimeFirstDay(time)).to.equal(32400);


        // тест на рабочее время магазина
        time = '2018-08-20  08:00:00';
        expect(timer.passedTimeFirstDay(time)).to.equal(32400);

        time = '2018-08-20  20:00:00';
        expect(timer.passedTimeFirstDay(time)).to.equal(0);
    });

    // ------------------------------------------------------------------------

    it('How much time was passed if the calculation of time began on the day of settlement', () => {
        const timer = new Timer({
            id: 113,
            dateString: '2018-08-22  08:00:00',
            serverTimezone: 10800,
            weekends: [5, 6],
            start_hour: 9,
            start_min: 0,
            end_hour: 18,
            end_min: 0
        });

        let startTime = '2018-08-22  04:00:00';
        let currentTime = '2018-08-22  04:00:00'
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(0);

        startTime = '2018-08-22 09:00:00';
        currentTime = '2018-08-22 09:00:01';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(1);

        startTime = '2018-08-22 04:00:00';
        currentTime = '2018-08-22 18:00:00';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(32400);

        startTime = '2018-08-22 09:00:00';
        currentTime = '2018-08-22 18:00:00';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(32400);

        startTime = '2018-08-22 09:00:00';
        currentTime = '2018-08-22 17:00:00';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(28800);

        startTime = '2018-08-22 17:00:00';
        currentTime = '2018-08-22 18:00:01';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(3600);

        startTime = '2018-08-22 18:00:01';
        currentTime = '2018-08-22 18:00:02';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(0);

        startTime = '2018-08-22 08:00:00';
        currentTime = '2018-08-22 18:00:02';
        expect(timer.passedTimeOneDay(startTime, currentTime)).to.equal(32400);
    });

    it('', () => {
        const timer = new Timer({
            id: 113,
            dateString: '2018-08-22  08:00:00',
            serverTimezone: 10800,
            weekends: [5, 6],
            start_hour: 9,
            start_min: 0,
            end_hour: 18,
            end_min: 0
        });
        let startTime = '2018-08-17 08:00:00';
        let currentTime = '2018-08-23 18:00:02';
        expect(timer.getDifferenceDays(startTime, currentTime)).to.have.members([0, 1, 2, 3, 4]);

        startTime = '2017-10-05 14:00:00';
        currentTime = '2017-10-10 14:00:00';
        expect(timer.getDifferenceDays(startTime, currentTime)).to.have.members([4, 0, 1, 2]);

        startTime = '2018-08-23 08:00:00';
        currentTime = '2018-08-23 18:00:02';
        expect(timer.getDifferenceDays(startTime, currentTime)).to.have.members([4]);

    });

});

