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
	// Controls for the Builddata textarea
	htmlNodes.buttons.showbuilddata.addEventListener('click', e => {
		if (htmlNodes.divs.builddata.style.display === "none") {
			htmlNodes.divs.builddata.style.display = "block";
			htmlNodes.buttons.showbuilddata.innerText = "Hide Builddata";
		} else {
			htmlNodes.divs.builddata.style.display = "none";
			htmlNodes.buttons.showbuilddata.innerText = "Show Builddata";
		}
		return listeners.preventPropagation(e);
	});
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
	
	// Controls for the Object Inspector
	htmlNodes.buttons.showobjectinspector.addEventListener('click', e => {
		ui.showPopup(
			htmlNodes.buttons.showobjectinspector,
			htmlNodes.popups.main,
			"Object Inspector:<div class='objectinspector'>" + project.tools.jsObjectToHtml(project, 1) + "</div>"
		);
		return listeners.preventPropagation(e);
	});
	
	// Controls for the Threatlist
	htmlNodes.buttons.threatlistconfig.addEventListener('click', e => {
		ui.showPopup(
			htmlNodes.buttons.threatlistconfig,
			htmlNodes.popups.threatlistconfig
		);
		return listeners.preventPropagation(e);
	});
	[...document.querySelectorAll('input[name="radiogroup_threatlistconfig"]')].forEach(
		radioButton => radioButton.addEventListener('change', e => {
			ui.rebuildThreatlist();
			return listeners.preventPropagation(e);
		})
	);
	
	// Controls for Team Selection
	htmlNodes.buttons.loadteam.addEventListener('click', e => {
		ui.showPopup(
			htmlNodes.buttons.loadteam,
			htmlNodes.popups.teamselect
		);
		return listeners.preventPropagation(e);
	});
	htmlNodes.buttons.clearteam.addEventListener('click', e => {
		ui.cache.team = [];
		ui.rebuildThreatlist();
		ui.rebuildTeams();
		return listeners.preventPropagation(e);
	});
	
	// Controls for Compendium selection
	htmlNodes.selects.checkscompendium.addEventListener('change', e =>{
		htmlNodes.textareas.builddata.value = brmt.compendiums[htmlNodes.selects.checkscompendium.value];
		ui.rebuildThreatlist();
		ui.rebuildTeams();
		return listeners.preventPropagation(e);
	});
	
	// Controls for Pokemon Search
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
		} else if (e.keyCode === 8 || e.keyCode >= 65 && e.keyCode <= 90)
			htmlNodes.inputs.search.focus();
		return listeners.preventPropagation(e);
	});
	
	// Controls for tab pages
	[...document.querySelectorAll('.tabs .tab-links a')].forEach(
		node => node.addEventListener('click', e => {
			[...node.parentNode.parentNode.childNodes].forEach(
				sibling => sibling.classList && sibling.classList.remove('active')
			);
			node.parentNode.classList.add('active');
			ui.cache.threatlistmode = toId(node.title);
			htmlNodes.divs.threatlist.classList.remove("suggestions");
			htmlNodes.divs.threatlist.classList.remove("breakit");
			htmlNodes.divs.threatlist.classList.remove("wallit");
			htmlNodes.divs.threatlist.classList.add(ui.cache.threatlistmode);
			ui.rebuildThreatlist();
			e.preventDefault();
			return listeners.preventPropagation(e);
		})
	);
};

})();