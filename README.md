Breakmyteam
===========

This is a tool for generating threat lists for Pokémon Teams.

Brmt works by traversing a checks compendium; a list divided into six categories (GSI, SSI, NSI, GSI to, SSI to, NSI to) that represent how strong or weak other Pokémon are against said threat.
Breakmyteam assigns a score based on how many of the listed Pokémon from each category are present on the team it is rating. The list is then sorted by those scores, and the results are color coded to indicate low and high scores. Lower scores should indicate threats that the team is less prepared for.

The different files and what they do
------------------------------------

`/js/brmt/`:
 - `build.js` parses a checks compendium given to it in text form and outputs a format the tool can manipulate.
 - `aliases.js` deals with alternate names and makes sure you can write something like Charizard-Mega-Y and have brmt understand it's the same as 006-my
 - `teamrater.js` generates a threat list, assigns several different scores to the pokémon in it, and sorts it based on them
 - `htmloutput.js` formats the results as html
 - `brmtconfig.js` contains the default configuration for several settings, such as the scores assigned to the six compendium categories during rating
 - `brmttools.js` contains utility functions used by files in `/brmt/`
 
`/js/userinterface/`:
 - `eventlisteners.js` controls the behavior of the html elements in `index.html`
 - `ui.js` controls the various UI meta-features such as threatlist and popups
 - `uitools.js` contains utility functions used by files in `/userinterface/`
 
`/js/`:
 - `tools.js` contains utility functions used by all files
 
general:
 - `index.html` is the main file for this project. It specifies what other files a browser should load and contains the basic layout of the website
 - `index.css` contains style information that specifies how index.html should be displayed
 - `README.md` is this file. To understand recursion, you must first understand recursion