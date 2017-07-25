(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let config = ui.config = {};

config.threatlistParameters = {
	"viability": {
		"rate": {
			"teamSource":     "",
			"threatlistType": "species",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["viability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "vr"
		},
		"onClickEventType":   "toggleTeammember"
	},
	"viability-sets": {
		"rate": {
			"teamSource":     "",
			"threatlistType": "sets",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["viability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "vr"
		},
		"onClickEventType":   "toggleTeammember"
	},
	"breakit": {
		"rate": {
			"teamSource":     "team",
			"threatlistType": "sets",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["teamviability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "teamviability"
		},
		"onClickEventType":   "showEntry"
	},
	"breakit-species": {
		"rate": {
			"teamSource":     "team",
			"threatlistType": "species",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["teamviability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "teamviability"
		},
		"onClickEventType":   "showEntry"
	},
	"wallit": {
		"rate": {
			"teamSource":     "team",
			"threatlistType": "sets",
			"weights":        [    0,   0, 0, -11, -7, -3],
			"priorities":     ["teamviability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "teamviability"
		},
		"onClickEventType":   "showEntry"
	},
	"wallit-species": {
		"rate": {
			"teamSource":     "team",
			"threatlistType": "species",
			"weights":        [    0,   0, 0, -11, -7, -3],
			"priorities":     ["teamviability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "team",
			"ratingType":     "teamviability"
		},
		"onClickEventType":   "showEntry"
	},
	"compendium": {
		"rate": {
			"teamSource":     "",
			"threatlistType": "sets",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["viability", "species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeCompendium",
			"teamSource":     "",
			"ratingType":     ""
		},
		"onClickEventType":   "showEntry"
	},
	"builddata": {
		"rate": {
			"teamSource":     "",
			"threatlistType": "sets",
			"weights":        [10000, 100, 2, -11, -7, -3],
			"priorities":     ["species", "hashcode", "set"]
		},
		"display": {
			"method":         "makeIconGallery",
			"teamSource":     "",
			"ratingType":     "species"
		},
		"onClickEventType":   "scrollBuilddataFindEntry"
	}
};

config.teams =
`heatran|?, celesteela|SpD, venusaur-mega|??, nihilego|scarf, greninja|protean, hydreigon|specs
chansey, alomomola|def
tangrowth|av, heatran|?, scizor-mega|SD, greninja|protean, landorus-therian|Offensive, nihilego|scarf
nihilego|scarf, venusaur-mega|??, hydreigon|specs, greninja|ash, bronzong|def, tapu lele|Stall-breaker
celesteela|SpD, venusaur-mega|??, landorus-therian|Offensive, nihilego|scarf, keldeo|specs, tapu lele|Stall-breaker
tapu koko|?, metagross-mega|Breaker, landorus-therian|Offensive, keldeo|scarf, gengar|lo, tangrowth|av
dugtrio|sash, skarmory|def, sableye-mega|?, blissey|cm, amoonguss|def, pyukumuku|curse
greninja|protean, tapu lele|Stall-breaker, heatran|?, amoonguss|def, landorus-therian|scarf, buzzwole|??
`;

})();