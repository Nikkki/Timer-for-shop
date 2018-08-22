/*
================ Passed time ONE day ================================================================
    {
        id: 113,
        dateString: "2017-10-13  08:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    },
    {
        id: 113,
        dateString: "2017-10-13  10:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    }

    console.log(timer.passedTimeOneDay("2017-10-13  11:00:00"));
    --> 7200
    --> 3600

    //--------------
        {
        id: 113,
        dateString: "2017-10-13  00:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    },
    {
        id: 113,
        dateString: "2017-10-13  10:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    },
    {
        id: 113,
        dateString: "2017-10-13  19:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    }
    console.log(timer.passedTimeOneDay("2017-10-13  20:00:00"));    
    --> 32400
    --> 28800
    --> 0
    =================================================================================================
    =======================Passed time for FIRST day=================================================
    {
        id: 113,
        dateString: "2017-10-13  01:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    },
    {
        id: 113,
        dateString: "2017-10-13  10:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    },
    {
        id: 113,
        dateString: "2017-10-13  19:00:00",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    }

    console.log(timer.passedTimeFirstDay()); 

    --> 32400
    --> 28800
    --> 0
    =================================================================================================
    =======================Passed time for LAST day=================================================
        {
        id: 113,
        dateString: "ВСЁ РАВНО КАКОЕ ЗДЕСЬ ВРЕМЯ СТОИТ",
        serverTimezone : 7200,
        weekends: [3],
        start_hour: 9,
        start_min: 0,
        end_hour: 18,
        end_min: 0
    }


    console.log(timer.passedTimeLastDay("2017-10-13  01:00:00"));  
    console.log(timer.passedTimeLastDay("2017-10-13  10:00:00"));  
    console.log(timer.passedTimeLastDay("2017-10-13  20:00:00"));  
    --> 0
    --> 3600
    --> 32400
    =================================================================================================
    

*/