(function(){

window.project = window.project || {};
window.brmt = project.brmt = project.brmt || {};
let parser = brmt.parser = {};

parser.parseChecksCompendium = function parseChecksCompendium (buildData) {
	let build = {};
	for (let line of buildData) {
		if (!line.length || line[0].startsWith("//"))
			continue;
		let [subject, mode, ...targets] = line;
		if (!brmt.tools.siModes.includes(mode))
			continue;
		subject = parser.unpackSetData( [subject] );
		targets = parser.unpackSetData(  targets  );
		parser.addEntries(build, subject, mode, targets);                           // fill "*SI"    for subject
		parser.addEntries(build, targets, brmt.tools.invertSIMode(mode), subject);  // fill "*SI to" for targets
	}
	return parser.inheritEntries(build);
};

parser.addEntries = function addEntries (build, subjects, mode, targets) {
	for (let species in subjects)
	for (let set in subjects[species])
	for (let targetSpecies in targets)
	for (let targetSet in targets[targetSpecies]) {
		if (!build[species]) build[species] = { "?": brmt.tools.emptySubjectObject() };
		if (!build[species][set]) build[species][set] = brmt.tools.emptySubjectObject();
		if (!build[species][set][mode][targetSpecies]) build[species][set][mode][targetSpecies] = {};
		build[species][set][mode][targetSpecies][targetSet] = 1;
	}
};

parser.unpackSetData = function unpackSetData (packedSetlists) {
	let setlists = {};
	for (let packedSetlist of packedSetlists) {
		let [species, ...sets] = packedSetlist.split('|').filter( entry => entry.length );
		if (!species) continue;
		species = brmt.aliases.getSpeciesID(species);

		if (sets.length === 0) {
			sets = ["?"];
		}
		if (!setlists[species]) {
			setlists[species] = {};
		}

		for (let set of sets) {
			set = brmt.aliases.getSetAlias(set)
				.replace(/([a-z])([A-Z])/g, "$1 $2")  // convert camel case to spaced words
				.toLowerCase();                       // convert to lower case
			setlists[species][set] = 1;
		}
	}
	return setlists;
};

parser.packSetData = function packSetData (setlists, useOfficialNames) {
	return Object.keys(setlists).map( species => {
		let packedSets = Object.keys(setlists[species]).join('|');
		if (useOfficialNames)
			species = brmt.aliases.getOfficialname(species);
		if (!packedSets || packedSets === "?")
			return species;
		return species + '|' + packedSets;
	});
};

parser.inheritEntries = function inheritEntries (build) {
	for (let species in build) {
		// all sets inherit from the "?" set
		let isEmpty = Object.keys(build[species]["?"]).every( mode =>
			brmt.teamrater.countTargetSpecies(build, brmt.tools.makePokemonObject(species, "?"), mode) === 0
		);
		if (isEmpty) {
			delete build[species]["?"];
			continue;
		}
		
		let subject = {};
		subject[species] = build[species];
		for (let mode in build[species]["?"]) {
			let targets = build[species]["?"][mode];
			parser.addEntries(build, subject, mode, targets);
			parser.addEntries(build, targets, brmt.tools.invertSIMode(mode), subject);
		}
	}
	return build;
};

parser.buildDataToString = function buildDataToString (data, sep, linesep, useOfficialNames) {
	return data.map( line => {
		if (typeof line[0] === "string" && !line[0].startsWith("//")) {
			line = line.map(
				arg => brmt.parser.packSetData( brmt.parser.unpackSetData([arg]), useOfficialNames )
			);
		}
		return line.join(sep);
	}).join(linesep);
};

parser.stringToBuildData = function stringToBuildData (Str) {
	return Str.split(/\r?\n/g).map( line => line.split(/ *, */) );
};

})();