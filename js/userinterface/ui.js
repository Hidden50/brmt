(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let cache = ui.cache = {};

cache.team = [];
cache.teams = brmt.config.getTeamStorage();

window.onload = ui.init = function init () {
	htmlNodes.register( ...document.querySelectorAll("[id]") );  // register all html nodes that have an id
	
	htmlNodes.textareas.builddata.value = brmt.compendiums.gen7OU;
	ui.cache.threatlistmode = "suggestions";
	
	ui.rebuildThreatlist();
	ui.rebuildTeams();
	ui.listeners.init();
};

ui.rebuildThreatlist = function rebuildThreatlist () {
	// read input configuration
	let threatlisttype = document.querySelector('input[name="radiogroup_threatlistconfig"]:checked').value;
	
	if (ui.cache.threatlistmode === "wallit")
		brmt.config.weights = [    0,   0, 0, -11, -7, -3];
	else
		brmt.config.weights = [10000, 100, 2, -11, -7, -3];
	
	// calculate results
	let buildData  = cache.buildData  = brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value );
	let team       = cache.team;
	
	let build      = cache.build      = brmt.buildChecksCompendium(buildData);
	let threatlist = cache.threatlist = brmt.getThreatlist(build, team, threatlisttype);
	let iconConfig = cache.iconConfig = brmt.readIconConfig(buildData);
	
	switch (threatlisttype) {
		case "species": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, team, iconConfig);
			break;
		}
		case "sets": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, build, team, iconConfig);
			break;
		}
		case "compendium": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeCompendium (threatlist, build, team, iconConfig);
			break;
		}
	}
	ui.threatlistFindPokemon(htmlNodes.inputs.search.value);
	if (ui.cache.threatlistmode === "suggestions") {
		ui.listeners.addClassListeners( htmlNodes.divs.threatlist, "imageWrapper", 'click', node =>
			ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
		);
	} else {
		ui.listeners.addClassListeners( htmlNodes.divs.threatlist, "imageWrapper", 'click', node => ui.showEntry(node) );
	}
};

ui.rebuildTeams = function rebuildTeams() {
	let teamGallery = brmt.htmloutput.makeIconGallery(cache.team, cache.build, cache.team, cache.iconConfig);
	htmlNodes.divs.team.innerHTML = teamGallery || "(please select from below)";
	ui.listeners.addClassListeners( htmlNodes.divs.team, "imageWrapper", 'click',
		node => ui.toggleTeammember( brmt.aliases.parseSetTitle(node.title).subject )
	);
	htmlNodes.divs.teamselect.innerHTML = ui.cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, ui.cache.build, team, ui.cache.iconConfig);
		return `<button class="team">${teamHtml}</button>`;
	}).join("");
	ui.listeners.addClassListeners( htmlNodes.divs.teamselect, "team", 'click', (node, index) => {
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

ui.threatlistFindPokemon = function threatlistFindPokemon (searchText) {
	let searchRegex = new RegExp(searchText, 'i');
	[...htmlNodes.divs.threatlist.childNodes].forEach( childNode => {
		if (!childNode.classList || !childNode.classList.contains("imageWrapper"))
			return;
		if (searchText && childNode.title.match(searchRegex))
			childNode.classList.add("searchresult");
		else childNode.classList.remove("searchresult");
	});
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
		htmlNodes.divs.popup,
		brmt.htmloutput.makeCompendiumEntry(pokemon, cache.build, cache.team, cache.iconConfig)
	);
	ui.listeners.addClassListeners( htmlNodes.divs.popup, "imageWrapper", 'click',
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