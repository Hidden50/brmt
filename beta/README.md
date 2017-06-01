Breakmyteam
===========

This is a tool for generating threat lists for Pokémon Teams.

Brmt works by traversing a checks compendium; a list divided into six categories (GSI, SSI, NSI, GSI to, SSI to, NSI to) that represent how strong or weak other Pokémon are against said threat.
Breakmyteam assigns a score based on how many of the listed Pokémon from each category are present on the team it is rating. The list is then sorted by those scores, and the results are color coded to indicate low and high scores. Lower scores should indicate threats that the team is less prepared for.

The different files and what they do
------------------------------------

 - `build.js` parses a checks compendium given to it in text form and outputs a format the tool can manipulate.
 - `aliases.js` deals with alternate names and makes sure you can write something like Charizard-Mega-Y and have brmt understand it's the same as 006-my
 - `teamrater.js` generates a threat list, assigns several different scores to the pokémon in it, and sorts it based on them
 - `htmloutput.js` formats the results as html
 - `tools.js` contains a bag of utility functions used in this project
 - `config.js` contains the default configuration for several settings, such as the scores assigned to the six compendium categories during rating
 - `test.html` contains test cases and sample code for making sure the above units work correctly
 - `index.html` is the main file for this project. 
 - `index.css` contains style information that specifies how index.html should look
 - `frontend.js` controls the behavior of the html elements in `index.html`
 - `README.md` is this file. To understand recursion, you must first understand recursion