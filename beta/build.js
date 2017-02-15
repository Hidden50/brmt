window.compendiums = {};
// compendium = { miniIcons, aliases, changelog, buildData }

window.buildTools = (function(){

/* buildData -> build */

this.buildChecksCompendium = function buildChecksCompendium (buildData) {
	let build = {}, miniIcons = {};
	for (let [attacker, mode, ...defenders] of buildData) {
		attacker =  unpackBuildData( [attacker] );
		if (["GSI", "SSI", "NSI"].includes(mode)) {
			defenders = unpackBuildData( defenders );
			addEntries(build, attacker, mode, defenders);          // fill "*SI"    for attacker
			addEntries(build, defenders, `${mode} to`, attacker);  // fill "*SI to" for defenders
			continue;
		}
		for (let species in attacker)
		for (let set of attacker[species]) {
			if (!miniIcons[species]) miniIcons[species] = {};
			if (species === "?")
				miniIcons[species][mode] = defenders.join();
			else {
				if (!miniIcons[species][set]) miniIcons[species][set] = {};
				miniIcons[species][set][mode] = defenders.join();
			}
		}
	}
	return { "build": build, "miniIcons": miniIcons };
};

function addEntries (build, attackers, mode, defenders) {
	for (let species in attackers)
	for (let set of attackers[species])
	for (let defenderSpecies in defenders)
	for (let defenderSet of defenders[defenderSpecies]) {
		if (!build[species]) build[species] = {};
		if (!build[species][set]) build[species][set] = { "GSI": {}, "SSI": {}, "NSI": {}, "GSI to": {}, "SSI to": {}, "NSI to": {} };
		if (!build[species][set][mode][defenderSpecies]) build[species][set][mode][defenderSpecies] = {};
		build[species][set][mode][defenderSpecies][defenderSet] = 1;
	}
}

window.unpackBuildData = function unpackBuildData (packedSetlists) {
	let setlists = {};
	for (let packedSetlist of packedSetlists) {
		let [species, ...sets] = packedSetlist.split('|');
		if (sets.length === 0)
			sets = ["?"];
		setlists[window.compendiums.aliases[toId(species)] || species] = sets;
	}
	return setlists;
}

window.packBuildData = function packBuildData (setlists, useOfficialNames) {
	return Object.keys(setlists).map( species => {
		let packedSets = setlists[species].join('|');
		if (useOfficialNames)
			species = window.compendiums.officialnames[species] || species;
		if (!packedSets || packedSets === "?")
			return species;
		return species + '|' + packedSets;
	});
}

/* Generate Html Output */

this.compendiumToHtmlImages = function compendiumToHtmlImages (compendium, build, options, species, set, mode, targetSpecies) {
	let speciesMap =       aSpecies => compendiumToHtmlImages(compendium, build, options, aSpecies);
	let setMap =           aSet =>     compendiumToHtmlImages(compendium, build, options, species, aSet);
	let tilesMap =         aSet =>     brmtIcon(compendium, `${window.compendiums.officialnames[species] || species} (${aSet})`, species, aSet);
	let modeMap =          aMode =>    `<b>${aMode}</b>: ` + compendiumToHtmlImages(compendium, build, options, species, set, aMode);
	let targetSpeciesMap = aSpecies => compendiumToHtmlImages(compendium, build, options, species, set, mode, aSpecies);
	let beats =            (A, B) =>   mode.endsWith("to") ? `${A} beats ${B}` : `${B} beats ${A}`;
	let targetSetMap =     aSet =>     brmtIcon(compendium, beats(`${window.compendiums.officialnames[species] || species} (${set})`, `${window.compendiums.officialnames[targetSpecies] || targetSpecies} (${aSet})`), targetSpecies, aSet);
	
	if (!species)        return Object.keys(build).map( speciesMap ).join('');
	if (!build[species]) return `Error: Species "${species}" not found.`;
	if (options.includes("tiles"))
		return Object.keys(build[species]).map( tilesMap ).join('');
	if (!set)            return `<b>${window.compendiums.officialnames[species] || species} Checks</b><br><hr>` + Object.keys(build[species]).map( setMap ).join('<br><hr>');
	if (!mode)           return brmtIcon(compendium, `${window.compendiums.officialnames[species] || species} (${set})`, species, set) + ` <b>${set}</b><br>` + Object.keys(build[species][set]).map( modeMap ).join('<br>');
//	if (!set)            return `<b>${species} Checks</b> (click to expand)<br>` + Object.keys(build[species]).map( setMap ).join('');
//	if (!mode)           return htmlDetails( brmtIcon(compendium, species, set) + ` <b>${set}</b>`, Object.keys(build[species][set]).map( modeMap ).join('<br>') );
	if (!targetSpecies)  return Object.keys(build[species][set][mode]).map( targetSpeciesMap ).join('');
	return Object.keys(build[species][set][mode][targetSpecies]).map( targetSetMap ).join('');
};

let Weblink = (species, set) => `./../Serebii__Images/${species}.png`;

function brmtIcon (compendium, title, species, set, miniIcon) {  // todo: wraplines, nowraplines, sets
	let image = `<img src="${Weblink(species, set)}">`;
	if (compendium.miniIcons[species] && compendium.miniIcons[species][set])
		miniIcon = compendium.miniIcons[species][set];
	else if (compendium.miniIcons[set])
		miniIcon = compendium.miniIcons[set];
	else miniIcon = { "letters": set };
	
	if (miniIcon.icon)
		miniIcon = `<img src="${Weblink(miniIcon.icon)}" width=18px height=18px">`;
	else if (miniIcon.image)
		return `<span title="${title}" class="iconWrapper"><img src="${Weblink(miniIcon.image)}"></span>`;
	else miniIcon = `<b>${miniIcon.letters}</b>`;
	
	return `<span title="${title}" class="iconWrapper">${image}<span class='miniIconWrapper'>${miniIcon}</span></span>`;
}

/* Aliases */

return this;

})()