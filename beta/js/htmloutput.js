(function(){

window.brmt = window.brmt || {};
let htmloutput = brmt.htmloutput = {};

brmt.readIconConfig = htmloutput.readIconConfig = function readIconConfig (buildData) {
	let iconConfig = {};
	for (let line of buildData) {
		let [subject, config, data] = line;
		if (!brmt.config.iconConfigs.includes(config))
			continue;
		subject = brmt.builder.unpackSetData([subject]);
		for (let species in subject)
		for (let set in subject[species]) {
			if (!iconConfig[species]) iconConfig[species] = {};
			
			if (brmt.aliases.officialnames[species]) {
				if (!iconConfig[species][set])
					iconConfig[species][set] = {};
				iconConfig[species][set][config] = data;
			} else {
				iconConfig[species][config] = data;
			}
		}
	}
	return iconConfig;
};

htmloutput.brmtIcon = function brmtIcon (pokemon, team, iconConfig, rating) {
	let {species, set, mouseoverText} = pokemon;
	let wrapperClass = "imageWrapper";
	if (team.some( pokemon => pokemon.species === species && pokemon.set === set ))
		wrapperClass += " onteam";
	if (rating !== undefined) {
		if (rating <= -250000)  wrapperClass += " rating-verysmall";
		if (rating <= -5000)    wrapperClass += " rating-250000";
		else if (rating <= -50) wrapperClass += " rating-5000";
		else if (rating <= 0)   wrapperClass += " rating-50";
		else                    wrapperClass += " rating-0";
	}
	
	if (mouseoverText === undefined)
		mouseoverText = brmt.aliases.getSetTitle(pokemon);
	
	// is there a config for this set?
	let {image, icon, letters} = iconConfig[species] && iconConfig[species][set] || {};
	// inherit unspecified config elements from the species
	if (iconConfig[species] && iconConfig[species]["?"]) {
		if (letters === undefined) letters = iconConfig[species]["?"].letters;
		image = image || iconConfig[species]["?"].image;
		icon =  icon  || iconConfig[species]["?"].icon;
	}
	// inherit still unspecified config elements from the set
	// for example, all |cb sets may have been set to have a choice band icon
	if (iconConfig[set]) {
		if (letters === undefined) letters = iconConfig[set].letters;
		image = image || iconConfig[set].image;
		icon =  icon  || iconConfig[set].icon;
	}
	// label the icon with its set name, unless there's a mini icon
	if (letters === undefined) letters = icon ? "" : set;
	
	// generate html output
	letters = `<span class='textWrapper'>${letters}</span>`;
	if (icon) icon = `<img src="${htmloutput.weblink(icon)}" width=18px height=18px alt="(${brmt.aliases.getOfficialname(icon)}) ">`;
	icon = `<span class='iconWrapper'>${icon || ""}</span>`;
	rating = `<span class='ratingWrapper'>${(rating === undefined) ? "" : rating}</span>`;
	image = `<img src="${htmloutput.weblink(image || species)}" alt="${brmt.aliases.getOfficialname(species)} ">`;
	return `<span title="${mouseoverText}" class="${wrapperClass}">${image}${icon}${letters}${rating}</span>`;
};

htmloutput.weblink = (imgName) => `./../Serebii__Images/${brmt.aliases.getSpeciesID(imgName)}.png`;

htmloutput.makeIconGallery = function makeIconGallery (pokemonlist, team, iconConfig) {
	return pokemonlist.map( pokemon => {
		let scoreDisplay;
		if (pokemon.score) {
			if (team.length)
				scoreDisplay = -pokemon.score.team;
			scoreDisplay = -pokemon.score.set;
		}
		return htmloutput.brmtIcon(pokemon, team, iconConfig, scoreDisplay);
	}).join("");
};

htmloutput.makeCompendiumEntry = function makeCompendiumEntry (build, subject, team, iconConfig) {
	let table = [];
	for (let mode in build[subject.species][subject.set]) {
		let targets = [];
		for (let targetSpecies in build[subject.species][subject.set][mode]) {
			for (let targetSet in build[subject.species][subject.set][mode][targetSpecies]) {
				let target = brmt.tools.makePokemonObject(targetSpecies, targetSet);
				let A = brmt.aliases.getSetTitle(subject);
				let B = brmt.aliases.getSetTitle(target);
				if (mode.endsWith("to"))
					target.mouseoverText = `${A} beats ${B}`;
				else target.mouseoverText = `${B} beats ${A}`;
				targets.push(target);
			}
		}
		table.push( [`${mode}: `, htmloutput.makeIconGallery(targets, team, iconConfig) || "-"] );
	}
	let image = htmloutput.brmtIcon(subject, team, iconConfig);
	let text  = brmt.aliases.getSetTitle(subject);
	return `${image} <b>${text}</b>` + brmt.tools.makeHtmlTable(table);
};

})();