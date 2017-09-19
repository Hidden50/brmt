(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
const listeners = ui.listeners = {};

listeners.preventPropagation = function preventPropagation (domEvent) {
	// prevent the containing DOM element from receiving this event
	const evt = domEvent || window.event;
	
	if (evt.stopPropagation)
		evt.stopPropagation();
	else evt.cancelBubble = true;
	
	return false;
};

listeners.addClassListeners = function addClassListeners (parentNode, className, eventType, listener) {
	// recursively add listeners to all children, and their children, and so on, who have the specified class
	[...parentNode.childNodes].forEach( (node, index) => {
		if ( (node.tagName && node.tagName.toLowerCase() === className) || (node.classList && node.classList.contains(className)) ) {
			node.addEventListener( eventType, e => {
				listener(node, index);
				return listeners.preventPropagation(e);
			});
		}
		addClassListeners(node, className, eventType, listener);
	});
};

listeners.init = function init () {
	listeners.initBuilddataTA();
	listeners.initFormatSelector();
	listeners.initPokemonsearch();
	listeners.initTabpages();
	listeners.initPopups();
	window.addEventListener('online',  ui.updateOnlineStatus);
	window.addEventListener('offline', ui.updateOnlineStatus);
};

listeners.initBuilddataTA = function initBuilddataTA () {
	htmlNodes.buttons.useofficialnames.addEventListener('click', e => {
		htmlNodes.textareas.builddata.value = brmt.parser.buildDataToString(
			brmt.parser.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n", true
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.usespeciesids.addEventListener('click', e => {
		htmlNodes.textareas.builddata.value = brmt.parser.buildDataToString(
			brmt.parser.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n"
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.build.addEventListener('click', e => {
		ui.initCompendium();
		ui.invalidateThreatlists();
		return listeners.preventPropagation(e);
	});
};

listeners.initFormatSelector = function initFormatSelector () {
	htmlNodes.selects.format.addEventListener('change', e =>{
		ui.initCompendium(htmlNodes.selects.format.value);
		ui.invalidateThreatlists();
		ui.rebuildTeams();
		return listeners.preventPropagation(e);
	});
};

listeners.initPokemonsearch = function initPokemonsearch () {
	htmlNodes.inputs.search.addEventListener('input', e => {
		if (!htmlNodes.inputs.search.value)
			htmlNodes.inputs.search.blur();
		ui.updateSearchresults();
		return listeners.preventPropagation(e);
	});
	htmlNodes.inputs.search.addEventListener('focus', e => {
		ui.updateSearchresults();
		return listeners.preventPropagation(e);
	});
	window.addEventListener('click', e => {
		htmlNodes.inputs.search.value = "";
		ui.updateSearchresults();
		return listeners.preventPropagation(e);
	});
	window.addEventListener('keydown', e => {
		if (document.activeElement === htmlNodes.textareas.builddata)
			return listeners.preventPropagation(e);
		if (e.ctrlKey || e.altKey || e.metaKey)
			return listeners.preventPropagation(e);
		
		// arrow key up / down
		if (e.keyCode === 38 || e.keyCode === 40) {
			let node = htmlNodes.selectedSearchResult;
			while (node) {
				node = (e.keyCode === 38) ? node.previousElementSibling : node.nextElementSibling;
				if (node && node.classList && node.classList.contains("searchresult")) {
					htmlNodes.selectedSearchResult.classList.remove("selected");
					htmlNodes.selectedSearchResult = node;
					node.classList.add("selected");
					if (!ui.tools.isVisibleDOMElement(node))
						node.scrollIntoView();
					break;
				}
			}
			if (node && ui.tools.isVisibleDOMElement(node))
				e.preventDefault();
			else if (document.activeElement.type === "text") {
				window.scrollBy(0, e.keyCode === 38 ? -50 : 50);
				e.preventDefault();
			}
			return listeners.preventPropagation(e);
		}
		
		if (htmlNodes.divs.searchresults.classList.contains('active')) {
			if (e.keyCode === 13) {
				// enter key, confirm selection
				if (!htmlNodes.selectedSearchResult)
					return listeners.preventPropagation(e);

				ui.toggleTeammember(brmt.aliases.parseSetTitle(htmlNodes.selectedSearchResult.firstChild.firstChild.title).subject);
				ui.updateSearchresults();
				return listeners.preventPropagation(e);
			}
		} else {
			if ((e.keyCode === 8 && htmlNodes.inputs.search.value.length) || (e.keyCode >= 65 && e.keyCode <= 90)) {
				// user is typing outside the search bar
				// focus the search bar and type there instead
				htmlNodes.inputs.search.focus();
				console.log("blubb");
			}
		}
		return listeners.preventPropagation(e);
	});
};

listeners.initTabpages = function initTabpages () {
	[...document.querySelectorAll('nav a')].forEach( navlink => {
		const [, listID, tabID] = navlink.id.split('_');
		navlink.addEventListener('click', e => {
			if (navlink.classList.contains("reveal")) {
				navlink.parentNode.classList.toggle('reveal');
				e.preventDefault();
				return listeners.preventPropagation(e);
			}

			const container = navlink.parentNode.parentNode;
			const content = htmlNodes.tabcontents[listID] && htmlNodes.tabcontents[listID][tabID];

			[...navlink.parentNode.childNodes].forEach(
				sibling => sibling.classList && sibling.classList.remove('active')             // make all navlinks inactive
			);
			navlink.classList.add('active');                                                    // make selected navlinks active

			[...container.querySelectorAll('.tab-content .content')].forEach(
				content => content.classList.remove('active')                                  // make all content inactive
			);
			content && content.classList.add('active');                                         // make selected content active

			if (htmlNodes.tabcontents[listID] && htmlNodes.tabcontents[listID].updateContent)
				htmlNodes.tabcontents[listID].updateContent(listID, tabID);

			e.preventDefault();
			return listeners.preventPropagation(e);
		});
	});
	htmlNodes.tabcontents.main.updateContent = function updateContent(listID, tabID) {
		ui.cache.tabID = tabID;
		if (tabID === "intro") {
			if (location.hash)
				history.pushState("", document.title, window.location.pathname);
		}
		else location.hash = tabID;

		if (tabID === "builddata") 
			htmlNodes.divs.builddata.classList.add('active');
		else htmlNodes.divs.builddata.classList.remove('active');

		if (ui.config.threatlistParameters[tabID])
			ui.rebuildThreatlist();
		else if (tabID === "objectinspector") {
			let inspector = project.tools.jsObjectToHtml(project, project.tools.projectdesc, 1);
			htmlNodes.tabcontents.main.objectinspector.innerHTML = `<div class='objectinspector'>${inspector}</div>`;
		}
	};
	htmlNodes.links.objectinspector.addEventListener('click', e => {
		htmlNodes.tablinks.main.dyncontent.objectinspector.click();
		e.preventDefault();
		return listeners.preventPropagation(e);
	});
};

listeners.initPopups = function initPopups () {
	document.querySelector("html").addEventListener('click', e => {
		[...document.querySelectorAll(".popup")].forEach( el => el.classList.remove('active') );
	});
	[...document.querySelectorAll(".popup")].forEach( el => el.addEventListener('click', e => {
		e.preventDefault();
		return listeners.preventPropagation(e);
	}));
};

})();