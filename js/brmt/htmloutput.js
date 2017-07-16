(function(){

window.project = window.project || {};
window.brmt = project.brmt = project.brmt || {};
let htmloutput = brmt.htmloutput = {};

htmloutput.iconConfigTypes = [
	"icon",
	"image",
	"letters"
];

htmloutput.weblink = (imgName) => `./img/${brmt.aliases.getSpeciesID(imgName)}.png`;

htmloutput.readIconConfig = function readIconConfig (buildData) {
	let iconConfig = {};
	for (let line of buildData) {
		let [subject, configType, configData] = line;
		if (!htmloutput.iconConfigTypes.includes(configType))
			continue;
		subject = brmt.builder.unpackSetData([subject]);
		for (let species in subject)
		for (let set in subject[species]) {
			if (!iconConfig[species]) iconConfig[species] = {};
			
			if (brmt.aliases.officialnames[species]) {
				if (!iconConfig[species][set])
					iconConfig[species][set] = {};
				iconConfig[species][set][configType] = configData;
			} else {
				iconConfig[species][configType] = configData;
			}
		}
	}
	return iconConfig;
};

htmloutput.brmtIcon = function brmtIcon (pokemon, build, team, iconConfig, rating) {
	let {species, set, mouseoverText} = pokemon;
	let wrapperClass = "imageWrapper";
	if (team.some( teamMember => pokemon.species === teamMember.species && (pokemon.set === teamMember.set || pokemon.set === "species") ))
		wrapperClass += " onteam";
	if (!build[pokemon.species] || !build[pokemon.species][pokemon.set])
		wrapperClass += " notcovered";
	if (rating !== undefined) {
		if (typeof rating === "string")
			wrapperClass += ` rating-${rating.replace("+", " plus").replace("-", " minus")}`
		else if (rating <= -250000) {
			wrapperClass += " rating-verysmall";
			rating += 500000;  // don't display penalty for defensive threats
		} else if (rating <= -5000) wrapperClass += " rating-250000";
		else if (rating <= -50)     wrapperClass += " rating-5000";
		else if (rating <= 0)       wrapperClass += " rating-50";
		else                        wrapperClass += " rating-0";
	}
	
	if (mouseoverText === undefined)
		mouseoverText = brmt.aliases.getSetTitle(pokemon);
	
	// is there a config for this set?
	let {image, icon, letters} = iconConfig[pokemon.species] && iconConfig[pokemon.species][set] || {};
	// inherit unspecified config elements from the species
	if (iconConfig[pokemon.species] && iconConfig[pokemon.species]["?"]) {
		if (letters === undefined) letters = iconConfig[pokemon.species]["?"].letters;
		image = image || iconConfig[pokemon.species]["?"].image;
		icon =  icon  || iconConfig[pokemon.species]["?"].icon;
	}
	// inherit still unspecified config elements from the set
	// for example, all |cb sets may have been set to have a choice band icon
	if (iconConfig[set]) {
		if (letters === undefined) letters = iconConfig[set].letters;
		image = image || iconConfig[set].image;
		icon =  icon  || iconConfig[set].icon;
	}
	// label the icon with its set name, unless there's a mini icon
	if (letters === undefined) {
		if (icon)
			letters = "";
		else if (set === "species")
			letters = "";
		else
			letters = set;
	}
	
	// generate html output
	letters = `<span class='textWrapper'>${letters}</span>`;
	if (icon) icon = `<img src="${htmloutput.weblink(icon)}" width=18px height=18px alt="(${brmt.aliases.getOfficialname(icon)}) ">`;
	icon = `<span class='iconWrapper'>${icon || ""}</span>`;
	rating = `<span class='ratingWrapper'>${(rating === undefined) ? "" : rating}</span>`;
	image = `<img src="${htmloutput.weblink(image || species)}" alt="${brmt.aliases.getOfficialname(species)} ">`;
	return `<span title="${mouseoverText}" class="${wrapperClass}">${image}${icon}${letters}${rating}</span>`;
};

htmloutput.makeCompendiumEntry = function makeCompendiumEntry (pokemon, build, team, iconConfig) {
	if (pokemon.set === "species") {
		return Object.keys( build[pokemon.species] ).map( set =>
			htmloutput.makeCompendiumEntry(
				brmt.tools.makePokemonObject(pokemon.species, set),
				build,
				team,
				iconConfig
			)
		).join("<hr>");
	}
	let table = [];
	for (let mode in build[pokemon.species][pokemon.set]) {
		let targets = [];
		for (let targetSpecies in build[pokemon.species][pokemon.set][mode]) {
			for (let targetSet in build[pokemon.species][pokemon.set][mode][targetSpecies]) {
				let target = brmt.tools.makePokemonObject(targetSpecies, targetSet);
				let A = brmt.aliases.getSetTitle(pokemon);
				let B = brmt.aliases.getSetTitle(target);
				if (mode.endsWith("to"))
					target.mouseoverText = `${A} beats ${B}`;
				else target.mouseoverText = `${B} beats ${A}`;
				targets.push(target);
			}
		}
		let gallery = htmloutput.makeIconGallery(targets, build, team, iconConfig) || "-";
		table.push( [`${mode}: `, `<span class="${mode.replace(" ", "")}">${gallery}</span>`] );
	}
	let image = htmloutput.brmtIcon(pokemon, build, team, iconConfig);
	let text  = brmt.aliases.getSetTitle(pokemon);
	
	return `${image} <b>${text}</b>${project.tools.makeHtmlTable(table)}`;
};

htmloutput.makeSetsList = function makeSetsList (pokemonlist, build, team, iconConfig) {
	let table = [];
	for (let pokemon of pokemonlist) {
		table.push([
			htmloutput.brmtIcon(pokemon, build, team, iconConfig),
			brmt.aliases.getSetTitle(pokemon).replace(" (", "<br>(")
		]);
	}
	return project.tools.makeHtmlTable(table);
};

htmloutput.makeIconGallery = function makeIconGallery (pokemonlist, build, team, iconConfig, scoreMode) {
	return pokemonlist.map( pokemon =>
		htmloutput.brmtIcon(pokemon, build, team, iconConfig, pokemon.score && pokemon.score[scoreMode])
	).join("");
};

htmloutput.makeCompendium = function makeCompendium (pokemonlist, build,  team, iconConfig) {
	return pokemonlist.map(
		pokemon => htmloutput.makeCompendiumEntry(pokemon, build, team, iconConfig)
	).join("<hr>");
};

})();