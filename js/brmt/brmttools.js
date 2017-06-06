(function(){

window.project = window.project || {};
window.brmt = project.brmt = project.brmt || {};
let tools = brmt.tools = {};

tools.invertSIMode = function invertSIMode (mode) {
	if (mode.endsWith(" to"))
		return mode.slice(0, -3);
	return `${mode} to`;
};

tools.makePokemonObject = function makePokemonObject (species, set) {
	return { "species": brmt.aliases.getSpeciesID(species), "set": set };
};

})();