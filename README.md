# Auto Fillup Leave Form LineBot
This is a side project for my company(Concentrus) had a more convenient way to fill up the leave form.

## WHY
In Taiwan, we use the line a lot, we will have a quick message in a group to notify the group, that we're going to have a leave.
Much like sick leave or personal leave. 
When the month ends, we'll have to fill up the form for our HR(JOJO) to calculate how many leaves we use and left.
So JoJo will have to make sure everyone fills the form and fill right, which will cause a lot of time.
That's why this robot born.

## HOW
This is a very basic line bot, that will auto update a specific Google sheet.
There is all the tech stack I use.
* **Serverless**.
* Google Apps Script
* Google Sheet
* Google Sheet API v4
* Google Console
* Line Message API
* Moment.js

## Support pattern
I'll list some pattern that is current support now, 
[] means is optional.
### whoami, who am I, 我是誰
This will show what is your register name in the google sheet. **ps: You need register to use this service**

### I'm xxx, I am xxx, 我是[' ']xxx
This will register your name in Google sheet

### date[' '][~,到][' ']date [time:min][' '][~,到][' '][time:min] leaveType(病假/事假/特休)
This will actually insert a record into google sheet. **ps: If you're not registed bot will ask you to register**


The `leave type` now only support *sick leave, personal leave, business leave*

### date [上午/下午/半天] leave type(病假/事假/特休) [上午/下午/半天]
This is some transform from upper one, it has a human way to say we have a leave, more like:


5/30 half day sick leave or

5/30 morning sick leave


## Something I can work on
1. More Humanize
2. support more work, like edit, cancel, validate duplicate.
3. Use GCP 
4. Refactor needed!!!





