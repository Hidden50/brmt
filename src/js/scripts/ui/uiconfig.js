(function(){

window.project = window.project || {};
window.ui = project.ui = project.ui || {};
let config = ui.config = {};

config.about =
`<div id="slider_about_intro" class="slider">
	<h2>Credits</h2>
	<table>
		<tr><th>Programming</th><td><a target="_blank" rel="noopener" href="https://hidden50.github.io/">hidden50</a></td></tr>
		<tr><th>Artwork</th><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/ssensenh.289929/">Ssensenh</a></td></tr>
		<tr><th>Sprites</th><td><a target="_blank" rel="noopener" href="http://serebii.net/">Serebii.net</a></td></tr>
		<tr><th>Compendiums</th></tr>
		<tr><td>Gen7 OU</td><td><a target="_blank" rel="noopener" href="https://www.smogon.com/forums/members/jordy.395754/">jordy</a></td></tr>
		<tr><td>sumo OU</td><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/dk.322027/">dk</a></td></tr>
		<tr><td>Gen6 OU</td><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/agent-gibbs.117581/">Agent Gibbs</a>, <a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/tressed.123092/">Tressed</a></td></tr>
		<tr><td>Gen6 RU</td><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/arifeen.231398/">Arifeen</a></td></tr>
		<tr><td>Gen6 PU</td><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/anty.177336/">Anty</a></td></tr>
		<tr><td>Gen6 LC</td><td><a target="_blank" rel="noopener" href="http://www.smogon.com/forums/members/trash.235068/">Trash</a></td></tr>
	</table>
</div>
<div id="slider_about_viability" class="slider">
	<h2>The Team Tab</h2>
	<p>Click on a Pokémon to bring up its sets, then select one. Alternatively, you can type its name into the search field.</p>
</div>
<div id="slider_about_viability-sets" class="slider">
	<h2>Team Tab (by set)</h2>
	<p>Same as "Team", but shows by set instead of by species. Provides less overview, but you can add Pokémon with just a single click.</p>
</div>
<div id="slider_about_breakit" class="slider">
	<h2>Break it!</h2>
	<p>Your team's weakness to offensive threats. Anything with red color and / or a high number is probably dangerous.</p>
	<p>Click on a threat to see a popup with checks and counters to the individual sets it may have. You can click on Pokémon in that popup to add them to your team.</p>
	<p>GSI: <i>guaranteed switch-in</i><br>SSI: <i>situational switch-in</i><br>NSI: <i>non-switch-in</i></p>
</div>
<div id="slider_about_breakit-sets" class="slider">
	<h2>Break it! (by set)</h2>
	<p>Like "Break it!", but shows threats by set instead of by species. More precision, but less overview at a glance.</p>
</div>
<div id="slider_about_wallit" class="slider">
	<h2>Wall it!</h2>
	<p>Like "Break it!", but shows defensive threats as well as offensive.</p>
	<p>GSI: <i>guaranteed switch-in</i><br>SSI: <i>situational switch-in</i><br>NSI: <i>non-switch-in</i></p>
</div>
<div id="slider_about_wallit-sets" class="slider">
	<h2>Wall it! (by set)</h2>
	<p>Like "Wall it!", but shows threats by set instead of by species. More precision, but less overview at a glance.</p>
</div>
<div id="slider_about_faq" class="slider">
	<h2>Questions &amp; Answers</h2>
	<p>What people usually ask me.</p>
</div>
<div id="slider_about_compendium" class="slider">
	<h2>Compendium</h2>
	<p>The rating is based on a checks compendium. This tab contains the full compendium currently loaded into brmt.</p>
</div>
<div id="slider_about_builddata" class="slider">
	<h2>Build Data</h2>
	<p>The active compendium's data in text form.</p>
	<p>Feel free to replace it and test how it works. Hit "rebuild compendium" to apply your changes, or reload the page to discard them.</p>
	<p>If you end up making something, note that I can only accept what Smogon's quality control approves.</p>
</div>
<div id="slider_about_objectinspector" class="slider">
	<h2>Object Inspector</h2>
	<p>Programmers, welcome. This tab lets you see all of the project's variables and javascript functions.</p>
	<p>There's rather a lot of source code, but I've segmented it into small functional units so you shouldn't get lost too much.</p>
</div>
<div id="slider_about_revealhidden" class="slider">
	<h2>Advanced</h2>
	<p>Some tabs are hidden to improve readability. Click <i>+</i> to see them, <i>-</i> to hide them again.</p>
</div>
<div id="slider_about_team" class="slider">
	<h2>Team</h2>
	<p>Add Pokémon via the "Team" tab. You can click on one here to kick it back out.</p>
</div>
<div id="slider_about_loadteam" class="slider">
	<h2>load-team Button</h2>
	<p>Saving your own teams isn't implemented yet. Currently this button contains a few sample teams.</p>
</div>
<div id="slider_about_clearteam" class="slider">
	<h2>clear-team Button</h2>
	<p>Remove everything on your team and start from zero.</p>
</div>
<div id="slider_about_format" class="slider">
	<h2>Format Select</h2>
	<p>Smogon tiers Pokémon into the Tiers Ubers, OU, UU, RU, NU, PU and LC. Depending on which of the console games you are building teams for, you also need to select that generation.</p>
	<p>If you are building teams for a format other than gen7 OU, you need to select it here before brmt can analyze them.</p>
</div>
<div id="slider_about_search" class="slider">
	<h2>Pokémon Search</h2>
	<p>The search field lets you add Pokémon to your team by name. Use the up / down arrow keys to select a result and confirm it with Enter, or just click on one with your mouse.</p>
</div>`;

config.faq =
`<h2>Frequently asked questions:</h2>
<p>Q: What is brmt?<br>A: A tool to make threat lists for Pok&eacute;mon Teams. </p>
<p>Q: How does it work?<br>A: It goes through a list of stored answers to common threats and scores them based on the quality and quantity it finds on your team. Then it sorts that list based on those scores.</p>
<p>Q: What do GSI, SSI and NSI stand for?<br>A: They stand for <i>guaranteed switch-in</i>, <i>situational switch-in</i> and <i>non-switch-in</i>. These are the categories traditionally used for expressing how well a Pok&eacute;mon is checked by another.</p>
<p>Q: What do the colors mean?<br>A: Colors help you interpret the ratings. Usually green threats are well covered, blues are probably covered, orange threats aren't covered, and red threats also themselves check some of your team members.</p>
<p>Q: How do I make a checks compendium?<br>A: The <i>Data</i> tab shows the active compendium's data. Feel free to replace it and test how it works. If you end up making something, note that I can only accept what Smogon's quality control approves.</p>
<p>Q: I am interested in programming. Can I see the source code?<br>A: Brmt is open source, the source code can be found on <a target="_blank" rel="noopener" href="https://github.com/Hidden50/brmt">Github</a>. There is also an <a href="#objectinspector" id="link_objectinspector">object inspector</a> that contains the entire javascript source and all variables.</p>`;

config.threatlistParameters = {
	"team": {
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
	"team-sets": {
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
	"breakit-sets": {
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
	"wallit": {
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
	"wallit-sets": {
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