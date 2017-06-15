(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let cache = ui.cache = {};

cache.team = [];
cache.teams = brmt.config.getTeamStorage();

window.onload = ui.init = function init () {
	htmlNodes.register( ...document.querySelectorAll("[id]") );  // register all html nodes that have an id
	htmlNodes.textareas.builddata.value = brmt.compendiums.gen7OU;
	
	ui.listeners.init();
	ui.rebuildThreatlist("suggestions");
	ui.rebuildTeams();
	
	let contentID = location.hash && location.hash.substr && location.hash.substr(1);
	if (htmlNodes.tablinks.main.dyncontent[contentID])
		htmlNodes.tablinks.main.dyncontent[contentID].click();
};

ui.rebuildThreatlist = function rebuildThreatlist (contentID) {
	if (contentID === "builddata")
		htmlNodes.divs.builddata.style.display = "block";
	else {
		htmlNodes.divs.builddata.style.display = "none";
		if (contentID === "")
			return;
	}
	
	ui.cache.threatlistmode = contentID || ui.cache.threatlistmode;
	
	let buildData  = cache.buildData  = brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value );
	let build      = cache.build      = brmt.buildChecksCompendium(buildData);
	let iconConfig = cache.iconConfig = brmt.readIconConfig(buildData);
	let team       = cache.team;
	
	brmt.config.weights  = [10000, 100, 2, -11, -7, -3];
	let defaultThreatlist = brmt.getThreatlist(build, [], "sets", ["team", "species", "hashcode", "set"]);
	htmlNodes.divs.searchresults.innerHTML = brmt.htmloutput.makeSetsList(defaultThreatlist, build, team, iconConfig);
	// add listeners for clicking on search results
	ui.listeners.addClassListeners( htmlNodes.divs.searchresults, "tr", 'click',
		tablerow => ui.toggleTeammember( brmt.aliases.parseSetTitle(tablerow.firstChild.firstChild.title).subject )
	);
	ui.updateSearchresults(htmlNodes.inputs.search.value);
	
	let threatlist, threatlisttype;
	switch (ui.cache.threatlistmode) {
		case "suggestions": {
			threatlisttype = "set";
			brmt.config.weights = [10000, 100, 2, -11, -7, -3];
			threatlist = cache.threatlist = brmt.getThreatlist(build, [], "sets", ["team", "species", "hashcode", "set"]);
			htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, team, iconConfig, "team");
			ui.listeners.addClassListeners( htmlNodes.tabs.main.dyncontent, "imageWrapper", 'click', node =>
				ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
			);
			break;
		}
		case "breakit": {
			threatlisttype = "set";
			brmt.config.weights = [10000, 100, 2, -11, -7, -3];
			threatlist = cache.threatlist = brmt.getThreatlist(build, team, threatlisttype, ["team", "species", "hashcode", "set"]);
			htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, team, iconConfig, "team");
			ui.listeners.addClassListeners( htmlNodes.tabs.main.dyncontent, "imageWrapper", 'click', node => ui.showEntry(node) );
			break;
		}
		case "wallit": {
			threatlisttype = "set";
			brmt.config.weights = [    0,   0, 0, -11, -7, -3];
			threatlist = cache.threatlist = brmt.getThreatlist(build, team, threatlisttype, ["team", "species", "hashcode", "set"]);
			htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, team, iconConfig, "team");
			ui.listeners.addClassListeners( htmlNodes.tabs.main.dyncontent, "imageWrapper", 'click', node => ui.showEntry(node) );
			break;
		}
		case "compendium": {
			threatlisttype = "set";
			brmt.config.weights = [10000, 100, 2, -11, -7, -3];
			threatlist = cache.threatlist = brmt.getThreatlist(build, [], threatlisttype, ["team", "species", "hashcode", "set"]);
			htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput.makeCompendium (threatlist, build, [], iconConfig);
			ui.listeners.addClassListeners( htmlNodes.tabs.main.dyncontent, "imageWrapper", 'click', node => ui.showEntry(node) );
			break;
		}
		case "builddata": {
			threatlisttype = "set";
			brmt.config.weights = [10000, 100, 2, -11, -7, -3];
			threatlist = cache.threatlist = brmt.getThreatlist(build, [], "sets", ["species", "hashcode", "set"]);
			htmlNodes.tabs.main.dyncontent.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, [], iconConfig, "species");
			ui.listeners.addClassListeners( htmlNodes.tabs.main.dyncontent, "imageWrapper", 'click', node => {
				ui.showEntry(node);
				let {subject, target} = brmt.aliases.parseSetTitle(node.title);
				ui.scrollBuilddataFindEntry(subject, target);
			});
			htmlNodes.divs.builddata.style.display = "block";
			break;
		}
		case "objectinspector": {
			htmlNodes.tabs.main.dyncontent.innerHTML =
				"<div class='objectinspector'>" + project.tools.jsObjectToHtml(project, project.tools.projectdesc, 1) + "</div>";
			
		}
	}
};

ui.rebuildTeams = function rebuildTeams() {
	let teamGallery = brmt.htmloutput.makeIconGallery(cache.team, cache.build, cache.team, cache.iconConfig);
	htmlNodes.divs.team.innerHTML = teamGallery || "(please select from below)";
	ui.listeners.addClassListeners( htmlNodes.divs.team, "imageWrapper", 'click',
		node => ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
	);
	htmlNodes.popups.teamselect.innerHTML = ui.cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, ui.cache.build, team, ui.cache.iconConfig);
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

})();