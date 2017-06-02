(function(){

window.brmt = window.brmt || {};
let builder = brmt.builder = {};

brmt.buildChecksCompendium = builder.buildChecksCompendium = function buildChecksCompendium (buildData) {
	let build = {};
	for (let line of buildData) {
		let [subject, mode, ...targets] = line;
		if (!brmt.config.siModes.includes(mode))
			continue;
		subject = builder.unpackSetData( [subject] );
		targets = builder.unpackSetData(  targets  );
		builder.addEntries(build, subject, mode, targets);                           // fill "*SI"    for subject
		builder.addEntries(build, targets, brmt.tools.invertSIMode(mode), subject);  // fill "*SI to" for targets
	}
	return build;
};

builder.addEntries = function addEntries (build, subjects, mode, targets) {
	for (let species in subjects)
	for (let set in subjects[species])
	for (let targetSpecies in targets)
	for (let targetSet in targets[targetSpecies]) {
		if (!build[species]) build[species] = {};
		if (!build[species][set]) build[species][set] = { "GSI": {}, "SSI": {}, "NSI": {}, "GSI to": {}, "SSI to": {}, "NSI to": {} };
		if (!build[species][set][mode][targetSpecies]) build[species][set][mode][targetSpecies] = {};
		build[species][set][mode][targetSpecies][targetSet] = 1;
	}
};

builder.unpackSetData = function unpackSetData (packedSetlists) {
	let setlists = {};
	for (let packedSetlist of packedSetlists) {
		let [species, ...sets] = packedSetlist.split('|');
		if (!species) continue;
		if (sets.length === 0)
			sets = ["?"];
		species = brmt.aliases.getSpeciesID(species);
		if (!setlists[species])
			setlists[species] = {};
		for (let set of sets)
			setlists[species][set] = 1;
	}
	return setlists;
};

builder.packSetData = function packSetData (setlists, useOfficialNames) {
	return Object.keys(setlists).map( species => {
		let packedSets = Object.keys(setlists[species]).join('|');
		if (useOfficialNames)
			species = brmt.aliases.getOfficialname(species);
		if (!packedSets || packedSets === "?")
			return species;
		return species + '|' + packedSets;
	});
};

builder.buildDataToString = function buildDataToString (data, sep, linesep, useOfficialNames) {
	return data.map(
		line => line.map(
			el => brmt.builder.packSetData( brmt.builder.unpackSetData( [el] ), useOfficialNames )
		).join(sep)
	).join(linesep);
};

builder.stringToBuildData = function stringToBuildData (S) {
	return S.split(/\r?\n/g).map( line => line.split(/ *, */) );
};

})();