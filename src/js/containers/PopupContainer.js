import React, { Component } from 'react';
import classnames from 'classnames';
import url from 'url';
import takeRight from 'lodash/array/takeright';
import wrapActionsWithMessanger from '../utils/wrapActionsWithMessanger';
import MinutesAndSeconds from '../components/MinutesAndSeconds';

const actions = wrapActionsWithMessanger([
	'countDown',
	'checkForTab',
]);

function processSiteInfo(siteURL, faviconURL) {
	const urlParse = url.parse(siteURL);
	const hostname = urlParse.hostname ? urlParse.hostname : urlParse.pathname;
	// turn www.facebook.com into facebook.com
	// TODO: a website like google.co.uk won't work with this solution, it'll return co.uk
	const parsedHostname = takeRight(hostname.split('.'), 2).join('.');

	actions.checkForTab(parsedHostname, faviconURL);
}

function urlIsInList(url, list) {
	return list.filter(site => url.indexOf(site.name) >= 0).length > 0;
}

export default class FocusContainer extends Component {
	constructor(props) {
		super(props);
		this.state = props.state;
	}
	updateState(newState) {
		this.setState(newState);
	}
	componentWillMount() {
		const { updateState } = this;
		chrome.extension.onMessage.addListener((req, sender, sendRes) => {
			if (req.type === 'STATE_UPDATE') {
				updateState.call(this, req.data);
			}
			return true;
		});
	}
	handleAddWebsite() {
		chrome.tabs.query(
			{currentWindow: true, active : true},
			tab => {
				if (tab.length !== 0) {
					const { url, id, favIconUrl } = tab[0];

					processSiteInfo(url, id, favIconUrl)		      
				}
			}
		)
	}
	render() {
		const { countDown, addWebsite } = actions;
		const { date, minutes, seconds, duration } = this.state.timer;
		const { websites } = this.state.websites;
		
		return (
			<section id="popup" className={classnames({focusing: minutes})}>
				{
					minutes
					? <MinutesAndSeconds minutes={minutes} seconds={seconds} />
					: (
						<div className="popup-section">
							<button 
								className="focus-button smaller" 
								onClick={() => countDown(Date.now())}
							>
								Start Working
							</button>
						</div>
					)
				}

				<div className="popup-section">
					{
						urlIsInList(this.props.url, websites)
						?
						<span>Site is on the blocked list</span>
						: (
							<button 
								className="focus-button smaller" 
								onClick={this.handleAddWebsite}
							>
								block this site
							</button>
						)
					}
				</div>
			</section>
		);
	}
}



