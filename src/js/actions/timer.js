import formatAMPM from '../utils/formatAMPM';

let countdownInterval;
const tickingSound = new Audio(`dist/sound/tick.mp3`);
tickingSound.loop = true;

export const SET_TIMER = 'SET_TIMER';
export function setTimer(date) {
	return {
		type: SET_TIMER,
		date
	}
}

export const CLEAR_TIMER = 'CLEAR_TIMER';
export function clearTimer() {
	clearInterval(countdownInterval);
	tickingSound.pause();
	return {
		type: CLEAR_TIMER,
	}
}

export const SET_TIME_LEFT = 'SET_TIME_LEFT';
export function setTimeLeft(minutes, seconds) {
	return {
		type: SET_TIME_LEFT,
		minutes,
		seconds,
	}
}

export const SET_COUNTDOWN_INTERVAL = 'SET_COUNTDOWN_INTERVAL';
export function setCountdownInterval(interval) {
	return {
		type: SET_COUNTDOWN_INTERVAL,
		interval
	}
}

export const CLEAR_COUNTDOWN_INTERVAL = 'CLEAR_COUNTDOWN_INTERVAL';
export function clearCountdownInterval() {
	return {
		type: CLEAR_COUNTDOWN_INTERVAL,
	}
}

export const UPDATE_SESSIONS = 'UPDATE_SESSIONS';
export function updateSessions(sessions) {
	return {
		type: UPDATE_SESSIONS,
		sessions
	}
}

import doubleDigit from '../utils/doubleDigit';
const MINUTE = 60000;
const SECOND = 1000;
export function countDown(date, duration, sound, ticking = false) {
	return dispatch => {
		dispatch(setTimer(date));
		dispatch(startCountDown(date, duration, sound, ticking));
	}
}

export function startCountDown(date, duration, sound, ticking) {
	var audio = new Audio(`dist/sound/${sound}.mp3`);
	if (ticking) {
		// play ticking sound on loop
		tickingSound.play();
	}
	return dispatch => {
		const dateEnd = date + duration;
		const setTime = interval => {
			const fromNow = dateEnd - Date.now();
			if (fromNow >= 0) {
				const minutes = doubleDigit(Math.floor(fromNow / MINUTE));
				const seconds = doubleDigit(Math.floor(fromNow / SECOND) % 60);
				dispatch(setTimeLeft(minutes, seconds));
			} else {
				clearInterval(interval);
				dispatch(clearCountdownInterval());
				chrome.notifications.create({
					title:'SESSION DONE',
					message: `Finished at ${formatAMPM(Date.now(), true)}`,
					type:'basic',
					iconUrl: 'dist/img/logo-lg-blue.png',
				});
				tickingSound.pause();
				audio.play();
			}
		};

		// start interval when you are on top of a second, otherwise you might
		// open the browser mid second and have timers that are out of sync
		setTimeout(() => {
			// set time everysecond
			countdownInterval = setInterval(() => {
				setTime(countdownInterval); // set times each interval
			}, 1000);

			setTime(countdownInterval); // set time first after timeout
			dispatch(setCountdownInterval(countdownInterval));
		}, (dateEnd - Date.now()) % SECOND );

		chrome.browserAction.setIcon({path: 'dist/img/logo-sm-red.png'});
		setTime(); // initial time before timeout
	}
}


export const TOGGLE_ASK_CANCEL_TIME = 'TOGGLE_ASK_CANCEL_TIME';
export function toggleAskCancelTimer() {
	return {
		type: TOGGLE_ASK_CANCEL_TIME
	}
}

export const SET_TIMER_LENGTH = 'SET_TIMER_LENGTH';
export function setTimerLength(incOrDec = 'INCREMENT') {
	return {
		type: SET_TIMER_LENGTH,
		incOrDec
	}
}

export const TOGGLE_TICKING = 'TOGGLE_TICKING';
export function toggleTicking() {
	return {
		type: TOGGLE_TICKING,
	}
}
