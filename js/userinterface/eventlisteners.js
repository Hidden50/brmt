(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let listeners = ui.listeners = {};

listeners.addClassListeners = function addClassListeners (parentNode, className, eventType, listener) {
	// recursively add listeners to all children, and their children, and so on, who have the specified class
	[...parentNode.childNodes].forEach( (node, index) => {
		if (node.classList && node.classList.contains(className))
			node.addEventListener( eventType, () => listener(node, index) );
		addClassListeners(node, className, eventType, listener);
	});
};

listeners.init = function init () {
	// Controls for the Builddata textarea
	htmlNodes.buttons.showbuilddata.addEventListener('click', () => {
		if (htmlNodes.divs.builddata.style.display === "none") {
			htmlNodes.divs.builddata.style.display = "block";
			htmlNodes.buttons.showbuilddata.innerText = "Hide Builddata";
		} else {
			htmlNodes.divs.builddata.style.display = "none";
			htmlNodes.buttons.showbuilddata.innerText = "Show Builddata";
		}
	});
	htmlNodes.buttons.useofficialnames.addEventListener('click', function() {
		htmlNodes.textareas.builddata.value = brmt.builder.buildDataToString(
			brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n", true
		);
	});
	htmlNodes.buttons.usespeciesids.addEventListener('click', function() {
		htmlNodes.textareas.builddata.value = brmt.builder.buildDataToString(
			brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value ), ", ", "\n"
		);
	});
	htmlNodes.buttons.build.addEventListener('click', ui.rebuildThreatlist);
	
	// Controls for the Object Inspector
	htmlNodes.buttons.showobjectinspector.addEventListener('click', () => {
		ui.showPopup(
			htmlNodes.buttons.showobjectinspector,
			htmlNodes.popups.main,
			"Object Inspector:<div class='objectinspector'>" + project.tools.jsObjectToHtml(project, 1) + "</div>"
		);
	});
	
	// Controls for the Threatlist
	htmlNodes.buttons.threatlistconfig.addEventListener('click', () => {
		ui.showPopup(
			htmlNodes.buttons.threatlistconfig,
			htmlNodes.popups.threatlistconfig
		);
	});
	[...document.querySelectorAll('input[name="radiogroup_threatlistconfig"]')].forEach(
		radioButton => radioButton.addEventListener('change', ui.rebuildThreatlist)
	);
	
	// Controls for Team Selection
	htmlNodes.buttons.loadteam.addEventListener('click', () => {
		ui.showPopup(
			htmlNodes.buttons.loadteam,
			htmlNodes.popups.teamselect
		);
	});
	htmlNodes.buttons.clearteam.addEventListener('click', () => {
		ui.cache.team = [];
		ui.rebuildThreatlist();
		ui.rebuildTeams();
	});
	
	// Controls for Compendium selection
	htmlNodes.selects.checkscompendium.addEventListener('change', () =>{
		htmlNodes.textareas.builddata.value = brmt.compendiums[htmlNodes.selects.checkscompendium.value];
		ui.rebuildThreatlist();
		ui.rebuildTeams();
	});
	
	// Controls for Pokemon Search
	htmlNodes.inputs.search.addEventListener('input', () => {
		ui.threatlistFindPokemon(htmlNodes.inputs.search.value);
		if (!htmlNodes.inputs.search.value)
			htmlNodes.inputs.search.blur();
	});
	document.addEventListener('keydown', (e) => {
		if (document.activeElement === htmlNodes.textareas.builddata)
			return;
		
		if (e.keyCode === 40) {              // arrow key up
			window.scrollBy(0, 50)
			htmlNodes.inputs.search.blur();
		} else if (e.keyCode === 38) {       // arrow key down
			window.scrollBy(0, -50)
			htmlNodes.inputs.search.blur();
		} else if (e.keyCode === 13) {       // enter key
			let firstResult = htmlNodes.divs.threatlist.querySelector('.imageWrapper.searchresult');
			if (!firstResult)
				return;
			
			ui.toggleTeammember(brmt.aliases.parseSetTitle(firstResult.title).subject);
			ui.threatlistFindPokemon(htmlNodes.inputs.search.value);
		} else if (e.keyCode === 8 || e.keyCode >= 65 && e.keyCode <= 90)
			htmlNodes.inputs.search.focus();
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
		})
	);
};

})();