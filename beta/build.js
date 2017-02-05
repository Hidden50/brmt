window.compendiums = {};
// compendium = { miniIcons, aliases, changelog, buildData }

window.buildTools = (function(){

/* buildData -> build */

this.buildChecksCompendium = function buildChecksCompendium (buildData) {
	let build = {};
	for (let [attacker, mode, ...defenders] of buildData) {
		attacker =  unpackBuildData( [attacker] );
		defenders = unpackBuildData( defenders );
		addEntries(build, attacker, mode, defenders);          // fill "*SI"    for attacker
		addEntries(build, defenders, `${mode} to`, attacker);  // fill "*SI to" for defenders
	}
	return build;
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

function unpackBuildData (packedSetlists) {
	let setlists = {};
	for (let packedSetlist of packedSetlists) {
		let [species, ...sets] = packedSetlist.split('|');
		if (sets.length === 0) sets = ["Unspecified"];
		setlists[species] = sets;
	}
	return setlists;
}

function packBuildData (setlists) {
	return Object.keys(setlists).map( species => {
		let packedSets = setlists[species].join('|');
		if (!packedSets || packedSets === "Unspecified")
			return species;
		return species + '|' + packedSets;
	});
}

/* Generate Html Output */

this.compendiumToHtmlImages = function compendiumToHtmlImages (compendium, build, options, species, set, mode, targetSpecies) {
	let speciesMap =       aSpecies => compendiumToHtmlImages(compendium, build, options, aSpecies);
	let setMap =           aSet =>     compendiumToHtmlImages(compendium, build, options, species, aSet);
	let tilesMap =         aSet =>     brmtIcon(compendium, `${species} (${aSet})`, species, aSet);
	let modeMap =          aMode =>    `<b>${aMode}</b>: ` + compendiumToHtmlImages(compendium, build, options, species, set, aMode);
	let targetSpeciesMap = aSpecies => compendiumToHtmlImages(compendium, build, options, species, set, mode, aSpecies);
	let targetSetMap =     aSet =>     brmtIcon(compendium, mode.endsWith("to") ? `${species} (${set}) beats ${targetSpecies} (${aSet})` : `${targetSpecies} (${aSet}) beats ${species} (${set})`, targetSpecies, aSet);
	
	if (!species)        return Object.keys(build).map( speciesMap ).join('');
	if (!build[species]) return `Error: Species "${species}" not found.`;
	if (options.includes("tiles"))
		return Object.keys(build[species]).map( tilesMap ).join('');
	if (!set)            return `<b>${species} Checks</b><br><hr>` + Object.keys(build[species]).map( setMap ).join('<br><hr>');
	if (!mode)           return brmtIcon(compendium, `${species} (${set})`, species, set) + ` <b>${set}</b><br>` + Object.keys(build[species][set]).map( modeMap ).join('<br>');
//	if (!set)            return `<b>${species} Checks</b> (click to expand)<br>` + Object.keys(build[species]).map( setMap ).join('');
//	if (!mode)           return htmlDetails( brmtIcon(compendium, species, set) + ` <b>${set}</b>`, Object.keys(build[species][set]).map( modeMap ).join('<br>') );
	if (!targetSpecies)  return Object.keys(build[species][set][mode]).map( targetSpeciesMap ).join('');
	return Object.keys(build[species][set][mode][targetSpecies]).map( targetSetMap ).join('');
};

const miniIconFontStyle =    'style="color:#fff; text-shadow: 1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000"';
const miniIconStyle =        'style="position:absolute; right:0px; bottom:0px"';

let Weblink = (species, set) => `./../Serebii__Images/${species}.png`;

function brmtIcon (compendium, title, species, set, cornerDisplay) {  // todo: wraplines, nowraplines, sets
	let image = `<img src="${Weblink(species, set)}">`;
	if (!set) return image;
	if (cornerDisplay) return `<span title="${title}" class="iconWrapper">${image}<span ${miniIconStyle}>${cornerDisplay}</span></span>`;
	let miniIcon;
	if (compendium.miniIcons[species] && compendium.miniIcons[species][set])
		miniIcon = compendium.miniIcons[species][set];
	else if (compendium.miniIcons[set])
		miniIcon = compendium.miniIcons[set];
	else return brmtIcon( compendium, title, species, set, `<b ${miniIconFontStyle}>${set}</b>` );
	
	if (miniIcon.letters !== undefined)
		return brmtIcon( compendium, title, species, set, `<b ${miniIconFontStyle}>${miniIcon.letters}</b>` );
	if (miniIcon.icon)
		return brmtIcon( compendium, title, species, set, `<img src="${Weblink(miniIcon.icon)}" width=18px height=18px">` );
	if (miniIcon.image)
		return brmtIcon( compendium, title, miniIcon.image );
}

/* Aliases */

return this;

})()