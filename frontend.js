(function(){

window.frontend = {};
let cache = frontend.cache = {};
let htmlNodes = frontend.htmlNodes = {};

cache.team = [];
cache.teams = brmt.config.getTeamStorage();

window.onload = function() {
	htmlNodes.register( ...document.querySelectorAll("[id]") );  // register all html nodes that have an id
	
	htmlNodes.textareas.builddata.value = brmt.compendiums.OUcc;
	
	frontend.rebuild();
	frontend.addEventListeners();
};

frontend.rebuild = function rebuild () {
	// read input configuration
	let threatlistmode = document.querySelector('input[name="radiogroup_threatlistconfig"]:checked').value;
	
	// calculate results
	let buildData  = cache.buildData  = brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value );
	let team       = cache.team;
	
	let build      = cache.build      = brmt.buildChecksCompendium(buildData);
	let threatlist = cache.threatlist = brmt.getThreatlist(build, team);
	let iconConfig = cache.iconConfig = brmt.readIconConfig(buildData);
	
	let teamGallery = brmt.htmloutput.makeIconGallery(cache.team, cache.build, cache.team, cache.iconConfig);
	htmlNodes.buttons.team.innerHTML = teamGallery || "(press to select)";
	
	switch (threatlistmode) {
		case "species": {
			// todo: implement species threatlist
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
	frontend.markSearchResults();
	frontend.addClassListeners( htmlNodes.divs.threatlist, "imageWrapper", 'click', frontend.showCompendiumEntry );
};

frontend.markSearchResults = function markSearchResults () {
	let searchText = htmlNodes.inputs.search.value;
	let searchRegex = new RegExp(searchText, 'i');
	[...htmlNodes.divs.threatlist.childNodes].forEach( childNode => {
		if (!childNode.classList || !childNode.classList.contains("imageWrapper"))
			return;
		if (searchText && childNode.title.match(searchRegex))
			childNode.classList.add("searchresult");
		else childNode.classList.remove("searchresult");
	});
};

htmlNodes.register = function register (node, ...rest) {
	if (typeof node === "string")
		node = document.getElementById(node);
	
	let tagClass = node.tagName.toLowerCase();
	if (tagClass.length > 1)
		tagClass += "s";      // collection names make more sense in plural: htmlNodes.buttons.buttonxyz, not htmlNodes.button.buttonxyz
	let name = node.id.substr(1 + node.id.indexOf("_"));
	
	htmlNodes[tagClass] = htmlNodes[tagClass] || {};
	htmlNodes[tagClass][name] = node;
	
	if (rest.length)
		htmlNodes.register(...rest);
	return node;
};

frontend.appendChildnode = function appendChildnode (parentNode, code) {
	let container = document.createElement("div");
	container.innerHTML = code;
	parentNode.appendChild(container);
};

frontend.addClassListeners = function addClassListeners (parentNode, className, eventType, listener) {
	[...parentNode.childNodes].forEach( node => {
		if (node.classList && node.classList.contains("imageWrapper"))
			node.addEventListener( eventType, () => listener(node) );
		addClassListeners (node, className, eventType, listener);
	});
};

frontend.showCompendiumEntry = function showCompendiumEntry (caller, pokemon) {
	if (!pokemon) {
		let {subject, target} = frontend.parseIconWrapperTitle(caller.title);
		if (target.species && !caller.parentNode.className.endsWith("to"))
			pokemon = target;
		else pokemon = subject;
	}
	
	frontend.showPopup(
		htmlNodes.divs.popup,
		caller,
		brmt.htmloutput.makeCompendiumEntry(pokemon, cache.build, cache.team, cache.iconConfig)
	);
	frontend.addClassListeners(
		htmlNodes.divs.popup,
		"imageWrapper",
		'click',
		frontend.popupPokemonClick
	);
};

frontend.showPopup = function showPopup (container, sender, contentHtml) {
	// sender: Attempts to position the popup above this element.
	//         We can't use mouse coordinates, because the popup can also be spawned using the keyboard
	let XOffset = sender.offsetLeft, YOffset = sender.offsetTop;
	if (container.contains(sender)) {
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

frontend.parseIconWrapperTitle = function parseIconWrapperTitle (title) {
	// parse the following title: "targetSpecies (targetSet) beats subjectSpecies (subjectSet)"
	let titleRegex = /^([^()]*) \(([^()]*)\)(?: beats ([^()]*) \(([^()]*)\))?$/;
	let [, targetSpecies, targetSet, subjectSpecies, subjectSet] = title.match(titleRegex);
	
	// check if title was "subjectSpecies (subjectSet)" instead
	if (!subjectSpecies) [subjectSpecies, subjectSet, targetSpecies, targetSet] = [targetSpecies, targetSet, "", ""];
	
	let result = {};
	result.subject = brmt.tools.makePokemonObject(subjectSpecies, subjectSet);
	result.target = brmt.tools.makePokemonObject(targetSpecies, targetSet);
	
	return result;
};

frontend.popupPokemonClick = function popupPokemonClick (wrapperNode) {
	if (htmlNodes.divs.builddata.style.display === "block")
		return frontend.scrollBuilddata(wrapperNode);
	return frontend.toggleTeammember(wrapperNode);
};

frontend.toggleTeammember = function toggleTeammember (wrapperNode) {
	let {subject, target} = frontend.parseIconWrapperTitle(wrapperNode.title);
	
	let pokemon;
	if (target.species && !wrapperNode.parentNode.className.endsWith("to"))
		pokemon = target;
	else pokemon = subject;
	
	let deleted;
	cache.team = cache.team.filter( teamMember => {
		if (teamMember.species === pokemon.species && teamMember.set === pokemon.set) {
			deleted = true;
			return false;
		}
		return true;
	});
	if (!deleted) cache.team.push(pokemon);
	frontend.rebuild();
};

frontend.scrollBuilddata = function scrollBuilddata (wrapperNode) {
	let {subject, target} = frontend.parseIconWrapperTitle(wrapperNode.title);
	
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
	
	let find = frontend.textareaFindText( document.getElementById("textarea_builddata"), new RegExp(lineRegex, 'i') );
	if (!find) return;
	let find2 = frontend.textareaFindText( document.getElementById("textarea_builddata"), new RegExp(entryRegex, 'i') );
};

frontend.textareaFindText = function textareaFindText (ta, regex) {
	let offset = ta.selectionEnd;
	let match = ta.value.substr(offset).match(regex);
	if (!match) {
		// reached the end. loop around and try again..
		offset = 0;
		match = ta.value.match(regex);
	}
	if (!match) return false;  // no results found
	ta.scrollTop = 0;
	let selStart = offset + match.index;
	let selEnd = offset + match.index + match[0].length;
	let temp = ta.value;
	// scroll to position
	ta.focus();
	ta.value = temp.substring(0, selStart);
	ta.scrollTop = selStart;
	ta.value = temp;
	// mark result for user
	ta.setSelectionRange(selStart, selEnd);
	return true;
};

frontend.addEventListeners = function addEventListeners () {
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
	htmlNodes.buttons.build.addEventListener('click', frontend.rebuild);
	
	// Controls for the Object Inspector
	htmlNodes.buttons.showobjectinspector.addEventListener('click', () => {
		frontend.showPopup(
			htmlNodes.divs.popup,
			htmlNodes.buttons.showobjectinspector,
			"Object Inspector:<div class='objectinspector'>" + brmt.tools.jsObjectToHtml({ "frontend": frontend, "brmt": brmt }) + "</div>"
		);
	});
	
	// Controls for the Threatlist
	htmlNodes.buttons.threatlistconfig.addEventListener('click', () => {
		frontend.showPopup(
			htmlNodes.divs.threatlistconfig,
			htmlNodes.buttons.threatlistconfig
		);
	});
	[...document.querySelectorAll('input[name="radiogroup_threatlistconfig"]')].forEach(
		radioButton => radioButton.addEventListener('change', () => {
			frontend.rebuild();
		})
	);
	
	// Controls for Team Selection
	htmlNodes.buttons.team.addEventListener('click', () => {
		frontend.showPopup(
			htmlNodes.divs.teamselect,
			htmlNodes.buttons.team
		);
	});
	htmlNodes.divs.teamselect.innerHTML = cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, cache.build, team, cache.iconConfig);
		return `<button>${teamHtml}</button>`;
	}).join("");
	htmlNodes.divs.teamselect.childNodes.forEach(
		(node, index) => node.addEventListener('click', () => {
			cache.team = cache.teams[index];
			frontend.rebuild();
		})
	);
	
	// Controls for Pokemon Search
	htmlNodes.inputs.search.addEventListener('input', () => {
		frontend.markSearchResults();
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
			
			frontend.toggleTeammember(firstResult);
			htmlNodes.inputs.search.value = "";
			frontend.markSearchResults();
		} else
			htmlNodes.inputs.search.focus();
	});
};

})();