(function(){

window.brmt = window.brmt || {};
let tools = brmt.tools = {};

window.toId = tools.toId = (S => S.toLowerCase().replace(/[^a-z0-9]+/g, ""));

tools.escapeHTML = function (str) {
	if (!str) return '';
	return (
		('' + str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/\//g, '&#x2f;')
	);
};

String.prototype.hashCode = function() {
	// source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	let hash = 0;
	if (this.length === 0) return hash;
	for (let i = 0; i < this.length; i++) {
		hash  = ((hash << 5) - hash) + this.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

tools.invertSIMode = function invertSIMode (mode) {
	if (mode.endsWith(" to"))
		return mode.slice(0, -3);
	return `${mode} to`;
};

tools.makePokemonObject = function makePokemonObject (species, set) {
	return { "species": brmt.aliases.getSpeciesID(species), "set": set };
};

tools.makeHtmlTable = function(rows, colParams = []) {
	let cellMap = (cell, i) => `<td ${colParams[i] || ""}>${cell}</td>`;
	let rowMap = row => `<tr>${row.map(cellMap).join("")}</tr>`;
	return `<table>${rows.map(rowMap).join("")}</table>`;
};

tools.jsObjectToHtml = function jsObjectToHtml (Obj, debth=0) {
	let open = debth > 1 ? "" : " open";
	if (typeof Obj === "function") {
		let sourcecode = tools.escapeHTML(Obj.toString()).replace(/\t/g, "    ");  // tabs are 4 spaces long in my editor
		if (!/\r?\n/.test(sourcecode))
			return `<pre>${sourcecode}</pre>`;
		return `<details${open}><summary><pre>${sourcecode.replace(/\r?\n/, "</pre></summary><pre>")}</pre></details>`;
	}
	if (typeof Obj !== "object") {
		let Str = tools.escapeHTML(JSON.stringify(Obj));
		if (Str.length < 120)
			return Str;
		return `<details${open}><summary><code>${typeof Obj}</code></summary>${Str}</details>`;
	}
	let internals = Object.keys(Obj).map(key => [
		`${tools.escapeHTML(JSON.stringify(key).slice(1,-1))}: `,
		jsObjectToHtml(Obj[key], debth+1)
	]);
	if (!internals.length) internals = "";
	else internals = tools.makeHtmlTable(internals);
	
	if (Array.isArray(Obj))
		return internals ? `<details${open}><summary>[...]</summary>${internals}</details>` : "[]";
	return internals ? `<details${open}><summary>{...}</summary>${internals}</details>` : "{}";
};

})();