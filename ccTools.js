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
//         ThreatEntryToCGF(Threat, ThreatV2_hlOccurences, ThreatV3_hlDifferences)             //
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
var FilteredChecks;
var RatingCoeff = [0,0,0,0,0,0];

{
	var ChecksCompendium = OpenTextfile('OUcc.txt').join('\n');
	Checks = ChecksCompendiumToChecksArray(ChecksCompendium);//, true);
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
		result[DN].asHtml = ParseCompendium(  ThreatEntryToCGF( result[DN] )  );
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

var MinRating = 0;
var MaxRating = 0;

function Point_Rating(a,b,c,d,e,f) {
	var rating = RatingCoeff[GSI]*a + RatingCoeff[SSI]*b + RatingCoeff[NSI]*c
	           - RatingCoeff[invGSI]*d - RatingCoeff[invSSI]*e - RatingCoeff[invNSI]*f;
	return rating - MinRating;  // shift: make rating non-negative so we can use it as a heapsort array index
}

function SetRatingCoeff(Mode, NewValue) {
	if (Mode == 6)
		RatingCoeff = NewValue
	else RatingCoeff[Mode] = NewValue;
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
	var result = [];
	var Heaps = HeapSort(ChecksArray);
	for (var rating = 0; rating <= MaxRating; rating++) {
		if ( Heaps[rating] === undefined )
			continue;
//		result.push('\n(Threat rating: ' + (-MinRating() - rating) + ')\n')
		Heaps[rating] = Heaps[rating].sort(  function(a,b) { return a.Tiebreaker - b.Tiebreaker; }  );
		for (i = 0; i < Heaps[rating].length; i++) {
			var DN = ExtractDexNum( Heaps[rating][i][_SI] );
			result.push(  '', AddMouseover( DN, rating, ParseCompendium(AutocompletePokemon(DN)) ), ''  );
//			result.push(  '', AddMouseover( DN, Heaps[rating][i].asHtml ), ''  );
//			result.push(  '', ThreatEntryToCGF( Heaps[rating][i] ) , ''  );
//			result.push("\nNewline\nNewline\n");
		}
	}
	return result.join("\n");
//	DownloadTxt(result.join("\n"), 'cc.txt');
//	return ParseCompendium(result.join("\n"));
}

function ThreatEntryToCGF(Threat, ThreatV2_hlOccurences, ThreatV3_hlDifferences) {
	var result = [];
	if (ThreatV2_hlOccurences === undefined)
		ThreatV2_hlOccurences = [[],[],[],[],[],[]];
	if (ThreatV3_hlDifferences === undefined)
		ThreatV3_hlDifferences = [[],[],[],[],[],[]];
	
	result.push(Threat[_SI]);
	
	for (var Mode = GSI; Mode <= invNSI; Mode++) {
		if ( Mode == invGSI )
			result.push( '<hr>' );
		if (  ( Threat[Mode].length > 0 ) || ( ThreatV3_hlDifferences[Mode].length > 0 )  ) {
			if ( Mode != invGSI )
				result.push( "Newline" );
			result.push( Keywords[Mode] );
				for (k = 0; k < Threat[Mode].length; k++) {
					if (  ThreatV2_hlOccurences[Mode].indexOf( Threat[Mode][k] ) >= 0  )
						result.push( '<div style="display:inline-block; margin:1px; border: 1px solid Red">' )
					else result.push( '<div style="display:inline-block; margin:1px">' );
					result.push( Threat[Mode][k] );
					result.push( '</div>' );
				}
		}
	}
	
	return result.join('\n');
}

function AddMouseover(DN, rating, content) {
	var result = [];
	var theRating = -MinRating - rating;
	var theColor = (theRating > 0) ? 'Coral' : (theRating > -50) ? 'Orange' : (theRating > -5000) ? 'PowderBlue ' : 'PaleGreen';
	result.push( '<div style="display:inline-block; cursor:pointer; padding:5px; margin:5px; border: 2px solid Navy;'
	   + ' background-color:' + theColor + '; vertical-align:middle"'
	   + ' onclick="OnClick(\'' + DN + '\', this);">' );
	result.push( '<span style="float:left; font-size:7pt">' + theRating + '</span>' );
	result.push( content );
	result.push( '</div>' );
	return result.join("\n");
}

function OnClick(DN, Sender) {
	ShowPopout(    ParseCompendium(  ThreatEntryToCGF( Checks[DN], FilteredChecks[DN] ), true  ), Sender    );
//	ShowPopout( Checks[DN].asHtml );
}

function ShowPopout(content, Sender) {
	var mo = document.getElementById('mouseover');
	mo.innerHTML = content;
	mo.style.display = 'block';
	mo.style.right = '0px';
	mo.style.right = Math.max(mo.offsetLeft - Sender.offsetLeft, 0) + 'px';
	var maxTop = window.pageYOffset + window.innerHeight - mo.offsetHeight - 5;
	mo.style.top = maxTop + 'px';
	mo.style.top = (maxTop - Math.max(mo.offsetTop - Sender.offsetTop, 0)) + 'px';
}

/*function AddMouseover(DN, content) {
	var result = [];
	// Container X, with two divs in it (Y and Z) that can change visibility
	result.push(
	  '<div'
	   + ' style="display:inline-block"'
	   + ' onmouseenter="OnMouseEnter(\'' + DN + '\', this);"'
	   + ' onmouseleave="OnMouseLeave(this);">'
	)
	// Container Y, for the content
	result.push( '<div style="display:inline-block; padding:15px; margin:5px; border: 2px solid navy; vertical-align:middle">' );
	result.push( content );
	result.push( '</div>' );
	// Container Z, for the mouse-over
	result.push( '<div style="display:none; padding:15px; margin:5px; border: 2px solid navy"></div>' );
	result.push( '</div>' );
	return result.join("\n");
}

function OnMouseEnter(DN, Sender) {
	Sender.childNodes[3].innerHTML = Checks[DN].asHtml;
	Sender.childNodes[1].style.display = 'none';
	Sender.childNodes[3].style.display = 'inline-block';
}

function OnMouseLeave(Sender) {
	Sender.childNodes[1].style.display = 'inline-block';
	Sender.childNodes[3].style.display = 'none';
}*/