window.brmt = window.brmt || {};
brmt.config = {};

brmt.config.modeWeights = {
	"GSI":   10000,
	"SSI":     100,
	"NSI":       2,
	"GSI to":  -11,
	"SSI to":   -7,
	"NSI to":   -3
};

brmt.config.siModes = Object.keys(brmt.config.modeWeights);
brmt.config.weights = brmt.config.siModes.map( mode => brmt.config.modeWeights[mode] );

brmt.config.iconConfigs = ["icon", "image", "letters"];

brmt.config.teams = `heatran|??, celesteela|SpD, venusaur-mega|??, nihilego|scarf, greninja|protean, hydreigon|specs
chansey, alomomola|def
tangrowth|av, heatran|??, scizor-mega|SD, greninja|protean, landorus-therian|offensive, nihilego|scarf
nihilego|scarf, venusaur-mega|??, hydreigon|specs, greninja|ash, bronzong|def, tapu lele|Stall-breaker
celesteela|SpD, venusaur-mega|??, landorus-therian|offensive, nihilego|scarf, keldeo|specs, tapu lele|Stall-breaker
tapu koko|??, metagross-mega|Wall-breaker, landorus-therian|offensive, keldeo|scarf, gengar|lo, tangrowth|av
dugtrio|sash, skarmory|def, sableye-mega|?, blissey|cm, amoonguss|def, pyukumuku|curse
greninja|protean, tapu lele|Stall-breaker, heatran|??, amoonguss|def, landorus-therian|scarf, buzzwole|??`;