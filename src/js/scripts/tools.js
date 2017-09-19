(function(){

window.project = window.project || {};
let tools = project.tools = project.tools || {};

window.toId = tools.toId = (S => S.toLowerCase().replace(/[^a-z0-9]+/g, ""));

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

tools.makeHtmlTable = function(rows, cellParams = []) {
	let cellMap = (cell, i) => `<td ${cellParams[i] || ""}>${cell}</td>`;
	let rowMap = row => `<tr>${row.map(cellMap).join("")}</tr>`;
	return `<table>${rows.map(rowMap).join("")}</table>`;
};

tools.jsObjectToHtml = function jsObjectToHtml (Obj, desc, debth=0) {
	let open = debth > 0 ? " open" : "";
	if (typeof Obj === "function") {
		let sourcecode = tools.escapeHTML( Obj.toString() ).replace(/\t/g, "    ");  // make tab length consistent: 4 spaces
		if (!/\r?\n/.test(sourcecode))
			return `<pre>${sourcecode}</pre>`;
		return `<details${open}><summary><pre>${sourcecode.replace(/\r?\n/, "</pre></summary><pre>")}</pre></details>`;
	}
	if (Obj === null || typeof Obj !== "object") {
		let Str = tools.escapeHTML(JSON.stringify(Obj));
		if (Str.length < 120)
			return Str;
		return `<details${open}><summary><code>${typeof Obj}</code></summary>${Str}</details>`;
	}
	let internals = Object.keys(Obj).map(key => [
		`${tools.escapeHTML(JSON.stringify(key).slice(1,-1))}: `,
		jsObjectToHtml(Obj[key], desc[key] || {}, debth-1)
	]);
	
	if (!internals.length) {
		if (Array.isArray(Obj))
			return "[]";
		else return "{}";
	}
	internals = tools.makeHtmlTable(internals);
	
	let summary;
	if (typeof desc === "string")
		summary = `<span class="desc">${desc}</span>`;
	else if (desc.desc)
		summary = `<span class="desc">${desc.desc}</span>`;
	else
		summary = "...";
	
	if (Array.isArray(Obj))
		summary = `[ <span class="desc-wrapper">${summary} ]</span>`;
	else summary = `{ <span class="desc-wrapper">${summary} }</span>`;
	
	return `<details${open}><summary>${summary}</summary>${internals}</details>`;
};

})();