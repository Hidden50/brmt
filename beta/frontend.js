(function(){

window.frontend = {};
frontend.cache = {};

window.onload = function() {
	let dev = document.getElementById("dev");
	let showdev = document.getElementById("showdev");
	let taBuilddata = document.getElementById("textarea_builddata");
	let btnBuild = document.getElementById("build");
	let output = document.getElementById("output");
	
	taBuilddata.value = brmt.compendiums.OUcc;
	
	showdev.addEventListener('click', () => {
		if (dev.style.display === "block") {
			dev.style.display = "none";
			showdev.innerText = "Show Builddata";
		} else {
			dev.style.display = "block";
			showdev.innerText = "Hide Builddata";
		}
	});
	
	document.getElementById("useofficialnames").addEventListener('click', function() {
		taBuilddata.value = brmt.builder.buildDataToString( taBuilddata.value.split(/\r?\n/g).map( line => line.split(/ *, */) ), ", ", "\n", true );
	});
	document.getElementById("usespeciesid").addEventListener('click', function() {
		taBuilddata.value = brmt.builder.buildDataToString( taBuilddata.value.split(/\r?\n/g).map( line => line.split(/ *, */) ), ", ", "\n" );
	});
	
	
	btnBuild.addEventListener('click', function buildBtnPress() {
		let buildData  = frontend.cache.buildData  = taBuilddata.value.split(/\r?\n/g).map( line => line.split(/ *, */) );
		let team       = frontend.cache.team       = [];
		
		let build      = frontend.cache.build      = brmt.buildChecksCompendium(buildData);
		let threatlist = frontend.cache.threatlist = brmt.getThreatlist(build, []);
		let iconConfig = frontend.cache.iconConfig = brmt.readIconConfig(buildData);
		
		frontend.appendChildnode( document.body, brmt.tools.jsObjectToHtml(threatlist) );
		
		output.innerHTML = brmt.htmloutput.makeIconGallery(threatlist, team, iconConfig);
		frontend.addIconWrapListeners( output, 'click', frontend.addPopup );
//		document.getElementById("team").innerHTML = Object.keys(team).map(species =>
//			Object.keys(window.team[species]).map(set =>
//				window.brmtIcon( window.compendiums.OUcc, `${species} (${set})`, species, set )
//			).join("")
//		).join("");
	});
	btnBuild.click();
}

frontend.appendChildnode = function appendHtml (parentNode, code) {
	let container = document.createElement("div");
	container.innerHTML = code;
	parentNode.appendChild(container);
};

frontend.addIconWrapListeners = function addIconWrapListeners (parent, eventType, listener) {
	if (typeof parent === "string")
		parent = document.getElementById(parent);
	[...parent.getElementsByClassName("imageWrapper")].forEach(
		imageWrapper => imageWrapper.addEventListener( eventType, () => listener(imageWrapper) )
	);
};

frontend.addPopup = function addPopup (source, species, set) {
	if (!species)
		[, species, set] = source.title.match(/^(.*) \(([^()]*)\)$/);
	let pokemon = brmt.tools.makePokemonObject(species, set);
	frontend.showPopout(
		"onclickinfo_popout",
		source,
		brmt.htmloutput.makeCompendiumEntry(frontend.cache.build, pokemon, frontend.cache.team, frontend.cache.iconConfig)
	);
	frontend.addIconWrapListeners(
		"onclickinfo_popout",
		'click',
		frontend.scrollBuilddata
	);
};

frontend.showPopout = function showPopout (containerID, Sender, contentHtml) {
	// Sender: Attempts to position the popout above this element.
	//         We can't use mouse coordinates, because the popout can also be spawned using the keyboard
	let container = document.getElementById(containerID);
	let XOffset = Sender.offsetLeft, YOffset = Sender.offsetTop;
	if (container.contains(Sender)) {
		XOffset += container.offsetLeft;  // adjustment for relative position inside a popout box
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
	
	let subject = brmt.tools.makePokemonObject(subjectSpecies, subjectSet)
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
	let lineRegex =
		"(?:^|\\n)(?=" + searchword +
			(!searchword2 ? "" : "[^\\n]*" + searchword2)
		+ ")";
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

})();