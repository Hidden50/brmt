var _autocomplete_StartIndex = -1;
var _AutocompleteList;

//if (offline) 
//	_AutocompleteList = OpenTextfile('file:///C:/Users/Daniel/Dropbox/Public/CompGen/full%20Sourcecode/v1_2/_autocomplete.txt')
//else _AutocompleteList = OpenTextfile('https://dl.dropboxusercontent.com/u/9207945/CompGen/full%20Sourcecode/v1_2/_autocomplete.txt');
_AutocompleteList = OpenTextfile('autocomplete.txt');

var found = false;

function OpenTextfile(url)
{
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain; charset=ISO-8859-1');
	xhr.open('GET', url, false);
	xhr.send(null);
	return xhr.responseText.split('\r\n').join('\n').split('\n');
}

function ExtractDexNum(pokemon) {
	return pokemon.split('|')[0].trim();
}

function ExtractName(pokemon) {
	return pokemon.split('|')[1].trim();
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

function AutocompletePokemon(trigger, OmitToRestart) {
	// OmitToRestart: Starts searching from zero, unless otherwise specified
	if (OmitToRestart === undefined)
		_autocomplete_StartIndex = -1;
	
	if (trigger.length == 0)
		trigger = "|";  // match empty search strings onto anything that's a table
	var result = trigger;
	found = false;
	trigger = trigger.toUpperCase();
	
	var start = _autocomplete_StartIndex;
	// search the autocomplete file starting at line "start"
	for (var i = 1; i <= _AutocompleteList.length; i++) {
		var line = (start + i) % _AutocompleteList.length;
		var Row = _AutocompleteList[line].toUpperCase();
		var p, q;
		p = Row.indexOf(trigger);
		if (p > -1) {
			// found a match
			q = p + trigger.length - 1;
			
			found = true;
			result = _AutocompleteList[line];
			_autocomplete_StartIndex = line;  // put a bookmark in case we want to search further
			
			// Lando -> Landorus-t is ok, but not Landorus -> Landorus-t
			// (don't pull up wrong matches because of usage, if a full name was typed in)
			// likewise, 212 -> 212-m is a no-go.
			
			if(     (     (p == 0)
			           || (Row.charAt(p-1) == " ")
			        )
			     && (     (q == Row.length + 1)
			           || (Row.charAt(q+1) == " ")
			           || (Row.charAt(q+1) == "-")
			        )
			)
			{
				// full word was typed in, rather than just a part.
				// require a 1:1 match with the result
				if ( trigger.trim() != ColumnAtPosition(Row, p) ) {
//					window.alert(  trigger.trim() + ' != ' + ColumnAtPosition(Row, p)  );
					continue;  // No exact match, keep looking :(
					// if we don't find an exact match at all, we still take it though
					// (already assigned result, Completion and the new StartIndex)
				}
			}
			// since we didn't exit at the continue statement just now,
			// apparently we've found a good match
			return result;
		}
	}
	return result;
}

function AutocompleteList(trigger) {
	var result = "";
	var count = 0;
	
	var current = AutocompletePokemon(trigger);
	if (!found)
		return "";
	var i_Start = _autocomplete_StartIndex;
	do {
		result += MakeClickable( current, current + current.replace("|", "").replace("|", ""), count )
			   +  "\nNewline\n";
		current = AutocompletePokemon(trigger, true);
		count++;
	} while (  (_autocomplete_StartIndex > i_Start) && (count < 50)  );
	if (_autocomplete_StartIndex > i_Start)
		result += "\n...";
	return result;
}