
function FilesystemModifier(path) {
	this.path = path;
}

FilesystemModifier.prototype.start = function() {
	console.info("Inside start, path: " + this.path);
};

module.exports = FilesystemModifier;
