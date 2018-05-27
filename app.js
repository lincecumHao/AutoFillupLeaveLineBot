var _SPREAD_SHEET_ID = '1CCEJPl8SKLW2t-igZKCGUgzRZmU_8btwVYeff8IQeys';
var _CHANNEL_ACCESS_TOKEN = 'y/G0EK6vYLlx+vi/AFnGE1064IqvSSmYfaFwuD4pggi5zeyv7xp1zDqthOUzftNWNr19eMtlaXrWVFdmVv+X+jPOpz9H58EekcWJmCp44N5Sfytk7ytIOU96KnIAYbxkQ5HSebk6+2kAYbVxbc3MtAdB04t89/1O/w1cDnyilFU=';
eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.1/moment.min.js').getContentText());

function doPost(e) {

	var msg = JSON.parse(e.postData.contents);
//  console.log(msg);

	// 取出 replayToken 和發送的訊息文字
	var replyToken = msg.events[0].replyToken;
	var userId = msg.events[0].source.userId;
	var userMessage = msg.events[0].message.text;

	if (typeof replyToken === 'undefined' || typeof userMessage === 'undefined') {
		return;
	}

	// Who am I
	if (userMessage.indexOf('我是誰') === 0 || userMessage.toLowerCase().indexOf('whoami') === 0 || userMessage.toLowerCase().indexOf('who am i') === 0) {
		var user = getUser(userId);
		if (user.index !== -1) {
			replyMsg(replyToken, 'Hello, ' + user.name);
		} else {
			replyMsg(replyToken, 'Sorry, I don\'t know yet, please tell me via type \'我是xxx\' or \'I\'m xxx\' to register.');
		}
	} else if (userMessage.indexOf('我是') === 0 || userMessage.indexOf('I\'m') === 0 || userMessage.indexOf('I am') === 0) {
		// Upsert user.
		var user = getUser(userId);
		var userName = userMessage.replace(/我是/g, '').replace(/I'm/g, '').replace(/I am/g, '').trim().replace(/\s/g, '-');
		if (user.index === -1) {
			appendUser(userId, userName);
			replyMsg(replyToken, 'Registed success, hi: ' + userName);
		} else {
			updateUser(user.index, userName);
			replyMsg(replyToken, 'Updated success, hi: ' + userName);
		}
	} else {
		// Test if is a ask for leave sentence
		// 5/25 [5/26] [早上/下午] [病假/特休]
		userMessage = userMessage.trim();
		var msgAry = userMessage.split(/\s+/);

		// First keyword must be a date string.
		var startDate = msgAry[0];
		var endDate;
		var nextIndex = 1;
		var isPattern = false;

		// 先看第一個參數是不是日期
		if (startDate.indexOf('到') > -1 || startDate.indexOf('~') > -1) {
			// 可能有結束時間
			// 預想情況: 5/24~5/25
			var seAry = startDate.split(/[到~]+/);
			if (moment(seAry[0], 'MM/DD').isValid()) {
				startDate = moment(seAry[0], 'MM/DD');
				isPattern = true;
			}
			if (moment(seAry[1], 'MM/DD').isValid()) {
				endDate = moment(seAry[1], 'MM/DD');
			}
		} else if(startDate.indexOf('今天') > -1){
			startDate = moment();
			endDate = startDate.clone();
		} else {
			if (moment(startDate, 'MM/DD').isValid()) {
				startDate = moment(startDate, 'MM/DD');
				isPattern = true;
			}
			// 預想情況: 5/24 ~ 5/25
			if (msgAry[1] && (msgAry[1].indexOf('到') > -1 || msgAry[1].indexOf('~') > -1) && moment(msgAry[2], 'MM/DD').isValid()) {
				endDate = moment(msgAry[2], 'MM/DD');
				nextIndex = 3;
			} else if (moment(msgAry[1], 'MM/DD').isValid()) {
				// 預想情況: 5/24 5/25
				endDate = moment(msgAry[1], 'MM/DD');
				nextIndex = 2;
			}
		}
		if (isPattern && startDate && !endDate) {
			endDate = startDate.clone();
		}

		// 是日期才嘗試下一個
		var hadTime = false;
		if (isPattern) {
			// 這邊要是時間
			// 預想情況: 上午/下午/1300~1400/13:00 ~ 14:00
			var time = msgAry[nextIndex];
			switch (time) {
				case '上午':
				case '半天':
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(10);
					endDate.minute(0);
					hadTime = true;
					nextIndex++;
					break;
				case '下午':
					startDate.hour(13);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
					hadTime = true;
					nextIndex++;
					break;
				case '整天':
				case '一天':
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
					hadTime = true;
					nextIndex++;
					break;
				default:
					if(!time) break;
					else if (time.indexOf('到') > -1 || time.indexOf('~') > -1) {
						// 可能有結束時間
						// 預想情況: 1300~1400
						var timeAry = time.split(/[到~]+/);
						if (moment(timeAry[0], 'HHmm').isValid()) {
							var startTime = moment(timeAry[0], 'HHmm');
							startDate.hour(startTime.hour());
							startDate.minute(startTime.minute());
							hadTime = true
						}
						if (moment(timeAry[1], 'HHmm').isValid()) {
							var endTime = moment(timeAry[1], 'HHmm');
							endDate.hour(endTime.hour());
							endDate.minute(endTime.minute());
							hadTime = true;
						}
						if (hadTime) nextIndex++;
					} else {
						if (moment(time, 'HHmm').isValid()) {
							var startTime = moment(time, 'HHmm');
							startDate.hour(startTime.hour());
							startDate.minute(startTime.minute());
							nextIndex++;
							hadTime = true;
						}
						// 預想情況: 13:00 ~ 14:00
						if (msgAry[nextIndex] && (msgAry[nextIndex].indexOf('到') > -1 || msgAry[nextIndex].indexOf('~') > -1) && moment(msgAry[nextIndex + 1], 'HHmm').isValid()) {
							var endTime = moment(msgAry[nextIndex + 1], 'HHmm');
							endDate.hour(endTime.hour());
							endDate.minute(endTime.minute());
							nextIndex = nextIndex + 2;
							hadTime = true;
						}
					}
					break;
			}

			var leaveType = msgAry[nextIndex];
			var hadLeave = false;
			if (leaveType && (leaveType.indexOf('特休') > -1 || leaveType.indexOf('休假') > -1)) {
				leaveType = '特休';
				hadLeave = true;
			} else if (leaveType && leaveType.indexOf('病假') > -1) {
				leaveType = '病假';
				hadLeave = true;
			} else if (leaveType && leaveType.indexOf('事假') > -1) {
				leaveType = '事假';
				hadLeave = true;
			}

			if (!hadTime && hadLeave) {
				// 如果沒有設定過時間
				// 預想情況 特休半天, 特休一天, 上午特休, 下午休假
				var possibleTime = msgAry[nextIndex].replace(/特休/, '').replace(/病假/, '');
				if(possibleTime.indexOf('上午') > -1 || possibleTime.indexOf('半天') > -1) {
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(10);
					endDate.minute(0);
				} else if (possibleTime.indexOf('下午') > -1) {
					startDate.hour(13);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
				} else if(possibleTime.indexOf('整天') > -1 || possibleTime.indexOf('一天') > -1) {
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
				}

				var possibleTime = msgAry[nextIndex + 1];
				if(possibleTime && (possibleTime.indexOf('上午') > -1 || possibleTime.indexOf('半天') > -1)) {
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(10);
					endDate.minute(0);
				} else if (possibleTime && possibleTime.indexOf('下午') > -1) {
					startDate.hour(13);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
				} else if(possibleTime && (possibleTime.indexOf('整天') > -1 || possibleTime.indexOf('一天') > -1)) {
					startDate.hour(7);
					startDate.minute(0);
					endDate.hour(16);
					endDate.minute(0);
				}
			}
		}

		if (isPattern && hadLeave) {
			var user = getUser(userId);
			if (user.index === -1) {
				replyMsg(replyToken, 'Sorry, 你需要先告訴我你是誰才能請假, 請用 \'我是xxx\' or \'I\'m xxx\' to register.');
				return;
			} else {
				user = user.name;
				insertLeave(user, startDate.format('YYYY/MM/DD HH:mm'), endDate.format('YYYY/MM/DD HH:mm'), leaveType);
				replyMsg(replyToken, user + '您好: ' + startDate.format('MM/DD HH:mm') + ' 至 ' + endDate.format('MM/DD HH:mm') + ' ' + leaveType + ' 以協助您紀錄, 感謝您幫助jojo');
			}
		}
	}
}

function replyMsg(token, msg) {
	var url = 'https://api.line.me/v2/bot/message/reply';
	UrlFetchApp.fetch(url, {
		'headers': {
			'Content-Type': 'application/json; charset=UTF-8',
			'Authorization': 'Bearer ' + _CHANNEL_ACCESS_TOKEN,
		},
		'method': 'post',
		'payload': JSON.stringify({
			'replyToken': token,
			'messages': [{
				'type': 'text',
				'text': msg,
			}],
		}),
	});
}

/**
 * Append Leave
 */
function insertLeave(userName, startDate, endDate, type) {
	var resource = {
		majorDimension: 'ROWS',
		values: [[userName, startDate, endDate, type]]
	};
	var range = 'Leaves!A:E';
	var optionalArgs = {valueInputOption: "USER_ENTERED"};
	Sheets.Spreadsheets.Values.append(resource, _SPREAD_SHEET_ID, range, optionalArgs);
}

/**
 * User Functions
 **/
function getUser(userId) {
	var userTable = 'User Mapping!A:B';
	var names = Sheets.Spreadsheets.Values.get(_SPREAD_SHEET_ID, userTable).values;
	var userIndex = -1;
	var matchUser = names.filter(function (nameObj, index) {
		if (nameObj[0] === userId) userIndex = index;
		return nameObj[0] === userId;
	});
	return {
		name: matchUser[0] ? matchUser[0][1] : undefined,
		index: userIndex
	};
}

function updateUser(index, userName) {
	var resource = {
		majorDimension: 'ROWS',
		values: [[userName]]
	};
	var range = 'User Mapping!B' + (index + 1);
	var optionalArgs = {valueInputOption: "USER_ENTERED"};
	Sheets.Spreadsheets.Values.update(resource, _SPREAD_SHEET_ID, range, optionalArgs);
}

function appendUser(userId, userName) {
	var resource = {
		majorDimension: 'ROWS',
		values: [[userId, userName]]
	};
	var range = 'User Mapping!A:B';
	var optionalArgs = {valueInputOption: "USER_ENTERED"};
	Sheets.Spreadsheets.Values.append(resource, _SPREAD_SHEET_ID, range, optionalArgs);
}

