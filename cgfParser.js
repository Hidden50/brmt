function quotes(S) { return "\"" + S + "\""; }


function Weblink(Dexnumber) {
	return 'Serebii__Images/' + Dexnumber + '.png';
}

function DownloadTxt(content, name) {
	DownloadFile(content, name, 'text/plain');
}

function DownloadHtml(content, name) {
	DownloadFile(content, name, 'text/html');
}

function DownloadFile(content, name, type) {
	var file = new Blob([content], {type: type});
	window.open(URL.createObjectURL(file));
//	var a = document.createElement("a");
//	a.href = URL.createObjectURL(file);
//	a.download = name;
//	a.click();
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