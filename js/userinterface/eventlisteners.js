(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let listeners = ui.listeners = {};

listeners.preventPropagation = function preventPropagation (domEvent) {
	// prevent the containing DOM element from receiving this event
	let evt = domEvent || window.event;
	
	if (evt.stopPropagation)
		evt.stopPropagation();
	else
		evt.cancelBubble = true;
	
	return false;
};

listeners.addClassListeners = function addClassListeners (parentNode, className, eventType, listener) {
	// recursively add listeners to all children, and their children, and so on, who have the specified class
	[...parentNode.childNodes].forEach( (node, index) => {
		if ( (node.tagName && node.tagName.toLowerCase() === className) || (node.classList && node.classList.contains(className)) )
			node.addEventListener( eventType, e => {
				listener(node, index);
				return listeners.preventPropagation(e);
			});
		addClassListeners(node, className, eventType, listener);
	});
};

listeners.init = function init () {
	listeners.initBuilddataTA();
	listeners.initTeamselection();
	listeners.initCompendiumSelector();
	listeners.initPokemonsearch();
	listeners.initTabpages();
};

listeners.initBuilddataTA = function initBuilddataTA () {
	htmlNodes.buttons.useofficialnames.addEventListener('click', e => {
		htmlNodes.textareas.builddata.value = brmt.builder.buildDataToString(
			brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n", true
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.usespeciesids.addEventListener('click', e => {
		htmlNodes.textareas.builddata.value = brmt.builder.buildDataToString(
			brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n"
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.build.addEventListener('click', e => {
		ui.rebuildThreatlist();
		return listeners.preventPropagation(e);
	});
};

listeners.initTeamselection = function initTeamselection () {
	htmlNodes.buttons.loadteam.addEventListener('click', e => {
		ui.showPopup(
			htmlNodes.buttons.loadteam,
			htmlNodes.popups.teamselect
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.clearteam.addEventListener('click', e => {
		ui.cache.team = [];
		ui.rebuildTeams();
		let params = ui.config.threatlistParameters[ui.cache.tab];
		if (params && params.rate.teamSource === "team" || params.display.teamSource === "team")
			ui.rebuildThreatlist();
		return listeners.preventPropagation(e);
	});
};

listeners.initCompendiumSelector = function initCompendiumSelector () {
	htmlNodes.selects.checkscompendium.addEventListener('change', e =>{
		ui.initCompendium( htmlNodes.selects.checkscompendium.value );
		ui.rebuildThreatlist();
		ui.rebuildTeams();
		return listeners.preventPropagation(e);
	});
};

listeners.initPokemonsearch = function initPokemonsearch () {
	htmlNodes.inputs.search.addEventListener('input', e => {
		if (!htmlNodes.inputs.search.value)
			htmlNodes.inputs.search.blur();
		ui.updateSearchresults(htmlNodes.inputs.search.value);
		return listeners.preventPropagation(e);
	});
	htmlNodes.inputs.search.addEventListener('focus', e => {
		ui.updateSearchresults(htmlNodes.inputs.search.value);
		return listeners.preventPropagation(e);
	});
	document.body.addEventListener('click', e => {
		// using on:'blur' with htmlNodes.inputs.search
		// would lead to undesired results when clicking on a search result
		// so we are using on:'click' with document.body instead
		ui.updateSearchresults(htmlNodes.inputs.search.value);
		return listeners.preventPropagation(e);
	});
	document.addEventListener('keydown', e => {
		if (document.activeElement === htmlNodes.textareas.builddata)
			return listeners.preventPropagation(e);
		if (e.ctrlKey || e.altKey || e.metaKey)
			return listeners.preventPropagation(e);
		
		if (e.keyCode === 40) {              // arrow key down
			if (document.activeElement === htmlNodes.inputs.search) {
				let node = htmlNodes.selectedSearchResult;
				while (node) {
					node = node.nextElementSibling;
					if (node && node.classList && node.classList.contains("searchresult")) {
						htmlNodes.selectedSearchResult.classList.remove("selected");
						htmlNodes.selectedSearchResult = node;
						node.classList.add("selected");
						if (!ui.tools.isVisibleDOMElement(node))
							node.scrollIntoView();
						break;
					}
				}
				if (!node)
					window.scrollBy(0, 50);
			} else {
				window.scrollBy(0, 50);
				htmlNodes.inputs.search.blur();
			}
			e.preventDefault();
		} else if (e.keyCode === 38) {       // arrow key up
			if (document.activeElement === htmlNodes.inputs.search) {
				let node = htmlNodes.selectedSearchResult;
				while (node) {
					node = node.previousElementSibling;
					if (node && node.classList && node.classList.contains("searchresult")) {
						htmlNodes.selectedSearchResult.classList.remove("selected");
						htmlNodes.selectedSearchResult = node;
						node.classList.add("selected");
						if (!ui.tools.isVisibleDOMElement(node))
							node.scrollIntoView();
						break;
					}
				}
				if (!node)
					window.scrollBy(0, -50);
			} else {
				window.scrollBy(0, -50);
				htmlNodes.inputs.search.blur();
			}
			e.preventDefault();
		} else if (e.keyCode === 13) {       // enter key
			if (!htmlNodes.selectedSearchResult)
				return listeners.preventPropagation(e);
			
			ui.toggleTeammember(brmt.aliases.parseSetTitle(htmlNodes.selectedSearchResult.firstChild.firstChild.title).subject);
			ui.updateSearchresults(htmlNodes.inputs.search.value);
		} else if ((e.keyCode === 8 && htmlNodes.inputs.search.value.length) || (e.keyCode >= 65 && e.keyCode <= 90))
			htmlNodes.inputs.search.focus();
		return listeners.preventPropagation(e);
	});
};

listeners.initTabpages = function initTabpages () {
	[...document.querySelectorAll('.tabcontainer .tab-links a')].forEach( node => {
		let [, listID, tabID, contentID] = node.id.split('_');
		node.addEventListener('click', e => {
			if (contentID === "hiddentabs") {
				node.parentNode.parentNode.classList.add('reveal-hidden');
				node.parentNode.classList.add('active');
			} else {
				// hide hidden tabs if previously revealed
				node.parentNode.parentNode.classList.remove('reveal-hidden');
				
				// make this node's <li> parent the only active one in its list
				[...node.parentNode.parentNode.childNodes].forEach(
					listNode => listNode.classList && listNode.classList.remove('active')
				);
				node.parentNode.classList.add('active');
				
				// make the corresponding tab the only active one in its list
				[...node.parentNode.parentNode.nextElementSibling.childNodes].forEach(
					tab => tab.classList && tab.classList.remove('active')
				);
				htmlNodes.tabs[listID][tabID].classList.add('active');
				
				if (contentID) {
					// set container class to match contentID so that it can be styled
					for (cID in htmlNodes.tablinks[listID][tabID])
						htmlNodes.tabs[listID][tabID].classList.remove(cID);
					htmlNodes.tabs[listID][tabID].classList.add(contentID);
				}
				if (htmlNodes.tabcontainers[listID].updateContent)
					htmlNodes.tabcontainers[listID].updateContent(listID, tabID, contentID || "");
			}
			
			e.preventDefault();
			return listeners.preventPropagation(e);
		});
	});
	
	htmlNodes.tabcontainers.main.updateContent = function updateContent(listID, tabID, contentID) {
		location.hash = contentID || tabID;
		ui.cache.tab = contentID || ui.cache.tab || "suggestions";
		htmlNodes.divs.builddata.style.display = (contentID === "builddata") ? "block" : "none";
		if (tabID === "dyncontent") {
			if (contentID === "objectinspector") {
				let inspector = project.tools.jsObjectToHtml(project, project.tools.projectdesc, 1);
				htmlNodes.tabs.main.dyncontent.innerHTML = `<div class='objectinspector'>${inspector}</div>`;
				return;
			}
			ui.rebuildThreatlist();
		}
	};
	
	htmlNodes.links.objectinspector.addEventListener('click', e => {
		htmlNodes.tablinks.main.dyncontent.objectinspector.click();
		e.preventDefault();
		return listeners.preventPropagation(e);
	});
};

})();