window.trim = x => x.trim();

window.htmlDetails = (summary, details) => `<details><summary>${summary}</summary>${details}</details>`;

window.showPopout = function showPopout (containerID, Sender, contentHtml) {
	// Sender: Attempts to position the popout above this element.
	//         We can't use mouse coordinates, because the popout can also be spawned using the keyboard
	var container = document.getElementById(containerID);
	var XOffset = Sender.offsetLeft, YOffset = Sender.offsetTop;
	if (container.contains(Sender)) {
		XOffset += container.offsetLeft;  // adjustment for relative position inside a popout box
		YOffset += container.offsetTop;
	}
	if (contentHtml)
		container.innerHTML = contentHtml;
	container.style.display = 'block';
	
	container.style.right = '0px';
	container.style.right = Math.max(container.offsetLeft - XOffset, 0) + 'px';
	
	var maxTop = window.pageYOffset + window.innerHeight - container.offsetHeight - 15;
	container.style.top = maxTop + 'px';
	container.style.top = (maxTop - Math.max(container.offsetTop - YOffset, 0)) + 'px';
}