<!DOCTYPE html>
<html>

<head>
	<title>brmt</title>
</head>

<style>
	input[type=number] {
		width: 60px;
		text-align: right;
	}
	div.infopopout {
		display: none;
		position: absolute;
		background-color: white;
		padding: 15px;
		margin: 5px;
		border: 4px solid Black;
	}
	button {
		margin: 3px;
	}
	a.javascriptlink {
		text-decoration: underline;
		text-decoration-color: blue;
		cursor: pointer;
		color:blue;
	}
	img {
		vertical-align: middle;
	}
	div.brmtTile {
		display: inline-block;
		cursor: pointer;
		padding: 5px;
		margin: 5px;
		border: 2px solid Navy;
	}
	div.brmtTile-highlighted {
		display: inline-block;
		cursor: pointer;
		padding: 5px;
		margin: 5px;
		background-color: LawnGreen!important;
		border: 2px solid Red;
	}
	div.brmtTile-subtle {
		padding: 0px;
		margin: 0px;
		background-color: transparent;
		border: none;
	}
</style>

<body>

<!--Page Title-->
<h2 style="display: inline-block; margin-right:.25em">OU Weakness Checker (BreakMyTeam)</h2>
<a target="_blank" style="font-size:10pt" href="About.html">
	About this tool
</a>

<!--Settings-->
<span style="float:right"><!--
<span style="position:absolute; right:6px; top:6px"><!---->
	<button onclick="RatCoeffChange([10000,100,2,11,7,3]);">Break it!<br>[10000,100,2,11,7,3]</button>
	<button onclick="RatCoeffChange([0,0,0,11,7,3]);">Wall it!<br>[0,0,0,11,7,3]</button>
	<button onclick="RatCoeffChange([0,0,0,0,0,0]);">Unsorted<br>[0,0,0,0,0,0]</button>
	<button onClick="ShowPopout('ratfunction', this);">Custom rating function<br>[ , , , , , ]</button>
	<div style="margin-top:5px">
		<select ID="ccSelector" onchange="SetChecksCompendium(this.value);">
			<!--<option value="UBcc.txt" disabled>Ubers does not exist yet</option>-->
			<option value="OUcc.txt" selected>OU Checks Compendium by Tressed</option>
			<!--<option value="UUcc.txt" disabled>UU does not exist yet</option>-->
			<option value="RUcc.txt">RU Checks Compendium by Arifeen</option>
			<!--<option value="NUcc.txt" disabled>NU does not exist yet</option>-->
			<option value="PUcc.txt">PU Checks Compendium by Anty</option>
			<option value="LCcc.txt">LC Checks Compendium by Trash</option>
		</select>
		<button class="btn-xs" style="font-size:8pt" onclick="ShowPopout('tools', this);">edit</button>
		<button class="btn-xs" style="font-size:8pt" onclick="ccSelector.onchange();">reload and discard changes</button>
	</div>
</span>

<!-- Main div -->
<div>
<!-- leftside main div -->
<!-- select team members -->
<div style="float:left; margin-right:25px; width:25%; display:inline-block">
	<h3>Add Team Members</h3>
	<form id="form1" onsubmit="document.getElementById('0').onclick(); return false;">
		Filter: <input name="name" type="text" size="20"
		               oninput = "UpdateAutocompleteResults()" onpropertychange="UpdateAutocompleteResults()">
		<a class="javascriptlink" onclick="urlparam=''; AddToTeam('');">Clear Team</a>
	</form>
	<p id="demo">Loading..</p>
</div>

<!-- rightside main div -->
<!-- print team and threatlist -->
<div ID="rightsideDiv" style="float:left; width:73%; display:inline-block">
	<h3>Team</h3>
	<p id="team"></p>
	
	<h3>Threatlist</h3>
	<p id="threatlist"></p>
</div>

</div>
<!-- /Main div -->

<!---------------------------------------------------------------------------------------------->
<!-- Popout page elements -->
<!---------------------------------------------------------------------------------------------->

<!-- OnClick-Info to show a Pokémon's Compendium Entry -->
<div ID="onclickinfo_popout" class="infopopout" onmouseleave="this.style.display = 'none';"></div>

<!-- Rating Function Menu -->
<div ID="ratfunction" class="infopopout" onmouseleave="this.style.display = 'none'; RatCoeffChange();">
	<span>Rating function:</span> 
	<table style="display:inline-block; margin-bottom:0px; vertical-align:middle";>
		<tr>
			<td><input type="number" ID="RatCoeffSel0"></td> <td>+</td>
			<td><input type="number" ID="RatCoeffSel1"></td> <td>+</td>
			<td><input type="number" ID="RatCoeffSel2"></td> <td>-</td>
			<td><input type="number" ID="RatCoeffSel3"></td> <td>-</td>
			<td><input type="number" ID="RatCoeffSel4"></td> <td>-</td>
			<td><input type="number" ID="RatCoeffSel5"></td>
		</tr>
		<tr>
			<td align="center">GSI</td><td></td>
			<td align="center">SSI</td><td></td>
			<td align="center">NSI</td><td></td>
			<td align="center">gsi</td><td></td>
			<td align="center">ssi</td><td></td>
			<td align="center">nsi</td>
		</tr>
	</table>
</div>

<!-- Tools Menu -->
<div ID="tools" class="infopopout" onmouseleave="this.style.display = 'none';">
	<center style="background-color:lightblue"><b>Edit the checks compendium directly in the threatlist. (coming soon)</b></center>
	<h3>Tools for Compendium Authors:</h3>
	<button onclick="OpenHtml(  HtmlToHtmlpage( ChecksArrayToHtml(Checks) )  );">Export to Html</button><br>
	<button onclick="OpenTxt( ChecksArrayToCGF(Checks) );">Export to CompGen format (.txt)</button><br>
	<button onclick="cgfTextarea.value = ChecksArrayToCGF(Checks);
	                 ShowPopout( 'importcompendium', this );">Edit in CompGen format</button>
	<button onclick="ShowPopout( 'importcompendium', this );">Reveal textarea as-was</button><br>
	<button onclick="cgfTextarea.value = ''; ShowPopout( 'importcompendium', this );">Import from CompGen format</button>
</div>

<!-- textarea for importing compendiums -->
<div ID="importcompendium" class="infopopout" onmouseleave="this.style.display = 'none';">
	<textarea ID="cgfTextarea" style="width:90vw; height:60vh"></textarea>
	<button onclick="SetChecksCompendium( this.previousElementSibling.value, true );">import</button>
</div>
<!-- /Popout page elements -->

</body>







<!--  Begin messy section. Skip it, I'll get back to cleaning this up later  -Orda -->











	<script>
		const LayeredOnClickInfo = false;
		window.onload = init;
		var Threats = ["|"];
		var Entries = ["|"];
		var urlparam;
		
		function init() {
			// direct all keyboard input to the edit field
			document.onkeydown = function (e) {
				if (cgfTextarea === document.activeElement)
					return;
				if (e.keyCode === 38) window.scrollBy(0, -50)  // arrow key up
				else if (e.keyCode === 40) window.scrollBy(0, 50)  // arrow key down
				else {
					document.getElementById("form1").elements["name"].focus();
					return;
				}
				document.getElementById("form1").elements["name"].blur();
			}
			document.onkeyup = function (e) {
				if (cgfTextarea === document.activeElement)
					return;
				if (!document.getElementById("form1").elements["name"].value)
					document.getElementById("form1").elements["name"].blur();
			}
			urlparam = getUrlParam('team=');
			// pokemon identifiers contain a-z, A-Z, 0-9 and "-". Treat everything else as a separator
			urlparam = urlparam.replace(/([^a-zA-Z0-9\-])+/g, ',');
			UpdateAutocompleteResults();
			SetChecksCompendium(document.getElementById('ccSelector').value);
			AddToTeam('');
			RatCoeffChange([10000,100,2,11,7,3]);  // init rating function
		}
		
/*		function HtmlToSVG(htmldata) {
			var DOMURL = window.URL || window.webkitURL || window;
			var data =
			  '<svg xmlns="http://www.w3.org/2000/svg">' +
                '<foreignObject width="80%" height="100%">' +
                  '<div xmlns="http://www.w3.org/1999/xhtml">' +
                    htmldata.split('style="vertical-align:middle">\n</div>').join('style="vertical-align:middle"/>\n</div>').split('<br>').join('<br/>').split('<hr>').join('<hr/>').split('src="').join('src="http://hidden50.github.io/brmt/') +
                  '</div>' +
                '</foreignObject>' +
              '</svg>';
			var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
			var url = DOMURL.createObjectURL(svg);
//			window.open(url);
			
			var canvas = document.getElementById('MyCanvas');
			var ctx    = canvas.getContext('2d');
			
			var img = new Image();
			img.onload = function () {
				ctx.drawImage(img, 0, 0);
				DOMURL.revokeObjectURL(url);
				alert('test');
			}
			
			img.src = url;
//			var png = new Blob([img], {type: 'image/png'});
//			var url = DOMURL.createObjectURL(png);
//			window.open(url);
		}*/
		
		function RatCoeffChange(NewValue) {
			if (!NewValue) {
				NewValue = [];
				for (Mode = 0; Mode <= 5; Mode++)  // synch Htmlelements -> Rating Function
					NewValue[Mode] = document.getElementById("RatCoeffSel" + Mode).value;
			} else {
				for (var Mode = 0; Mode <= 5; Mode++)  // synch Rating Function -> Htmlelements
					document.getElementById("RatCoeffSel" + Mode).value = NewValue[Mode];
			}
			SetRatingCoeff(NewValue);
			threatlist.innerHTML = ChecksArrayToTiles(FilteredChecks);
		}
		
		function SetChecksCompendium(Link, CreateInverseEntries) {
			var comp = CreateInverseEntries ? Link : OpenTextfile(Link).join('\n');
			Checks = ChecksCompendiumToChecksArray( comp, CreateInverseEntries );
			FilteredChecks = FilterChecksArray(Checks, Threats, Entries);
			threatlist.innerHTML = ChecksArrayToTiles(FilteredChecks);
		}
		
		function UpdateAutocompleteResults() {
			demo.innerHTML = ParseCompendium(AutocompleteList( document.getElementById("form1").elements["name"].value ));
			if (!document.getElementById("form1").elements["name"].value)
				document.getElementById("form1").elements["name"].blur();
			
			var Images = document.getElementsByTagName('img');
			for (i in Images) {
				if (Images[i].title) {
					if ( document.getElementById("form1").elements["name"].value && Images[i].title.toLowerCase().indexOf(document.getElementById("form1").elements["name"].value.toLowerCase()) > -1 )
						Images[i].parentNode.setAttribute('class', 'brmtTile-highlighted');
					else Images[i].parentNode.setAttribute('class', 'brmtTile');
				}
			}
		}
		
		function AddToTeam(DexnumberOrName) {
			// update the "urlparam" variable
			// by adding the mon if it's not in there, removing it if it is
			// (toggle)
			var temp = urlparam.split(',');
			urlparam = [];
			var newGuy;
			var alreadyExists = false;
			if (DexnumberOrName.length > 0)
				newGuy = AutocompletePokemon(DexnumberOrName);
			else newGuy = "";
			for (var i = 0; i < temp.length; i++) {
				if (temp[i].length > 0) {
					temp[i] = ExtractDexNum(AutocompletePokemon(temp[i]));
					if ( newGuy.indexOf(temp[i]) >= 0 )
						alreadyExists = true
					else urlparam.push(temp[i]);
				}
			}
			if ( (DexnumberOrName.length > 0) && (!alreadyExists) )
				urlparam.push(DexnumberOrName);
			urlparam = urlparam.join(',');
			
			// change the current url and page title to reflect the updated team
			if (urlparam.length == 0) {
				history.pushState({}, "", location.pathname);
				document.title = "brmt";
			} else {
				history.pushState({}, "", "?team=" + urlparam);
				temp = urlparam.split(',');
				for (var i = 0; i < temp.length; i++)
					temp[i] = ExtractName(AutocompletePokemon(temp[i]))
				document.title = "brmt - " + temp.join(", ");
			}
			
			// print the team
			var result2 = [];
			var temp = urlparam.split(',');
			for (var t in temp) {
				if (temp[t].length > 0)
					result2.push( '<div class="brmtTile brmtTile-subtle">', AutocompletePokemon(temp[t]), '</div>' );
			}
			team.innerHTML = ParseCompendium( result2.join("\n"), true );
			
			// print the threatlist
			Entries = [];//["|"];
			var temp2 = urlparam.split(",");
			for (var t in temp2) {
				if (temp2[t].length > 0)
					Entries[t] = AutocompletePokemon(temp2[t]);
			}
			FilteredChecks = FilterChecksArray(Checks, Threats, Entries);
			
			threatlist.innerHTML = ChecksArrayToTiles(FilteredChecks);
			
			
			document.getElementById("form1").elements["name"].value = '';
			document.getElementById("form1").elements["name"].blur();
			document.getElementById("form1").elements["name"].oninput();
		}
		
		function getUrlParam(keyword) {
			var param = location.search.split(keyword).splice(1).join('').split('&')[0];
			// replace %20 with spaces, and so on.
			return decodeURIComponent(param);
		}
	</script>


<!-- end messy section -->


	<script src="cgfParser.js"></script>
	<script src="cgfAutocomplete.js"></script>
	<script src="ccTools.js"></script>

</html>
