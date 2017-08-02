(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
window.htmlNodes = ui.htmlNodes = {};
let tools = ui.tools = {};

tools.getTeamStorage = function getTeamStorage () {
	let teamDataList = brmt.parser.stringToBuildData(ui.config.teams);
	let teams = [];
	for (let teamData of teamDataList) {
		let team = [];
		for (let packedSetlist of teamData) {
			let [species, ...sets] = packedSetlist.split('|');
			if (!species) continue;
			if (sets.length === 0)
				sets = ["?"];
			if (sets.length > 1)
				throw new Error(`oops. Something went wrong! One of your teams has a pokemon with more than one set: ${teamData.join(", ")}`);
			team.push(brmt.tools.makePokemonObject(species, sets[0]));
		}
		teams.push(team);
	}
	return teams;
};

tools.isVisibleDOMElement = function isVisibleDOMElement (el) {
	// source: https://stackoverflow.com/a/1542908
	if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
	
	let height = document.documentElement.clientHeight;
	let rects = el.getClientRects();
	
	for (let i = 0, l = rects.length; i < l; i++) {
		let r = rects[i];
		if (r.top > 0)
			return r.top <= height;
		return r.bottom > 0 && r.bottom <= height;
	}
	return false;
};

tools.appendChildnode = function appendChildnode (parentNode, containerTagName, code) {
	let container = document.createElement(containerTagName);
	container.innerHTML = code;
	parentNode.appendChild(container);
	return container;
};

htmlNodes.register = function register (node, ...rest) {
	if (!node)
		return;
	if (typeof node === "string")
		node = document.getElementById(node);
	
	let path = node.id.split("_");
	let name = path.pop();
	if (path.length)
		path[0] += "s";  // collection names make more sense in plural
	
	let el = htmlNodes;
	for (let p of path)  // create a chain of namespaces
		el = el[p] = el[p] || {};
	el[name] = node;     // insert the node at the end of that chain
	
	if (rest.length)
		htmlNodes.register(...rest);
	return node;
};

tools.scrollTextareaFindText = function scrollTextareaFindText (ta, regex) {
// basic Ctrl + F behavior
// selects the next match from the current position, wraps around when it reaches the end
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