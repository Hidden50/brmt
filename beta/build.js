window.brmt = (function(){

let siModes = ["GSI", "SSI", "NSI", "GSI to", "SSI to", "NSI to"];
let weights = [10000,   100,     2,      -11,       -7,       -3];

/* buildData -> build */

this.buildChecksCompendium = function buildChecksCompendium (buildData) {
	let build = {}, miniIcons = {};
	for (let [attacker, mode, ...defenders] of buildData) {
		attacker =  unpackBuildData( [attacker] );
		// handle siModes
		if (["GSI", "SSI", "NSI"].includes(mode)) {
			defenders = unpackBuildData( defenders );
			addEntries(build, attacker, mode, defenders);          // fill "*SI"    for attacker
			addEntries(build, defenders, `${mode} to`, attacker);  // fill "*SI to" for defenders
			continue;
		}
		// handle miniIcon setup. mode = icon, image or letters
		for (let species in attacker)
		for (let set in attacker[species]) {
			if (!miniIcons[species]) miniIcons[species] = {};
			if (!window.compendiums.officialnames[species])
				miniIcons[species][mode] = defenders.join();
			else {
				if (!miniIcons[species][set]) miniIcons[species][set] = {};
				miniIcons[species][set][mode] = defenders.join();
			}
		}
	}
	let isEmptySubjectSet = (subjectSet) => siModes.every( mode => Object.keys(subjectSet[mode]).length === 0 );
	// import from "?" to all sets
	for (let species in build) {
		if (isEmptySubjectSet( build[species]["?"] )) {
			delete build[species]["?"];
			continue;
		}
		let specializedSets = Object.keys(build[species]).filter( set => set !== "?" );
		let subjects = {};
		subjects[species] = build[species];
		for (let mode of siModes) {
			addEntries(build, subjects, mode, build[species]["?"][mode]);
			addEntries(build, build[species]["?"][mode], mode.endsWith(" to") ? mode.substr(0, mode.length - 3) : `${mode} to`, subjects);
		}
	}
	return { "build": build, "miniIcons": miniIcons };
};

function addEntries (build, subjects, mode, targets) {
	for (let species in subjects)
	for (let set in subjects[species])
	for (let targetSpecies in targets)
	for (let targetSet in targets[targetSpecies]) {
		if (!build[species]) build[species] = { "?": { "GSI": {}, "SSI": {}, "NSI": {}, "GSI to": {}, "SSI to": {}, "NSI to": {} } };
		if (!build[species][set]) build[species][set] = { "GSI": {}, "SSI": {}, "NSI": {}, "GSI to": {}, "SSI to": {}, "NSI to": {} };
		if (!build[species][set][mode][targetSpecies]) build[species][set][mode][targetSpecies] = {};
		build[species][set][mode][targetSpecies][targetSet] = 1;
	}
}

window.unpackBuildData = function unpackBuildData (packedSetlists) {
	let setlists = {};
	for (let packedSetlist of packedSetlists) {
		let [species, ...sets] = packedSetlist.split('|');
		if (!species) continue;
		if (sets.length === 0)
			sets = ["?"];
		species = window.compendiums.aliases[toId(species)] || species;
		if (!setlists[species])
			setlists[species] = {};
		for (let set of sets)
			setlists[species][set] = 1;
	}
	return setlists;
};

window.packBuildData = function packBuildData (setlists, useOfficialNames) {
	return Object.keys(setlists).map( species => {
		let packedSets = Object.keys(setlists[species]).join('|');
		if (useOfficialNames)
			species = window.compendiums.officialnames[species] || species;
		if (!packedSets || packedSets === "?")
			return species;
		return species + '|' + packedSets;
	});
};

/* Generate Html Output */

function sortThreats(build) {
	window.team = window.teams.split(/\r?\n/g).map( line => window.unpackBuildData( line.split(",") ) )[0];
	let threats = [];
	for (let species in build)
	for (let set in build[species])
		threats.push( [species, set] );
	let total = (species, set, mode) => Object.keys(build[species][set][mode]).length;
	let count = (species, set, mode) => {
		let result = 0;
		for ( let targetSpecies in team ) {
			if ( !build[species][set][mode][targetSpecies] )
				continue;
			for ( let targetSet in team[targetSpecies] ) {
				if ( build[species][set][mode][targetSpecies][targetSet] ) {
					result++;
					break;
				}
			}
		}
		return result;
	};
	let scoreSet = (species, set, evaluator) => {
		let sum = 0;
		if (["GSI","SSI","NSI"].every( mode => total(species, set, mode) === 0 ))
			sum = 500000;
		for (let m = 0; m < siModes.length; m++)
			sum += weights[m] * evaluator(species, set, siModes[m]);
		return sum;
	};
	let score = (species, evaluator) => Math.min( ...Object.keys(build[species]).map(set => scoreSet(species, set, evaluator)) );
	let simpleHash = (str) => { let num = 0; for (let i in str) num += str.charCodeAt(i) * Math.pow(2, i); return num; };
	for (let t in threats) {
		if (!Object.keys(team).length)
			threats[t].push( -scoreSet(threats[t][0], threats[t][1], total) );
		else threats[t].push( -scoreSet(threats[t][0], threats[t][1], count) );
	}
	threats =  threats.sort((a,b) => {
		if (!Object.keys(team).length)
			return ( score(a[0], total) - score(b[0], total) ) || ( simpleHash(a[0]) - simpleHash(b[0]) ) || ( scoreSet(a[0], a[1], total) - scoreSet(b[0], b[1], total) );
		return ( b[2] - a[2] ) || ( score(a[0], total) - score(b[0], total) ) || ( simpleHash(a[0]) - simpleHash(b[0]) ) || ( scoreSet(a[0], a[1], total) - scoreSet(b[0], b[1], total) )
	});
//	window.showPopout(  "onclickinfo_popout", usespeciesid, "<textarea>" + threats.map(JSON.stringify).join("\r\n") + "</textarea>"  );
	return threats;
}

this.compendiumToHtmlImages = function compendiumToHtmlImages   (compendium, build, options, species, set, mode, targetSpecies) {
//	let speciesSetMap =    aSpeciesSet => compendiumToHtmlImages(compendium, build, options, aSpeciesSet[0], aSpeciesSet[1]);
	let speciesSetMap =    aSpeciesSet => brmtIcon(compendium, `${window.compendiums.officialnames[aSpeciesSet[0]] || aSpeciesSet[0]} (${aSpeciesSet[1]})`, aSpeciesSet[0], aSpeciesSet[1], aSpeciesSet[2]);
	let speciesMap =       aSpecies =>    compendiumToHtmlImages(compendium, build, options, aSpecies);
	let setMap =           aSet =>        compendiumToHtmlImages(compendium, build, options, species, aSet);
	let tilesMap =         aSet =>        brmtIcon(compendium, `${window.compendiums.officialnames[species] || species} (${aSet})`, species, aSet);
	let modeMap =          aMode =>       `${aMode}: ` + compendiumToHtmlImages(compendium, build, options, species, set, aMode);
	let targetSpeciesMap = aSpecies =>    compendiumToHtmlImages(compendium, build, options, species, set, mode, aSpecies);
	let beats =            (A, B) =>      mode.endsWith("to") ? `${A} beats ${B}` : `${B} beats ${A}`;
	let targetSetMap =     aSet =>        brmtIcon(compendium, beats(`${window.compendiums.officialnames[species] || species} (${set})`, `${window.compendiums.officialnames[targetSpecies] || targetSpecies} (${aSet})`), targetSpecies, aSet);
	
	if (!species)        return sortThreats(build).map( speciesSetMap ).join('');
	if (!build[species]) return `Error: Species "${species}" not found.`;
	if (options.includes("tiles")) {
//		if (!build[species]["?"]) return "";
		return brmtIcon(compendium, `${window.compendiums.officialnames[species] || species} (${set})`, species, set);
	}
	if (!set)            return `<b>${window.compendiums.officialnames[species] || species} Sets</b><br><hr>` + Object.keys(build[species]).map( setMap ).join('<br><hr>');
	if (!mode)           return brmtIcon(compendium, `${window.compendiums.officialnames[species] || species} (${set})`, species, set) + ` <b>${set}</b><br>` + Object.keys(build[species][set]).map( modeMap ).join('<br>');
//	if (!set)            return `<b>${species} Checks</b> (click to expand)<br>` + Object.keys(build[species]).map( setMap ).join('');
//	if (!mode)           return htmlDetails( brmtIcon(compendium, species, set) + ` <b>${set}</b>`, Object.keys(build[species][set]).map( modeMap ).join('<br>') );
	if (!targetSpecies)  return Object.keys(build[species][set][mode]).map( targetSpeciesMap ).join('');
	return Object.keys(build[species][set][mode][targetSpecies]).map( targetSetMap ).join('');
};

let Weblink = (imgName) => `./../Serebii__Images/${window.compendiums.aliases[toId(imgName)] || imgName}.png`;

window.brmtIcon = function brmtIcon (compendium, title, species, set, rating) {
	let wrapperClass = "imageWrapper";
	if (team[species] && team[species][set]) wrapperClass += " isonownteam";
	if (rating !== undefined) {
		if (rating <= -5000)    wrapperClass += " rating-verysmall";
		else if (rating <= -50) wrapperClass += " rating-5000";
		else if (rating <= 0)  wrapperClass += " rating-50";
		else                   wrapperClass += " rating-0";
	}
	
	let { image, icon, letters } = compendium.miniIcons[species] && compendium.miniIcons[species][set] || {};
	
	if (compendium.miniIcons[species] && compendium.miniIcons[species]["?"]) {
		if (letters === undefined) letters = compendium.miniIcons[species]["?"].letters;
		image = image || compendium.miniIcons[species]["?"].image;
		icon =  icon  || compendium.miniIcons[species]["?"].icon;
	}
	if (compendium.miniIcons[set]) {
		if (letters === undefined) letters = compendium.miniIcons[set].letters;
		image = image || compendium.miniIcons[set].image;
		icon =  icon  || compendium.miniIcons[set].icon;
	}
	if (letters === undefined) letters = icon ? "" : set;
	letters = `<span class='textWrapper'>${letters}</span>`;
	
	if (icon) icon = `<img src="${Weblink(icon)}" width=18px height=18px alt="(${window.compendiums.aliases[toId(icon)] || icon}) ">`;
	icon = `<span class='iconWrapper'>${icon || ""}</span>`;
	
	rating = `<span class='ratingWrapper'>${(rating === undefined) ? "" : rating}</span>`;
	
	image = `<img src="${Weblink(image || species)}" alt="${window.compendiums.officialnames[species] || species} ">`;
	
	return `<span title="${title}" class="${wrapperClass}">${image}${icon}${letters}${rating}</span>`;
}

return this;

})();