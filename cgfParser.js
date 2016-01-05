function quotes(S) { return "\"" + S + "\""; }


function Weblink(Dexnumber) {
	if (offline)
		return 'file:///C:/Users/Daniel/Dropbox/Public/CompGen/Serebii__Images/' + Dexnumber + '.png'
	else {
		if ( Dexnumber.substring(0, 4).toLowerCase() != "493-" )
			return "http://www.serebii.net/pokedex-xy/icon/" + Dexnumber + ".png"
		else {
			// Arceus formes are only available on this one site, afaik
			if (Dexnumber == '493-fairy')
				Dexnumber = '493-psychic';  // REALLY dirty fix for a missing image q_q
				                            // psychic color looks almost like fairy anyway
			return 'http://sprites.pokecheck.org/icon/' + Dexnumber + '.png'
		}
	}
// don't use this. Dropbox counts every single sprite as a file request, and kills your links if you have too many.
//	return 'https://dl.dropboxusercontent.com/u/9207945/CompGen/Serebii_Images/' + Dexnumber + '.png'
}

function DownloadTxt(content, name) {
	DownloadFile(content, name, 'text/plain');
}

function DownloadHtml(content, name) {
	DownloadFile(content, name, 'text/html');
}

function DownloadFile(content, name, type) {
//    var a = document.createElement("a");
    var file = new Blob([content], {type: type});
//    a.href = URL.createObjectURL(file);
//    a.download = name;
//    a.click();
	window.open(URL.createObjectURL(file));
}

function ParseCompendium(Compendium, MakeImagesClickable) {
	var Line = Compendium.split("\n");
	var result = "";
	
	for (var i in Line) {
		var p, q;
		p = Line[i].indexOf('|');
		if (p > 0) {
			q = Line[i].length - 1;
			while(Line[i].charAt(q) != '|')
				q--;
			var Dexnumber = Line[i].substring(0, p).trim();
			var Name = Line[i].substring(p+1, q).trim();
			var S = '<img src='
			      + quotes(Weblink(Dexnumber))
			      + ' alt='
			      + quotes(Name + ",")
			      + ' title='
			      + quotes(Name)
			      + ' style="vertical-align:middle"'
			      + '>';
			if (MakeImagesClickable !== undefined)
				S = MakeClickable(Dexnumber, S);
			S += Line[i].substring(q+1, Line[i].length);
		} else S = Line[i];
		
		S = S.replace('Newline', '<br>');
		S = S.replace('[B]', '<b>');
		S = S.replace('[I]', '<i>');
		S = S.replace('[U]', '<u>');
		S = S.replace('[/B]', '</b>');
		S = S.replace('[/I]', '</i>');
		S = S.replace('[/U]', '</u>');
		result += S + '\n';
	}
	return result;
}