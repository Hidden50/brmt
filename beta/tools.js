window.trim = x => x.trim();

window.htmlDetails = (summary, details) => `<details><summary>${summary}</summary>${details}</details>`;

window.showPopout = function showPopout (containerID, Sender, contentHtml) {
	// Sender: Attempts to position the popout above this element.
	//         We can't use mouse coordinates, because the popout can also be spawned using the keyboard
	var container = document.getElementById(containerID);
	var XOffset = Sender.offsetLeft, YOffset = Sender.offsetTop;
	if (container.contains(Sender)) {
		XOffset += container.offsetLeft;  // adjustment for relative position inside a popout box
		YOffset += container.offsetTop;
	}
	if (contentHtml)
		container.innerHTML = contentHtml;
	container.style.display = 'block';
	
	container.style.right = '0px';
	container.style.right = Math.max(container.offsetLeft - XOffset, 0) + 'px';
	
	var maxTop = window.pageYOffset + window.innerHeight - container.offsetHeight - 15;
	container.style.top = maxTop + 'px';
	container.style.top = (maxTop - Math.max(container.offsetTop - YOffset, 0)) + 'px';
};

window.addIconWrapListeners = function addIconWrapListeners (parent, eventType, listener) {
	if (typeof parent === "string")
		parent = document.getElementById(parent);
	[...parent.getElementsByClassName("iconWrapper")].forEach(
		iconWrapper => iconWrapper.addEventListener( eventType, () => listener(iconWrapper) )
	);
};

window.addPopup = function addPopup (source, species, set) {
	if (!species)
		[, species, set] = source.title.match(/^(.*) \(([^()]*)\)$/);
	showPopout(
		"onclickinfo_popout",
		source,
		buildTools.compendiumToHtmlImages( compendiums.OUcc, build, [], species )
	);
	addIconWrapListeners(
		"onclickinfo_popout",
		'click',
		scrollBuilddata
	);
}

window.scrollBuilddata = function scrollBuilddata (species, set, defenderSpecies, defenderSet) {
	if (species.title)  // title: "defenderSpecies (defenderSet) beats species (set)"
		[, defenderSpecies, defenderSet, species, set] = species.title.match(/^([^()]*) \(([^()]*)\)(?: beats ([^()]*) \(([^()]*)\))?$/);
	if (!species)       // title was "species (set)" instead
		[species, set, defenderSpecies, defenderSet] = [defenderSpecies, defenderSet, "", ""];
	textareaFindText( document.getElementById("builddata"), new RegExp("\n" + `(?=${species}[^\n]*${defenderSpecies})`, 'i') );
	textareaFindText( document.getElementById("builddata"), new RegExp(defenderSpecies || species, 'i') );
}

window.textareaFindText = function textareaFindText (ta, regex) {
	let offset = ta.selectionEnd;
	let match = ta.value.substr(offset).match(regex);
	if (!match) {
		// reached the end. loop around and try again..
		offset = 0;
		match = ta.value.match(regex);
	}
	if (!match) return;  // no results found
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
}