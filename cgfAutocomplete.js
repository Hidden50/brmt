var _autocomplete_StartIndex = -1;

var _AutocompleteList = OpenTextfile('autocomplete.txt');
// make extra entries for full name / dexnumber lookup
for (var line = 0; line < _AutocompleteList.length; line++) {
	if ( _AutocompleteList[line].indexOf('|') >= 0 ) {
		var entry = _AutocompleteList[line];
		_AutocompleteList['e' + ExtractDexNum(entry).toLowerCase()] = entry;
		_AutocompleteList['e' + ExtractName(entry).toLowerCase()] = entry;
	}
}

function ExtractDexNum(pokemon) { return pokemon.split('|')[0].trim(); }
function ExtractName(pokemon) { return pokemon.split('|')[1].trim(); }

function OpenTextfile(url)
{
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain; charset=ISO-8859-1');
	xhr.open('GET', url, false);
	xhr.send(null);
	return xhr.responseText.split('\r\n').join('\n').split('\n');
}


function MakeClickable(pokemon, visibleHtml, id) {
	if (visibleHtml === undefined)
		visibleHtml = pokemon;
	return '<span style="cursor: pointer" id="'
	+ id
	+ '" onclick="AddToTeam(\''
	+ ExtractDexNum(pokemon)
	+ '\');">\n'
	+ visibleHtml
	+ '\n</span>';
}

function ColumnAtPosition(TableRow, Position) {
	
	// helper function: select the whole column around a search match
	// for example:
	//              "302-m        | Sableye-Mega      | "
	// becomes
	//              "SABLEYE-MEGA",
	//
	// if p is any position in the second column
	//
	
	var p = Position;
	var q = Position;
	while ( (p > -1) && (TableRow.charAt(p) != "|") )
		p--;
	while ( (q < TableRow.length) && (TableRow.charAt(q) != "|") )
		q++;
	return TableRow.substring(p+1, q-1).trim().toUpperCase();
}

var found = false;

function AutocompleteList(trigger) {
	var result = [];
	var count = 0;
	
	var current = AutocompletePokemon(trigger);
	if (!found)
		return "";
	var i_Start = _autocomplete_StartIndex;
	do {
		result.push(  MakeClickable( current, current + current.replace("|", "").replace("|", ""), count )  )
		result.push( 'Newline' );
		current = AutocompletePokemon(trigger, true);
		count++;
	} while (  (_autocomplete_StartIndex > i_Start) && (count < 10)  );
	if (_autocomplete_StartIndex > i_Start)
		result.push( '...' );
	return result.join('\n');
}

function AutocompletePokemon(trigger, OmitToRestart) {
	theTrigger = trigger.toLowerCase();
	// look up if it's a full name / dex number
	if ( _AutocompleteList['e' + theTrigger] !== undefined )
		return _AutocompleteList['e' + theTrigger];
	
	// it's no full name / DN, so we return the first string to contain the trigger

	// OmitToRestart: Starts searching from zero, unless otherwise specified
	if (OmitToRestart === undefined)
		_autocomplete_StartIndex = -1;
	
	if (theTrigger.length == 0) theTrigger = '|';  // match empty search strings onto anything that's a table
	
	found = false;
	var start = _autocomplete_StartIndex;
	// search the autocomplete file starting at line start
	for (var i = 1; i <= _AutocompleteList.length; i++) {
		var line = (start + i) % _AutocompleteList.length;
		if (_AutocompleteList[line].toLowerCase().indexOf(theTrigger) >= 0) {
			found = true;
			// put a bookmark for the next search in case we want to search for another completion of the trigger
			_autocomplete_StartIndex = line;
			return _AutocompleteList[line];
		}
	}
	// nothing was found
	return trigger;
}