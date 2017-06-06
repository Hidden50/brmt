(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let listeners = ui.listeners = {};

listeners.addClassListeners = function addClassListeners (parentNode, className, eventType, listener) {
	// recursively add listeners to all children, and their children, and so on, who have the specified class
	[...parentNode.childNodes].forEach( node => {
		if (node.classList && node.classList.contains("imageWrapper"))
			node.addEventListener( eventType, () => listener(node) );
		addClassListeners (node, className, eventType, listener);
	});
};

listeners.init = function init () {
	// Controls the Build Data textarea
	htmlNodes.buttons.showbuilddata.addEventListener('click', () => {
		htmlNodes.divs.builddata.style.display = "block";
		htmlNodes.buttons.showbuilddata.style.display = "none";
		htmlNodes.buttons.hidebuilddata.style.display = "block";
	});
	htmlNodes.buttons.hidebuilddata.addEventListener('click', () => {
		htmlNodes.divs.builddata.style.display = "none";
		htmlNodes.buttons.showbuilddata.style.display = "block";
		htmlNodes.buttons.hidebuilddata.style.display = "none";
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
			htmlNodes.divs.popup,
			"Object Inspector:<div class='objectinspector'>" + project.tools.jsObjectToHtml(project, 1) + "</div>"
		);
	});
	
	// Controls for the Threatlist
	htmlNodes.buttons.threatlistconfig.addEventListener('click', () => {
		ui.showPopup(
			htmlNodes.buttons.threatlistconfig,
			htmlNodes.divs.threatlistconfig
		);
	});
	[...document.querySelectorAll('input[name="radiogroup_threatlistconfig"]')].forEach(
		radioButton => radioButton.addEventListener('change', ui.rebuildThreatlist)
	);
	
	// Controls for Team Selection
	htmlNodes.buttons.team.addEventListener('click', () => {
		ui.showPopup(
			htmlNodes.buttons.team,
			htmlNodes.divs.teamselect
		);
	});
	htmlNodes.divs.teamselect.innerHTML = ui.cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, ui.cache.build, team, ui.cache.iconConfig);
		return `<button>${teamHtml}</button>`;
	}).join("");
	htmlNodes.divs.teamselect.childNodes.forEach(
		(node, index) => node.addEventListener('click', () => {
			ui.cache.team = ui.cache.teams[index];
			ui.rebuildThreatlist();
		})
	);
	
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
};

})();