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
		ui.initCompendium();
		ui.invalidateThreatlists();
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
		ui.invalidateThreatlists("team");
		return listeners.preventPropagation(e);
	});
};

listeners.initCompendiumSelector = function initCompendiumSelector () {
	htmlNodes.selects.checkscompendium.addEventListener('change', e =>{
		ui.initCompendium(htmlNodes.selects.checkscompendium.value);
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
	document.body.addEventListener('click', e => {
		// using htmlNodes.inputs.search -> on:'blur' with  would trigger when clicking on search results
		// so we are using on:'click' with document.body instead
		htmlNodes.inputs.search.value = "";
		ui.updateSearchresults();
		return listeners.preventPropagation(e);
	});
	document.addEventListener('keydown', e => {
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
		
		// enter key
		if (e.keyCode === 13) {
			if (!htmlNodes.selectedSearchResult)
				return listeners.preventPropagation(e);
			
			ui.toggleTeammember(brmt.aliases.parseSetTitle(htmlNodes.selectedSearchResult.firstChild.firstChild.title).subject);
			ui.updateSearchresults();
			return listeners.preventPropagation(e);
		}
		
		if ((e.keyCode === 8 && htmlNodes.inputs.search.value.length) || (e.keyCode >= 65 && e.keyCode <= 90))
			htmlNodes.inputs.search.focus();
		return listeners.preventPropagation(e);
	});
};

listeners.initTabpages = function initTabpages () {
	[...document.querySelectorAll('.tab-container li')].forEach( tab => {
		let [, listID, tabID] = tab.id.split('_');
		tab.addEventListener('click', e => {
			if (tab.classList) {
				if (tab.classList.contains("reveal")) {
					tab.parentNode.classList.toggle('reveal');
					e.preventDefault();
					return listeners.preventPropagation(e);
				}
				if (tab.classList.contains("hidden"))
					tab.parentNode.classList.add('reveal');
			}
			
			[...tab.parentNode.childNodes].forEach(
				listNode => listNode.classList && listNode.classList.remove('active')          // make all tabs inactive
			);
			tab.classList.add('active');                                                       // make selected tab active
			
			[...tab.parentNode.parentNode.querySelectorAll('.tab-content .content')].forEach(
				content => content.classList && content.classList.remove('active')             // make all tabcontents inactive
			);
			if (htmlNodes.tabcontents[listID] && htmlNodes.tabcontents[listID][tabID])
				htmlNodes.tabcontents[listID][tabID].classList.add('active');                  // make selected tabcontent active
			
			if (htmlNodes.tabcontents[listID] && htmlNodes.tabcontents[listID].updateContent)
				htmlNodes.tabcontents[listID].updateContent(listID, tabID);
			
			e.preventDefault();
			return listeners.preventPropagation(e);
		});
	});
	htmlNodes.tabcontents.main.updateContent = function updateContent(listID, tabID) {
		location.hash = ui.cache.tabID = tabID;
		htmlNodes.divs.builddata.style.display = (tabID === "builddata") ? "block" : "none";
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

})();