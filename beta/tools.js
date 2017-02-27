window.trim = x => x.trim();

window.toId = x => x.toLowerCase().replace(/[^a-z0-9]/g, '');

window.htmlDetails = (summary, details) => `<details><summary>${summary}</summary>${details}</details>`;

window.showPopout = function showPopout (containerID, Sender, contentHtml) {
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

window.addIconWrapListeners = function addIconWrapListeners (parent, eventType, listener) {
	if (typeof parent === "string")
		parent = document.getElementById(parent);
	[...parent.getElementsByClassName("imageWrapper")].forEach(
		imageWrapper => imageWrapper.addEventListener( eventType, () => listener(imageWrapper) )
	);
};

window.addPopup = function addPopup (source, species, set) {
	if (!species)
		[, species, set] = source.title.match(/^(.*) \(([^()]*)\)$/);
	species = window.compendiums.aliases[toId(species)] || species;
	showPopout(
		"onclickinfo_popout",
		source,
		buildTools.compendiumToHtmlImages( compendiums.OUcc, build, [], species, set )
	);
	addIconWrapListeners(
		"onclickinfo_popout",
		'click',
		scrollBuilddata
	);
}

window.scrollBuilddata = function scrollBuilddata (species, set, defenderSpecies, defenderSet) {
	if (species.title)  // parsing title: "defenderSpecies (defenderSet) beats species (set)"
		[, defenderSpecies, defenderSet, species, set] = species.title.match(/^([^()]*) \(([^()]*)\)(?: beats ([^()]*) \(([^()]*)\))?$/);
	if (!species)       // title was "species (set)" instead
		[species, set, defenderSpecies, defenderSet] = [defenderSpecies, defenderSet, "", ""];
	[species, defenderSpecies] = [species, defenderSpecies].map( spc => window.compendiums.aliases[toId(spc)] || spc );
	let target = species, target2 = defenderSpecies;
	if (window.compendiums.officialnames[species])
		target += `|${window.compendiums.officialnames[species]}`;
	target = `(?:${target})[^,\\n]*\\|${set}(?=[,|])`;
	if (target2) {
		if (window.compendiums.officialnames[defenderSpecies])
			target2 += `|${window.compendiums.officialnames[defenderSpecies]}`;
		target2 = `(?:${target2})[^,\\n]*\\|${defenderSet}(?=[,|\\n])`;
	}
	let lineRegex =
		"(?:^|\\n)(?=" + target +
			(!target2 ? "" : "[^\\n]*" + target2)
		+ ")";
	let entryRegex = target2 || target;
	
	let r1 = textareaFindText( document.getElementById("builddata"), new RegExp(lineRegex, 'i') );
	if (!r1) return;
	let r2 = textareaFindText( document.getElementById("builddata"), new RegExp(entryRegex, 'i') );
}

window.textareaFindText = function textareaFindText (ta, regex) {
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
}