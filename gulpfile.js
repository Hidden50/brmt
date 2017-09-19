'use strict';

/*****************************************
******************************************
			BUILD DEPENDENCIES
******************************************
*****************************************/

// for general file and stream operations
const gulp = require('gulp');
const argv = require('yargs').argv;
const connect = require('gulp-connect');
const ifElse = require('gulp-if-else');
const replace = require('gulp-replace');
const rename = require("gulp-rename");
const concat = require('gulp-concat');
const del = require('del');
const cache = require('gulp-cached');
const buffer = require('vinyl-buffer');
const merge = require('merge-stream');

// for js
const uglify = require('gulp-uglify-es').default;

// for css
const cleanCSS = require('gulp-clean-css');
const postcss = require('gulp-postcss');
const uncss = require('postcss-uncss');
const criticalSplit = require('postcss-critical-split');

// for html
const nunjucksRender = require('gulp-nunjucks-render');

// for png
const spritesmith = require('gulp.spritesmith');
const imgmin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

/*****************************************
******************************************
				TASKS
******************************************
*****************************************/

gulp.task('css', ['inlineCSS', 'stylesheet'])
gulp.task('inlineCSS', function() {
	return gulp.src('src/css/*.css')
	.pipe(concat('inline.min.css'))
	.pipe(postcss([ criticalSplit({output: 'critical'}) ]))
	.pipe(ifElse( !argv.concat, cleanCSS ))
	.pipe(cache('styles'))
	.pipe(gulp.dest('src/html/templates/'));
});
gulp.task('stylesheet', function() {
	return gulp.src('src/css/*.css')
		.pipe(concat('stylesheet.min.css'))
		.pipe(postcss([ criticalSplit({output: 'rest'}) ]))
		.pipe(ifElse( !argv.concat, cleanCSS ))
		.pipe(cache('styles'))
		.pipe(gulp.dest('www/'));
});
gulp.task('vendor', function() {
	return gulp.src('src/css/vendor/*.css')
		.pipe(concat('vendor.css'))
		.pipe(postcss([ uncss({html: ['www/index.html']}) ]))
		.pipe(replace( /^([\r\n\w\W]*)$/, "/* critical:start */\r\n\r\n$1\r\n\r\n/* critical:end */" ))
		.pipe(gulp.dest('src/css/'))
});

gulp.task('scripts', function() {
	return gulp.src('src/js/scripts/**')
		.pipe(concat('scripts.min.js'))
		.pipe(ifElse( !argv.concat, uglify ))
		.pipe(gulp.dest('www/'));
});

gulp.task('service-worker', function() {
	return gulp.src('src/js/service-worker.js')
		.pipe(replace( /{%INSERT-DATE%}/, new Date().toISOString() ))
		.pipe(rename('sw.min.js'))
		.pipe(ifElse( !argv.concat, uglify ))
		.pipe(gulp.dest('www/'));
});

gulp.task('html', function() {
	return gulp.src('src/html/pages/**')
	.pipe(nunjucksRender({ path: ['src/html/pages', 'src/html/templates'] }))
	.pipe(gulp.dest('www/'));
});

gulp.task('watch', function() {
	gulp.watch('src/css/*.css', ['css', 'service-worker']);
	gulp.watch('src/js/scripts/**', ['scripts', 'service-worker']);
	gulp.watch('src/js/service-worker.js', ['service-worker']);
	gulp.watch('src/html/**', ['html', 'service-worker']);
});

gulp.task('server', function() {
	return connect.server({ port: 8889 });
});

gulp.task('default', ['watch', 'css', 'scripts', 'server']);  // vendor and html tasks missing

gulp.task('cleanup', function() {
	return del([
		'src/html/templates/inline.min.css',
		'www/*.min.css',
		'www/*.min.js',
		'www/*.html'
	]);
});

gulp.task('spritesheet', function() {
	const filenames = ["003","003-m","006","006-mx","006-my","009","009-m","015-m","018-m","024","026","031","034","035","036","037","038","038-a","042","045","050","051","055","062","063","064","065","065-m","067","069","072","073","076","077","078","079","080","080-m","081","082","084","085","089-a","090","091","092","094","095","097","099","103","105","105-a","106","108","109","110","113","114","120","121","122","123","124","125","127-m","128","130","130-m","131","135","137","138","139","141","142","142-m","144","145","149","151","160","170","171","176","178","181-m","184","186","189","190","195","196","198","199","200","208-m","209","210","211","212","212-m","214","214-m","215","217","221","226","227","228","229","229-m","230","233","237","239","240","242","243","244","245","248","248-m","251","254","254-m","255","260-m","262","263","272","275","276","279","282-m","286","288","291","292","295","297","302","302-m","303","303-m","304","306","306-m","308","308-m","310","310-m","313","315","317","318","319","319-m","322","323-m","324","326","328","329","330","334-m","338","341","342","345","346","348","354-m","356","359","359-m","362-m","367","368","369","373","375","376-m","378","379","380","380-m","381","385","389","391","392","395","398","405","408","419","422","423","425","426","428-m","429","432","434","435","437","441","442","444","445","445-m","446","447","448","449","450","452","453","454","459","460","460-m","461","462","463","464","465","468","470","472","473","474","475","475-m","476","477","478","479","479f","479h","479m","479s","479w","480","481","485","488","490","494","495","496","497","500","503","508","510","512","514","516","518","523","529","530","531","531-m","532","533","534","537","539","545","546","547","550","552","554","557","559","560","561","563","564","566","567","568","569","574","578","579","581","586","589","590","591","592","593","594","597","598","600","601","604","606","609","611","612","614","617","618","619","621","624","625","626","628","629","630","632","634","635","636","637","638","639","640","641-s","642","642-s","645-s","646","646-b","647","648","650","651","652","655","658","658-a","659","660","661","662","663","666","673","674","675","676","679","680","682","683","687","688","689","690","691","693","696","697","698","699","700","701","703","706","707","709","710","711","713","715","718","718-10","719","719-m","720","720-u","721","724","730","748","752","771","774","778","785","786","787","788","793","794","796","797","798","800","801","aerodactylite","alakazite","assaultvest","blacksludge","cameruptite","charizarditex","charizarditey","chartiberry","choiceband","choicescarf","choicespecs","damprock","darkiniumz","dragoniumz","electricseed","electriumz","eviolite","fightiniumz","figyberry","firiumz","flameorb","flyiniumz","focussash","galladite","garchompite","gardevoirite","ghostiumz","grassiumz","grassyseed","groundiumz","gyaradosite","heracronite","iciumz","leftovers","lifeorb","lightclay","lopunnite","magnet","manectite","mawilite","medichamite","mentalherb","normaliumz","pidgeotite","pinsirite","rockiumz","rockyhelmet","sablenite","scizorite","sharpedonite","shedshell","slowbronite","steeliumz","swampertite","thickclub","toxicorb","tyranitarite","venusaurite","wateriumz"];
	const filepaths = (filenames || ["*"]).map(f => `src/sprites/${f}.png`);

	const spriteData = gulp.src(filepaths)
		.pipe(spritesmith({
			imgName: 'sprites.png',
			cssName: 'sprites.css',
			cssTemplate: function (data) {  // convert sprites from array of object to css string
				let spriteCSS = data.sprites.map( (sprite) => {
					const expectedDimensions = sprite.name.match(/^\d/) ? 32 : 24;  // 32 for pokemon, 24 for item sprites
					let dimensions = "";
					if (sprite.width !== expectedDimensions)
						dimensions += `\r\n\twidth: ${sprite.width}px;`;
					if (sprite.height !== expectedDimensions)
						dimensions += `\r\n\theight: ${sprite.height}px;`;
					
					return `.sprite-${sprite.name} {\r\n\tbackground-position: ${sprite.offset_x}px ${sprite.offset_y}px;${dimensions}\r\n}`;
				}).join("\r\n");
				return `/* sprites map, autogenerated with gulp.spritesmith */\r\n\r\n${spriteCSS}`;
			}
		}));

	const imgStream = spriteData.img
		.pipe(buffer())
		.pipe(imgmin([pngquant()]))
		.pipe(gulp.dest('www/'));

	const cssStream = spriteData.css.pipe(gulp.dest('src/css'));

	return merge(imgStream, cssStream);
});