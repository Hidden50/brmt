(function(){

window.project = window.project || {};
window.brmt = project.brmt = project.brmt || {};
let teamrater = brmt.teamrater = {};

teamrater.readSetInfo = function readSetInfo (buildData) {
	let setInfo = {};
	for (let line of buildData) {
		let [rank, type, ...targets] = line;
		if (type !== "vr")
			continue;
		
		targets = brmt.builder.unpackSetData(targets);
		for (let species in targets)
		for (let set in targets[species]) {
			if (!setInfo[species]) setInfo[species] = {};
			
			if (brmt.aliases.officialnames[species]) {
				if (!setInfo[species][set])
					setInfo[species][set] = {};
				setInfo[species][set][type] = rank;
			} else {
				setInfo[species][type] = rank;
			}
		}
	}
	return setInfo;
};

let countTargetSpecies = teamrater.countTargetSpecies = function countTargetSpecies (build, subject, mode) {
	return Object.keys( build[subject.species][subject.set][mode] ).length;
};

let countTargetSets = teamrater.countTargetSets = function countTargetSets (build, subject, mode) {
	let sum = 0;
	let targets = build[subject.species][subject.set][mode];
	for (let targetSpecies in targets)
		sum += Object.keys(targets[targetSpecies]).length;
	return sum;
};

let countTeamChecks = teamrater.countTeamChecks = function countTeamChecks (build, subject, mode, team) {
	let sum = 0;
	let targets = build[subject.species][subject.set][mode];
	for (let pokemon of team) {
		if (targets[pokemon.species] && targets[pokemon.species][pokemon.set])
			sum++;
	}
	return sum;
};

teamrater.scoreSet = function scoreSet (build, subject, team, evaluator, weights) {
// returns the weighted sum over an evaluator, for the given set
	if (subject.set === "species")
		return teamrater.scoreSpecies(build, subject, team, evaluator, weights);
	let sum = 0;
	if (weights[0] || weights[1] || weights[2]) {
		if (["GSI","SSI","NSI"].every( mode => countTargetSpecies(build, subject, mode) === 0 ))
			sum = -500000;
	}
	for (let m = 0; m < brmt.tools.siModes.length; m++)
		sum -= weights[m] * evaluator(build, subject, brmt.tools.siModes[m], team);
	return sum;
};

teamrater.scoreSpecies = function scoreSpecies (build, subject, team, evaluator, weights) {
	// the score of a species is that of its most threatening set
	return Math.max( ...Object.keys(build[subject.species] ).map(
		set => teamrater.scoreSet( build, brmt.tools.makePokemonObject(subject.species, set), team, evaluator, weights )
	));
};

let scoreViability = teamrater.scoreViability = function scoreViability (pokemon) {
	let vrScore = {
		"S":   4,
		"A+":  3,
		"A":   2,
		"A-":  1,
		"B+":  0,
		"B":  -1,
		"B-": -2,
		"C+": -3,
		"C":  -4,
		"C-": -5,
		"D+": -6,
		"D":  -7,
		"D-": -8,
		"?":  -9
	};
	return vrScore[pokemon.score.vr];
}

let getViability = teamrater.getViability = function getViability (pokemon, setInfo) {
	if (!setInfo[pokemon.species])
		return "?";
	if (setInfo[pokemon.species][pokemon.set])
		return setInfo[pokemon.species][pokemon.set].vr
	return setInfo[pokemon.species]["?"].vr;
};

teamrater.getThreatlist = function getThreatlist (build, setInfo, team, type, weights, priorities) {
	// make an array with the species ID and set ID of every threat
	let threats = [];
	for (let species in build) {
		if (type === "species")
			threats.push( brmt.tools.makePokemonObject(species, "species") );
		else {
			for (let set in build[species])
				threats.push( brmt.tools.makePokemonObject(species, set) );
		}
	}
	
	// attach scores to every one of these {species, set} combinations
	for (let threat of threats) {
		threat.score = {};
		threat.score.vr            = getViability(threat, setInfo);
		threat.score.viability     = scoreViability(threat);
		threat.score.species       = teamrater.scoreSpecies(build, threat, team, countTargetSpecies, weights);
		threat.score.set           = teamrater.scoreSet    (build, threat, team, countTargetSpecies, weights);
		threat.score.team          = teamrater.scoreSet    (build, threat, team, countTeamChecks,    weights);
		threat.score.teamviability = threat.score.team + threat.score.viability;
		threat.score.hashcode      = threat.species.hashCode();
	}
	
	// sort the array based on the above scoring functions
	threats = threats.sort( (a,b) => {
		for (p of priorities) {
			if(b.score[p] !== a.score[p])
				return b.score[p] - a.score[p];
		}
		return 0;
	});
	
	return threats;
};

})();