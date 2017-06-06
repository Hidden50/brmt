(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
window.htmlNodes = ui.htmlNodes = {};
let tools = ui.tools = {};

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

htmlNodes.register = function register (node, ...rest) {
	if (typeof node === "string")
		node = document.getElementById(node);
	
	let tagClass = node.tagName.toLowerCase();
	if (tagClass.length > 1)
		tagClass += "s";      // collection names make more sense in plural
	let name = node.id.substr(1 + node.id.indexOf("_"));
	
	htmlNodes[tagClass] = htmlNodes[tagClass] || {};
	htmlNodes[tagClass][name] = node;
	
	if (rest.length)
		htmlNodes.register(...rest);
	return node;
};

})();