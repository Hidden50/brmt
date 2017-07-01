(function(){

window.project = window.project || {};
project.tools = project.tools || {};

project.tools.projectdesc = {
	desc:  "project",
	tools: {
		desc:        "utility functions",
		projectdesc: "object inspector labels -- you are currently reading one"
	},
	brmt: {
		desc:        "core project",
		tools:       "utility functions",
		builder:     "parses compendium data into a format that brmt can manipulate",
		teamrater:   "generates scores and outputs a sorted array of pokemon objects",
		htmloutput:  "formats results as html",
		aliases:     {
			desc:          "lets brmt use more readable names, like Charizard-Mega-Y for 006-my",
			officialnames: "pokemon names by species id",
			speciesIDs:    "species ids by pokemon name"
		}
	},
	ui: {
		desc:             "user interface",
		htmlNodes:        "organized list of all html elements accessible via id",
		tools:            "utility functions",
		listeners:        "controls responses to user input",
		cache:            "settings and computation results",
		threatlistEvents: "some possible events when clicking on a pokemon image",
		config:           "default configuration, may change with user input"
	},
};

})();