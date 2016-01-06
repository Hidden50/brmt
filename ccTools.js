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
//  4. BUILD a ChecksArray into html.                                                          //
//         function ChecksArrayToHtml(ChecksArray)                                             //
//         function AddMouseover(DN, content)                                                  //
//  or BUILD a ChecksArray-Entry into the CompGen format                                       //
//         function ThreatEntryToCGF(Threat)                                                   //
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
//     Array[DN].asHtml contains a pre-parsed version.                                         //
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

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  1. INIT a Checks Array from a Checks Compendium                                            //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

var Checks = [];

{
	var ChecksCompendium; 
//	if (offline)
//		ChecksCompendium = OpenTextfile('file:///C:/Users/Daniel/Dropbox/Public/CompGen/Output/Compendiums_txt/OU_Checks_Sorted2.txt').join('\n')
//	else ChecksCompendium = OpenTextfile('https://dl.dropboxusercontent.com/u/9207945/CompGen/Output/Compendiums_txt/OU_Checks_Sorted2.txt').join('\n');
	ChecksCompendium = OpenTextfile('OUcc.txt').join('\n');
	Checks = ChecksCompendiumToChecksArray(ChecksCompendium);
}

function ChecksCompendiumToChecksArray(ChecksCompendium, CreateInverseEntries) {
	var result = [];
	var Threats = ChecksCompendium.split('\n\nNewline\nNewline\n\n');
	for (var t in Threats) {
		var DN = ExtractDexNum(Threats[t]);
		if (result[DN] === undefined)
			result[DN] = [[], [], [], [], [], []];
		result[DN].asHtml = ParseCompendium(Threats[t], true);
		var Categories = [];
		for (var Mode = GSI; Mode < _SI; Mode++)
			Categories[Mode] = Threats[t].split('\n' + Keywords[Mode] + '\n')[1];
		result[DN][_SI] = Threats[t].split('\nNewline\n')[0];
		result[DN].Tiebreaker = t;  // use the index from our checks compendium as the tiebreaker in our rating function
		for (var Mode = GSI; Mode < _SI; Mode++) {
			if (Categories[Mode] === undefined)
				result[DN][Mode] = []
			else result[DN][Mode] = Categories[Mode].split('\nNewline\n')[0].split('\n');
			if ( result[DN][Mode][0] === "|" )
				continue;
			if ( CreateInverseEntries === undefined )
				continue;
			// if we just added skarmory as an Excadrill GSI, add Excadrill as a Skarmory invGSI 
/*			for (k = 0; k < result[DN][Mode].length; k++) {
				var Defender = ExtractDexNum(result[DN][Mode][k]);
				if (result[Defender] === undefined) {
					var DefenderName = AutocompletePokemon(Defender)
					  + "[B][U]" + ExtractName(AutocompletePokemon(Defender)) + Keywords[_SI] + "[/U][/B]"
					result[Defender] = [["|"], ["|"], ["|"], [], [], [], DefenderName];
				}
				result[Defender][Mode+3].push(AutocompletePokemon(DN));
			}*/
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
			result[DN] = [[], [], [], [], [], [], ChecksArray[DN][_SI]];
			result[DN].Tiebreaker = ChecksArray[DN].Tiebreaker;
			for (var Mode = GSI; Mode < _SI; Mode++)
				result[DN][Mode] = ArrayIntersect(ChecksArray[DN][Mode], Entries);
//		}
	}
	// Pre-parse html to speed up the HeapSorting process
	for (var DN in result)
		result[DN].asHtml = ParseCompendium(  ThreatEntryToCGF( result[DN] ).join("\n")  );
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
//		var Threat = ChecksArray[DN];
//		ChecksArray[DN][_SI] = Threat[GSI].length + " " + Threat[SSI].length + " " + Threat[NSI].length + " " + 
//		                       Threat[invGSI].length + " " +  Threat[invSSI].length + " " +  Threat[invNSI].length + "\n" +
//		                       ChecksArray[DN][_SI];
		if (result[rating] === undefined)
			result[rating] = [];
		result[rating].push(ChecksArray[DN]);
	}
	return result;
}

var RatingCoeff = [];
var MinRating = -31800;
var MaxRating = 32300 - MinRating;

function Point_Rating(a,b,c,d,e,f) {
	var rating = RatingCoeff[GSI]*a + RatingCoeff[SSI]*b + RatingCoeff[NSI]*c
	           - RatingCoeff[invGSI]*d - RatingCoeff[invSSI]*e - RatingCoeff[invNSI]*f;
	return rating - MinRating;  // make rating non-negative so we can use it as a heapsort array index
}

function SetRatingCoeff(Mode, NewValue) {
	if (Mode == 6)
		RatingCoeff = NewValue
	else RatingCoeff[Mode] = NewValue;
	MinRating += Point_Rating(0,0,0,51,51,51);
	MaxRating = Point_Rating(51,51,51,0,0,0) - MinRating;
}

function Threat_Rating(Threat) {
	return Point_Rating( CountPokemon(Threat[GSI]), CountPokemon(Threat[SSI]), CountPokemon(Threat[NSI]),
	 CountPokemon(Threat[invGSI]), CountPokemon(Threat[invSSI]), CountPokemon(Threat[invNSI]) );
}

function CountPokemon(PokeArray) {
	if (PokeArray[0] == "|") return 50
	else return PokeArray.length;
}

/////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                             //
//  4. BUILD a ChecksArray into html.                                                          //
//  or: BUILD a ChecksArray-Entry into the CompGen format                                      //
//                                                                                             //
/////////////////////////////////////////////////////////////////////////////////////////////////

function ChecksArrayToHtml(ChecksArray) {
	var result = [];
	var Heaps = HeapSort(ChecksArray);
	for (var rating = 0; rating < MaxRating; rating++) {
		if ( Heaps[rating] === undefined )
			continue;
//		result.push('\n(Threat rating: ' + (-MinRating() - rating) + ')\n')
		Heaps[rating] = Heaps[rating].sort(  function(a,b) { return a.Tiebreaker - b.Tiebreaker; }  );
		for (i = 0; i < Heaps[rating].length; i++) {
			var DN = ExtractDexNum( Heaps[rating][i][_SI] );
			result.push(  '', AddMouseover( DN, Heaps[rating][i].asHtml ), ''  );
//			result.push("\nNewline\nNewline\n");
		}
	}
	return result.join("\n");
}

function ThreatEntryToCGF(Threat) {
	var result = [];
	
	result.push(Threat[_SI]);
	
	if (  (Threat[invGSI].length + Threat[invSSI].length + Threat[invNSI].length) > 0  ) {
		result.push("(Threatens ");
		for (var Mode = invGSI; Mode <= invNSI; Mode++) {
			if (  ( Threat[Mode].length > 0 ) && ( Threat[Mode][0] !== "|" ) )
				result.push( Threat[Mode].join("\n") );
		}
		result.push(")");
	}
	
	for (var Mode = GSI; Mode <= NSI; Mode++) {
		if (  ( Threat[Mode].length > 0 ) && ( Threat[Mode][0] !== "|" ) ) {
			result.push( "Newline" );
			result.push( Keywords[Mode] );
			result.push( Threat[Mode].join("\n") );
		}
	}
	
	return result;
}

function AddMouseover(DN, content) {
	var result = [];
	// Container X, with two divs in it (Y and Z) that can change visibility
	result.push(
	  '<div'
	   + ' id="Threat_' + DN + '" style="display:inline-block; padding:15px; margin:5px; border: 2px solid navy; vertical-align:middle"'
	   + ' onmouseenter="OnMouseEnter(\'' + DN + '\', this);"'
	   + ' onmouseleave="this.childNodes[1].style.display = \'inline-block\'; this.childNodes[3].style.display = \'none\';">'
	)
	// Container Y, for the content
	result.push( '<div style="display:inline-block">' );
	result.push( content );
	result.push( '</div>' );
	// Container Z, for the mouse-over
	result.push( '<div style="display:none"></div>' );
	result.push( '</div>' );
	return result.join("\n");
}

function OnMouseEnter(DN, Sender) {
	Sender.childNodes[3].innerHTML = Checks[DN].asHtml;
	Sender.childNodes[1].style.display = 'none';
	Sender.childNodes[3].style.display = 'inline-block';
}