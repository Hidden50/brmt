(function(){

window.frontend = {};
let cache = frontend.cache = {};
let htmlNodes = frontend.htmlNodes = {};

cache.team = [];
cache.teams = brmt.config.getTeamStorage();

window.onload = function() {
	htmlNodes.register( ...document.querySelectorAll("[id]") );  // register all html nodes that have ids
	
	htmlNodes.textareas.builddata.value = brmt.compendiums.OUcc;
	
	frontend.rebuild();
	frontend.addEventListeners();
};

frontend.rebuild = function rebuild () {
	// read input configuration
	let threatlistmode = htmlNodes.selects.threatlistmode.value;
	
	// calculate results
	let buildData  = cache.buildData  = brmt.builder.stringToBuildData( htmlNodes.textareas.builddata.value );
	let team       = cache.team;
	
	let build      = cache.build      = brmt.buildChecksCompendium(buildData);
	let threatlist = cache.threatlist = brmt.getThreatlist(build, team);
	let iconConfig = cache.iconConfig = brmt.readIconConfig(buildData);
	
	switch (threatlistmode) {
		case "species": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, team, iconConfig);
			frontend.addIconWrapListeners( htmlNodes.divs.threatlist, 'click', frontend.showCompendiumEntry );
			break;
		}
		case "sets": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, team, iconConfig);
			frontend.addIconWrapListeners( htmlNodes.divs.threatlist, 'click', frontend.showCompendiumEntry );
			break;
		}
		case "compendium": {
			htmlNodes.divs.threatlist.innerHTML = brmt.htmloutput.makeCompendium (build, threatlist, team, iconConfig)
			break;
		}
	}
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

frontend.addIconWrapListeners = function addIconWrapListeners (parent, eventType, listener) {
	[...parent.getElementsByClassName("imageWrapper")].forEach(
		imageWrapper => imageWrapper.addEventListener( eventType, () => listener(imageWrapper) )
	);
};

frontend.showCompendiumEntry = function showCompendiumEntry (source, species, set) {
	if (!species)
		[, species, set] = source.title.match(/^(.*) \(([^()]*)\)$/);
	let pokemon = brmt.tools.makePokemonObject(species, set);
	frontend.showPopup(
		htmlNodes.divs.popup,
		source,
		brmt.htmloutput.makeCompendiumEntry(cache.build, pokemon, cache.team, cache.iconConfig)
	);
	frontend.addIconWrapListeners(
		htmlNodes.divs.popup,
		'click',
		frontend.scrollBuilddata
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

frontend.scrollBuilddata = function scrollBuilddata (wrapperNode) {
	// parse the following title: "targetSpecies (targetSet) beats subjectSpecies (subjectSet)"
	let titleRegex = /^([^()]*) \(([^()]*)\)(?: beats ([^()]*) \(([^()]*)\))?$/;
	let [, targetSpecies, targetSet, subjectSpecies, subjectSet] = wrapperNode.title.match(titleRegex);
	
	// check if title was "subjectSpecies (subjectSet)" instead
	if (!subjectSpecies) [subjectSpecies, subjectSet, targetSpecies, targetSet] = [targetSpecies, targetSet, "", ""];
	
	let subject = brmt.tools.makePokemonObject(subjectSpecies, subjectSet);
	let target = brmt.tools.makePokemonObject(targetSpecies, targetSet);
	
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
	});
	htmlNodes.buttons.hidebuilddata.addEventListener('click', () => {
		htmlNodes.divs.builddata.style.display = "none";
		htmlNodes.buttons.showbuilddata.style.display = "block";
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
	htmlNodes.divs.threatlistconfig.addEventListener('mouseleave', () => {
		frontend.rebuild();
	});
	
	// Controls for Team Selection
	htmlNodes.buttons.team.addEventListener('click', () => {
		frontend.showPopup(
			htmlNodes.divs.teamselect,
			htmlNodes.buttons.team
		);
	});
	htmlNodes.divs.teamselect.innerHTML = cache.teams.map( team => {
		let teamHtml = brmt.htmloutput.makeIconGallery(team, team, cache.iconConfig);
		return `<button>${teamHtml}</button>`;
	}).join("");
	htmlNodes.divs.teamselect.childNodes.forEach(
		(node, index) => node.addEventListener('click', () => {
			cache.team = cache.teams[index];
			htmlNodes.buttons.team.innerHTML = brmt.htmloutput.makeIconGallery(cache.team, cache.team, cache.iconConfig);
			frontend.rebuild();
		})
	);
};

})();