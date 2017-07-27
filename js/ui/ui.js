(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let cache = ui.cache = {};

window.onload = ui.init = function init () {
	htmlNodes.register( ...document.querySelectorAll("[id]") );                          // register all html nodes that have an id
	
	htmlNodes.tabcontents.main.about.innerHTML = ui.config.about;                        // load some tab content
	htmlNodes.tabcontents.main.faq.innerHTML = ui.config.faq;
	htmlNodes.register( ...htmlNodes.tabcontents.main.about.querySelectorAll("[id]") );
	htmlNodes.register( ...htmlNodes.tabcontents.main.faq.querySelectorAll("[id]") );
	
	cache.team = [];
	cache.teams = ui.tools.getTeamStorage();
	
	ui.initCompendium("gen7OU");
	ui.rebuildTeams();
	ui.listeners.init();
	
	ui.cache.generatedLists = [];
	let tabID = location.hash && location.hash.substr && location.hash.substr(1);
	(htmlNodes.tabs.main[tabID] || htmlNodes.tabs.main.about).firstChild.click();
};

ui.initCompendium = function initCompendium (compTitle) {
	if (compTitle)
		htmlNodes.textareas.builddata.value = ui.cache.compendiums[compTitle];
	cache.buildData  = brmt.builder.stringToBuildData(htmlNodes.textareas.builddata.value);
	cache.build      = brmt.builder.buildChecksCompendium(cache.buildData);
	cache.setInfo    = brmt.teamrater.readSetInfo(cache.buildData);
	cache.iconConfig = brmt.htmloutput.readIconConfig(cache.buildData);
	
	let defaultThreatlist = brmt.teamrater.getThreatlist(cache.build, cache.setInfo, [], "sets", [10000, 100, 2, -11, -7, -3], ["viability", "team", "species", "hashcode", "set"]);
	htmlNodes.divs.searchresults.innerHTML = brmt.htmloutput.makeSetsList(defaultThreatlist, cache.build, cache.team, cache.iconConfig);
	ui.listeners.addClassListeners( htmlNodes.divs.searchresults, "tr", 'click',
		tablerow => ui.toggleTeammember( brmt.aliases.parseSetTitle(tablerow.firstChild.firstChild.title).subject )
	);
};

ui.invalidateThreatlists = function invalidateThreatlists (arg) {
	ui.cache.generatedLists = ui.cache.generatedLists.filter( tabID => {
		let params = ui.config.threatlistParameters[tabID];
		if (arg === "team") {
			if (params.rate.teamSource !== "team" && params.display.teamSource !== "team")
				return true;
		}
		htmlNodes.tabcontents.main[tabID].innerHTML = "";
	});
	if (ui.config.threatlistParameters[ui.cache.tabID])
		ui.rebuildThreatlist();
};

ui.rebuildThreatlist = function rebuildThreatlist () {
	if (ui.cache.generatedLists.includes(ui.cache.tabID)) {
		ui.updateSearchresults();
		return;                                                   // output does not need updating
	}
	let params = ui.config.threatlistParameters[ui.cache.tabID];
	if (!params)
		return;                                                   // active tab does not have a threat list
	cache.threatlist = brmt.teamrater.getThreatlist(
		cache.build,
		cache.setInfo,
		cache[params.rate.teamSource] || [],
		params.rate.threatlistType,
		params.rate.weights,
		params.rate.priorities
	);
	htmlNodes.tabcontents.main[ui.cache.tabID].innerHTML = brmt.htmloutput[params.display.method](
		cache.threatlist,
		cache.build,
		cache[params.display.teamSource] || [],
		cache.iconConfig,
		params.display.ratingType
	);
	ui.listeners.addClassListeners(
		htmlNodes.tabcontents.main[ui.cache.tabID],
		"imageWrapper",
		'click',
		ui.threatlistEvents[params.onClickEventType]
	);
	ui.cache.generatedLists.push(ui.cache.tabID);
	ui.updateSearchresults();
};

ui.rebuildTeams = function rebuildTeams() {
	let teamGallery = brmt.htmloutput.makeIconGallery(cache.team, cache.build, cache.team, cache.iconConfig);
	htmlNodes.divs.team.innerHTML = teamGallery || "(please select team members)";
	ui.listeners.addClassListeners( htmlNodes.divs.team, "imageWrapper", 'click',
		node => ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
	);
	htmlNodes.popups.teamselect.innerHTML = ui.cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, cache.build, team, ui.cache.iconConfig);
		return `<button class="team">${teamHtml}</button>`;
	}).join("");
	ui.listeners.addClassListeners( htmlNodes.popups.teamselect, "team", 'click', (node, index) => {
		ui.cache.team = ui.cache.teams[index];
		ui.invalidateThreatlists("team");
		ui.rebuildTeams();
	});
};

ui.toggleTeammember = function toggleTeammember (pokemon) {
	if (pokemon.set === "species") {
		let onTeam = false;
		for (teamMember of ui.cache.team) {
			if (teamMember.species === pokemon.species) {
				onTeam = true;
				pokemon.set = teamMember.set;
				break;
			}
		}
		if (!onTeam) {
			let search = brmt.aliases.getOfficialname(pokemon.species);
			if (htmlNodes.inputs.search.value !== search) {
				htmlNodes.inputs.search.value = search;
				ui.updateSearchresults();
			} else {
				htmlNodes.inputs.search.value = "";
				ui.updateSearchresults();
			}
			return;
		}
	}
	let deleted;
	cache.team = cache.team.filter( teamMember => {
		if (teamMember.species === pokemon.species && teamMember.set === pokemon.set) {
			deleted = true;
			return false;
		}
		return true;
	});
	if (!deleted) cache.team.push(pokemon);
	htmlNodes.inputs.search.value = "";
	htmlNodes.inputs.search.blur();
	ui.invalidateThreatlists("team");
	ui.rebuildTeams();
};

ui.updateSearchresults = function updateSearchresults (searchText) {
	if (searchText === undefined)
		searchText = htmlNodes.inputs.search.value;
	
	if (searchText.length || document.activeElement === htmlNodes.inputs.search) {
		htmlNodes.divs.searchresults.style.display = "block";
		htmlNodes.labels.search.innerText = "Select a set";
	} else {
		htmlNodes.divs.searchresults.style.display = "none";
		htmlNodes.labels.search.innerText = "Search";
	}
	
	let searchRegex;
	try {
		searchRegex = new RegExp(searchText, 'i');
	} catch (e) {
		if (e instanceof SyntaxError)
			searchRegex = new RegExp(searchText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i');
	}
	
	htmlNodes.selectedSearchResult = null;
	// select which search results to show
	let firstMatch = true;
	[...htmlNodes.divs.searchresults.firstElementChild.firstChild.childNodes].forEach( tablerow => {
		if (tablerow.firstChild.firstChild.title.match(searchRegex)) {
			tablerow.classList.add("searchresult");
			if (tablerow.firstChild.firstChild.classList.contains("onteam"))
				tablerow.classList.add("onteam");
			else tablerow.classList.remove("onteam");
			if (firstMatch) {
				htmlNodes.selectedSearchResult = tablerow;
				tablerow.classList.add("selected");
				firstMatch = false;
			} else tablerow.classList.remove("selected");
		} else {
			tablerow.classList.remove("searchresult");
		}
	});
	
	// mark results in the threatlist
	[...htmlNodes.tabcontents.main[ui.cache.tabID].childNodes].forEach( childNode => {
		if (childNode.classList && childNode.classList.contains("imageWrapper")) {
			if (searchText && childNode.title.match(searchRegex))
				childNode.classList.add("searchresult");
			else childNode.classList.remove("searchresult");
		}
	});
};

ui.scrollBuilddataFindEntry = function scrollBuilddataFindEntry (subject, target) {
	let searchword  = subject.species;
	let searchword2 = target.species;
	if (brmt.aliases.officialnames[subject.species])
		searchword += `|${brmt.aliases.officialnames[subject.species]}`;
	searchword = `(?:${searchword})[^,\\n]*\\|${subject.set}(?=[,|])`;
	if (searchword2) {
		if (brmt.aliases.officialnames[target.species])
			searchword2 += `|${brmt.aliases.officialnames[target.species]}`;
		searchword2 = `(?:${searchword2})[^,\\n]*\\|${target.set}(?=[,|\\n])`;
	}
	let lineRegex = `(?:^|\\n)(?=${searchword}` + (!searchword2 ? `` : `[^\\n]*${searchword2}`) + `)`;
	let entryRegex = searchword2 || searchword;
	
	let find = ui.tools.scrollTextareaFindText( htmlNodes.textareas.builddata, new RegExp(lineRegex, 'i') );
	if (!find) return;
	let find2 = ui.tools.scrollTextareaFindText( htmlNodes.textareas.builddata, new RegExp(entryRegex, 'i') );
};

ui.showHelp = function showHelp (id) {
	if (htmlNodes.tabcontents.main.about.classList.contains('active')) {
		if (htmlNodes.sliders.about[id]) {
			[...htmlNodes.tabcontents.main.about.childNodes].forEach(
				slider => slider.classList && slider.classList.remove('active')
			);
			htmlNodes.sliders.about[id].classList.add('active');
		}
	}
}

ui.showEntry = function showEntry (caller, pokemon) {
	if (!pokemon) {
		let {subject, target} = brmt.aliases.parseSetTitle(caller.title);
		if (target.species && !caller.parentNode.className.endsWith("to"))
			pokemon = target;
		else pokemon = subject;
	}
	
	ui.showPopup(
		caller,
		htmlNodes.popups.main,
		brmt.htmloutput.makeCompendiumEntry(pokemon, cache.build, cache.team, cache.iconConfig)
	);
	ui.listeners.addClassListeners( htmlNodes.popups.main, "imageWrapper", 'click',
		wrapperNode => {
		// add team member, or reveal build data if the user is editing it
			let {subject, target} = brmt.aliases.parseSetTitle(wrapperNode.title);
			
			if (htmlNodes.divs.builddata.style.display !== "none")
				return ui.scrollBuilddataFindEntry(subject, target);
			
			// clicking a pokemon in an inverse mode means we pass the subject instead of the target
			if (target.species && !wrapperNode.parentNode.className.endsWith("to"))
				return ui.toggleTeammember(target);
			return ui.toggleTeammember(subject);
		}
	);
};

ui.showPopup = function showPopup (caller, container, contentHtml) {
	// caller: Attempts to position the popup over the caller
	//         We can't use mouse coordinates, because the popup can also be spawned using the keyboard
	let XOffset = caller.offsetLeft, YOffset = caller.offsetTop;
	if (container.contains(caller)) {
		XOffset += container.offsetLeft;  // adjustment for relative position inside a popup
		YOffset += container.offsetTop;
	}
	if (contentHtml)
		container.innerHTML = contentHtml;
	container.style.display = 'block';
	
	container.style.right = '0px';
	container.style.right = Math.max(container.offsetLeft - XOffset, 0) + 'px';
	
	let maxTop = window.pageYOffset + window.innerHeight - container.offsetHeight - 15;
	container.style.top = maxTop + 'px';
	container.style.top = Math.max(0, maxTop - Math.max(0, container.offsetTop - YOffset)) + 'px';
	container.focus();
};

ui.threatlistEvents = {};
ui.threatlistEvents.showEntry                = node => ui.showEntry(node);
ui.threatlistEvents.toggleTeammember         = node => ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject );
ui.threatlistEvents.scrollBuilddataFindEntry = node => {
	ui.showEntry(node);
	let {subject, target} = brmt.aliases.parseSetTitle(node.title);
	ui.scrollBuilddataFindEntry(subject, target);
};

})();