/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
// ccTools.js                                                                                  //
//                                                                                             //
// Contains functions for manipulating Checks Compendiums and Checks Arrays,                   //
// and for generating html output from the above.                                              //
//                                                                                             //
//  1. INIT a Checks Array from a Checks Compendium                                            //
//         function ChecksCompendiumToChecksArray(ChecksArray, Boolean:CreateInverseEntries?)  //
//  2. FILTER entries from the ChecksArray. Select what shows up as Threats and Answers.       //
//         function FilterChacksArray(ChecksArray, Threats, Entries)                           //
//  3. SORT Threats from a ChecksArray by a rating function. (currently: heapsort)             //
//         function HeapSort(ChecksArray)                                                      //
//         function Point_Rating(a,b,c,d,e,f)                                                  //
//         function Threat_Rating(Threat)                                                      //
//  4. BUILD a ChecksArray into various formats.                                               //
//         -- Array Builder functions --                                                       //
//         ChecksArrayToHtml(ChecksArray)                                                      //
//         HtmlToHtmlpage(content)                                                             //
//         ChecksArrayToCGF(ChecksArray)                                                       //
//         ChecksArrayToTiles(ChecksArray)                                                     //
//         BuildChecksArray(ChecksArray, ThreatConverterFunction)                              //
//         -- Threat builder functions --                                                      //
//         ThreatToCGFBox(Threat, HighlightList)                                               //
//         ThreatToCGF(Threat)                                                                 //
//         BuildThreat(Threat, LineSep, invSep, EntryConverterFunction, ShowEmptySections)     //
//                                                                                             //
// Todo: Replace steps 1/3 with pre-parsed versions for accelerating the initial load.         //
//                                                                                             //
//                                                                                             //
// Terms:                                                                                      //
// COMPGEN FORMAT (cgf) - a lax inter-language format for any content with minisprites.        //
//     Lines starting with "DexNumber | Name |" will be replaced with the corresponding        //
//     sprite. Linebreaks are ignored; they can be used for formatting.                        //
//     "Newline" generates an actual linebreak in the output.                                  //
//     CompGen currently exports to html, png, or BBCode.                                      //
// CHECKS COMPENDIUM (cc) - a text file in CompGen format, with certain keywords that have to  //
//     be exactly matched. I.E., the list of GSIs is proceeded by 'GSI: ', NOT 'GSI:'.         //
//     OUcc hosted by Tressed www.smogon.com/forums/threads/ou-checks-compendium.3545711       //
//     RUcc hosted by Arifeen www.smogon.com/forums/threads/ru-checks-compendium-v2.3559443    //
//     UUcc, PUcc exist (I think)                                                              //
// CHECKS ARRAY (ca) - an Array[DexNumber][GSI..invNSI][0..k-1] with Strings in it.            //
//     Each string identifies a minisprite ("DexNumber | Name |").                             //
//     Array[DN].Tiebreaker contains a unique index for sorting. If the rating function        //
//         for two threats is a tie, their order will be decided by the Tiebreaker.            //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

var Keywords = ["GSI: ", "SSI: ", "NSI: ", "GSI to: ", "SSI to: ", "NSI to: ", " Checks"];
const GSI = 0;
const SSI = 1;
const NSI = 2;
const invGSI = 3;
const invSSI = 4;
const invNSI = 5;
const _SI = 6;

var Checks = [];
var FilteredChecks;
var RatingCoeff = [0,0,0,0,0,0];
var MinRating = 0;
var MaxRating = 0;

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  1. INIT a Checks Array from a Checks Compendium                                            //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

function ChecksCompendiumToChecksArray(ChecksCompendium, CreateInverseEntries) {
	var result = [];
	var Threats = ChecksCompendium.split('\n\nNewline\nNewline\n\n');
	var ModeLimit;
	if (CreateInverseEntries !== undefined)
		ModeLimit = NSI
	else ModeLimit = invNSI;
	for (var t in Threats) {
		var DN = ExtractDexNum(Threats[t]);
		if (result[DN] === undefined)
			result[DN] = [ [],[],[], [],[],[] ];
		var Categories = [];
		for (var Mode = GSI; Mode <= ModeLimit; Mode++)
			Categories[Mode] = Threats[t].split('\n' + Keywords[Mode] + '\n')[1];
		result[DN][_SI] = Threats[t].split('\nNewline\n')[0];
		result[DN].Tiebreaker = t;  // use the index from our checks compendium as the tiebreaker in our rating function
		for (var Mode = GSI; Mode <= ModeLimit; Mode++) {
			if (Categories[Mode] === undefined)
				result[DN][Mode] = []
			else result[DN][Mode] = Categories[Mode].split('\nNewline\n')[0].split('\n');
			if ( result[DN][Mode][0] === "|" )
				continue;
			if ( CreateInverseEntries !== undefined ) {
				// Create inverse entries
				// if we just added skarmory as an Excadrill GSI, add Excadrill as a Skarmory invGSI 
				for (k = 0; k < result[DN][Mode].length; k++) {
					var Defender = ExtractDexNum(result[DN][Mode][k]);
					if (result[Defender] === undefined) {
						var DefenderName = AutocompletePokemon(Defender)
						+ "[B][U]" + ExtractName(AutocompletePokemon(Defender)) + Keywords[_SI] + "[/U][/B]"
						result[Defender] = [ ["|"],["|"],["|"], [],[],[], DefenderName ];
					}
					result[Defender][Mode+3].push(AutocompletePokemon(DN));
				}
			}
		}
	}
	return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  2. FILTER entries from the ChecksArray. Select what shows up as Threats and Answers.       //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

function FilterChecksArray(ChecksArray, Threats, Entries) {
	var result = [];
	for (var DN in ChecksArray) {
//		if ( Threats.indexOf(DN) >= 0 ) {
			result[DN] = [ [],[],[], [],[],[], ChecksArray[DN][_SI] ];
			result[DN].Tiebreaker = ChecksArray[DN].Tiebreaker;
			for (var Mode = GSI; Mode <= invNSI; Mode++)
				result[DN][Mode] = ArrayIntersect(ChecksArray[DN][Mode], Entries);
//				result[DN][Mode] = ChecksArray[DN][Mode].filter( function(e){return Entries.indexOf(e) >= 0} );
//		}
	}
	return result;
}

function ArrayIntersect(Arr1, Arr2) {
	if (Arr2[0] === "|")
		return Arr1;
	if (Arr1[0] === "|")
		return Arr1;
	var result = [];
	for (var i = 0; i < Arr1.length; i++) {
		if ( Arr2.indexOf(Arr1[i]) >= 0 )
			result.push(Arr1[i]);
	}
	return result;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  3. Sort Threats from a ChecksArray by a rating function. (currently: heapsort)             //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

function HeapSort(ChecksArray) {
	var result = [];
	for (var DN in ChecksArray) {
		var rating = Threat_Rating(ChecksArray[DN]);
		if (result[rating] === undefined)
			result[rating] = [];
		result[rating].push(ChecksArray[DN]);
	}
	return result;
}

function Point_Rating(a,b,c,d,e,f) {
	var rating = RatingCoeff[GSI]*a + RatingCoeff[SSI]*b + RatingCoeff[NSI]*c
	           - RatingCoeff[invGSI]*d - RatingCoeff[invSSI]*e - RatingCoeff[invNSI]*f;
	return rating - MinRating;  // shift: make rating non-negative so we can use it as a heapsort array index
}

function SetRatingCoeff(NewValue) {
	RatingCoeff = NewValue;
	MinRating = Point_Rating(0,0,0,51,51,51) + MinRating;  // MinRating=Point_Rating(0,0,0,51,51,51), but without the shift
	MaxRating = Point_Rating(51,51,51,0,0,0);
}

function Threat_Rating(Threat) {
	return Point_Rating( CountPokemon(Threat[GSI]), CountPokemon(Threat[SSI]), CountPokemon(Threat[NSI]),
	 CountPokemon(Threat[invGSI]), CountPokemon(Threat[invSSI]), CountPokemon(Threat[invNSI]) );
}

function CountPokemon(PokeArray) {
	if (PokeArray[0] == "|") return 50  // threat has no compendium entry, assume it's super easy to check.
	else return PokeArray.length;       // this sends it to the bottom, unless we rate for defensive threats (0,0,0,11,7,3)
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  4. BUILD a ChecksArray into html.                                                          //
//  or: BUILD a ChecksArray-Entry into the CompGen format                                      //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

function ChecksArrayToHtml(ChecksArray) {
	return ParseCompendium( ChecksArrayToCGF(ChecksArray) );
}
function HtmlToHtmlpage(content) {
return '<html>\n<head>\n<base href="http://hidden50.github.io/brmt/">\n</head>\n'
	 + '<style>img { vertical-align: middle; }</style>\n\n<body>\n\n'
	 + content + '\n\n</body>\n</html>';
}
function ChecksArrayToCGF(ChecksArray) {
	return BuildChecksArray(
		ChecksArray,
		function(Threat, rating) {
			return ThreatToCGF(Threat);
		} 
	).join('\n\nNewline\nNewline\n\n');
}
function ChecksArrayToTiles(ChecksArray) {
	return BuildChecksArray(
		ChecksArray,
		function(Threat, rating) {
			var DN = ExtractDexNum( Threat[_SI] );
			return AddTile( DN, rating, ParseCompendium(AutocompletePokemon(DN)) );
		} 
	).join('\n\n');
}
function BuildChecksArray(ChecksArray, ThreatConverterFunction) {
	var result = [];
	var Heaps = HeapSort(ChecksArray);
	for (var rating = 0; rating <= MaxRating; rating++) {
		if ( Heaps[rating] !== undefined ) {
			Heaps[rating] = Heaps[rating].sort(  function(a,b) { return a.Tiebreaker - b.Tiebreaker; }  );
			for (i = 0; i < Heaps[rating].length; i++)
				result.push(  ThreatConverterFunction( Heaps[rating][i], rating )  );
		}
	}
	return result;
}


function ThreatToCGFBox(Threat, HighlightList) {
	return BuildThreat(
		Threat, '\nNewline\n', '\n<hr>\n',
		function(Entry) {
			var result = [];
			if (  Entries.indexOf( Entry ) >= 0  )
				result.push( '<div style="display:inline-block; margin:1px; border: 1px solid Red">' )
			else result.push( '<div style="display:inline-block; margin:1px">' );
			result.push( Threat[Mode][k] );
			result.push( '</div>' );
			return result.join('\n');
		}, true
	);
}
function ThreatToCGF(Threat) {
	return BuildThreat(
		Threat, '\nNewline\n', '\nNewline\n',
		function(Entry) {
			return Threat[Mode][k];
		}
	);
}
function BuildThreat(Threat, LineSep, invSep, EntryConverterFunction, ShowEmptySections) {
	var result = [ [],[],[], [],[],[] ];
	for (Mode = GSI; Mode <= invNSI; Mode++) {
		for (k = 0; k < Threat[Mode].length; k++)
			result[Mode].push(  EntryConverterFunction( Threat[Mode][k] )  );
		result[Mode] = result[Mode].join('\n');
		if (  (result[Mode].length > 0) || ShowEmptySections  )
			result[Mode] = Keywords[Mode] + '\n' + result[Mode];
	}
	var result1 = result.splice(0,3).filter( function(e) {return e.length > 0} ).join(LineSep);
	var result2 = result.filter( function(e) {return e.length > 0} ).join(LineSep);
	return Threat[_SI] + LineSep + result1 + invSep + result2;
}

//surround with colored tile and onclick info
function AddTile(DN, rating, content) {
	var result = [];
	var theRating = -MinRating - rating;
	var theColor = (theRating > 0) ? 'Coral' : (theRating > -50) ? 'Orange' : (theRating > -5000) ? 'PowderBlue ' : 'PaleGreen';
	result.push( '<div class = "brmtTile" style="background-color:' + theColor + '; vertical-align:middle"'
	   + ' onclick="OnClickInfo(\'' + DN + '\', this);">' );
	result.push( '<span style="float:left; font-size:7pt">' + theRating + '</span>' );
	result.push( content );
	result.push( '</div>' );
	return result.join("\n");
}

// add onclick info only
function AddOnClickInfo(DN, content) {
	var result = [];
	result.push( '<div style="display:inline-block; cursor:pointer; vertical-align:middle"'
	   + ' onclick="OnClickInfo(\'' + DN + '\', this);">' );
	result.push( content );
	result.push( '</div>' );
	return result.join("\n");
}

function OnClickInfo(DN, Sender) {
	ShowPopout(  'onclickinfo_popout', Sender,
	             ParseCompendium( ThreatToCGFBox(Checks[DN], FilteredChecks[DN]), true )
	);
}

function ShowPopout(elID, Sender, content) {
	var mo = document.getElementById(elID);
	var XOffset = Sender.offsetLeft, YOffset = Sender.offsetTop;
	if (mo.contains(Sender)) {
		XOffset += mo.offsetLeft;  // adjustment for relative position inside a popout box
		YOffset += mo.offsetTop;
	}
	if (content)
		mo.innerHTML = content;
	mo.style.display = 'block';
	mo.style.right = '0px';
	mo.style.right = Math.max(mo.offsetLeft - XOffset, 0) + 'px';
	var maxTop = window.pageYOffset + window.innerHeight - mo.offsetHeight - 5;
	mo.style.top = maxTop + 'px';
	mo.style.top = (maxTop - Math.max(mo.offsetTop - YOffset, 0)) + 'px';
}