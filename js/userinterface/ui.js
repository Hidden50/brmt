(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let cache = ui.cache = {};

window.onload = ui.init = function init () {
	htmlNodes.register( ...document.querySelectorAll("[id]") );  // register all html nodes that have an id
	
	cache.team = [];
	cache.teams = ui.tools.getTeamStorage();
	
	ui.initCompendium("gen7OU");
	ui.rebuildTeams();
	ui.listeners.init();
	
	let contentID = location.hash && location.hash.substr && location.hash.substr(1);
	if (htmlNodes.tablinks.main.dyncontent[contentID])
		htmlNodes.tablinks.main.dyncontent[contentID].click();
	else if (htmlNodes.tablinks.main[contentID])
		htmlNodes.tablinks.main[contentID].click();
	else ui.rebuildThreatlist();
};

ui.initCompendium = function initCompendium (compTitle) {
	htmlNodes.textareas.builddata.value = brmt.compendiums[compTitle];
	if (!htmlNodes.textareas.builddata.value) console.log("blubb");
	cache.buildData  = brmt.builder.stringToBuildData(htmlNodes.textareas.builddata.value);
	cache.build      = brmt.builder.buildChecksCompendium(cache.buildData);
	cache.iconConfig = brmt.htmloutput.readIconConfig(cache.buildData);
	
	let defaultThreatlist = brmt.teamrater.getThreatlist(cache.build, [], "sets", [10000, 100, 2, -11, -7, -3], ["team", "species", "hashcode", "set"]);
	htmlNodes.divs.searchresults.innerHTML = brmt.htmloutput.makeSetsList(defaultThreatlist, cache.build, cache.team, cache.iconConfig);
	ui.listeners.addClassListeners( htmlNodes.divs.searchresults, "tr", 'click',
		tablerow => ui.toggleTeammember( brmt.aliases.parseSetTitle(tablerow.firstChild.firstChild.title).subject )
	);
};

ui.rebuildThreatlist = function rebuildThreatlist () {
	let params = ui.config.threatlistParameters[ui.cache.tab];
	if (!params)
		return;
	cache.threatlist = brmt.teamrater.getThreatlist(
		cache.build,
		cache[params.rate.teamSource] || [],
		params.rate.threatlistType,
		params.rate.weights,
		params.rate.priorities
	);
	htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput[params.display.method](
		cache.threatlist,
		cache.build,
		cache[params.display.teamSource] || [],
		cache.iconConfig,
		params.display.ratingType
	);
	ui.listeners.addClassListeners(
		htmlNodes.tabs.main.dyncontent,
		"imageWrapper",
		'click',
		ui.threatlistEvents[params.onClickEventType]
	);
	ui.updateSearchresults( htmlNodes.inputs.search.value );
};

ui.rebuildTeams = function rebuildTeams() {
	let teamGallery = brmt.htmloutput.makeIconGallery(cache.team, cache.build, cache.team, cache.iconConfig);
	htmlNodes.divs.team.innerHTML = teamGallery || "(please select from below)";
	ui.listeners.addClassListeners( htmlNodes.divs.team, "imageWrapper", 'click',
		node => ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
	);
	htmlNodes.popups.teamselect.innerHTML = ui.cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, cache.build, team, ui.cache.iconConfig);
		return `<button class="team">${teamHtml}</button>`;
	}).join("");
	ui.listeners.addClassListeners( htmlNodes.popups.teamselect, "team", 'click', (node, index) => {
		ui.cache.team = ui.cache.teams[index];
		ui.rebuildThreatlist();
		ui.rebuildTeams();
	});
};

ui.toggleTeammember = function toggleTeammember (pokemon) {
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
	ui.rebuildThreatlist();
	ui.rebuildTeams();
};

ui.updateSearchresults = function updateSearchresults (searchText) {
	let searchRegex = new RegExp(searchText, 'i');
	
	if (searchText.length || document.activeElement === htmlNodes.inputs.search) {
		// resize main div and display search result div
		htmlNodes.divs.main.style["margin-right"] = "240px";
		htmlNodes.divs.searchresults.style.display = "block";
	} else {
		htmlNodes.divs.main.style["margin-right"] = "0px";
		htmlNodes.divs.searchresults.style.display = "none";
	}
	
	htmlNodes.selectedSearchResult = null;
	// select which search results to show
	let firstMatch = true;
	[...htmlNodes.divs.searchresults.firstChild.firstChild.childNodes].forEach( tablerow => {
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
	[...htmlNodes.tabs.main.dyncontent.childNodes].forEach( childNode => {
		if (!childNode.classList || !childNode.classList.contains("imageWrapper"))
			return;
		if (searchText && childNode.title.match(searchRegex))
			childNode.classList.add("searchresult");
		else childNode.classList.remove("searchresult");
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