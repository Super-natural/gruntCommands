/******************************************
 *
 *	MASTER GRUNT SCRIPT
 *
 *	Open terminal at this file and type:
 *		grunt supply --src=../Folder/Containing/_gruntOpt.json (ie: ../Multi/970x250_v2)
 *
 *	for classic build OR:
 *		grunt --src=../Folder/Containing/_gruntOpt.json (ie: ../Multi/970x250_v2)
 *
 *	for supply folder
 *
 ******************************************/

var buildProcess = [
  'clean:build', 						// Clean working directory
	'cssmin', 								// CSS minify
	'concat', 								// JS concatenate
	'lineending',							// Unix newLine Concat fix
	'uglify', 								// JS uglify
	'targethtml', 						// HTML redirect src
	'replace:imgSrc',					// Change image sources to flat
	'replace:cssSrc',					// Change image sources to flat
  'replace:vidSrcJS',       // Change vid sources js
  'replace:vidSrcHTML',     // Change vid sources html
  'replace:debugMode',			// Turns debugmode off
	'pngmin', 								// PNG compress
	'copyto:media', 					// Directly copy media
	'copyto:manual', 					// Directly copy anything manually needed
	'clean:temp'							// Clean temp files
];

module.exports = function(grunt) {

		/**************
		 *
		 *	SETUP
		 *
		 **/

		// Get src directory from grunt input and populate or create all needed variables
		var srcDir = grunt.option('src') || "./",
				buildLoc = srcDir+"/build",
				tempLoc = "grunt",
				supplyLoc = srcDir+"/supply",
				cssObj = {},
				lineendingTempObj = {},
				uglifyTempObj = {},
				targetHtmlTempObj = {};

		// Read the creative's JSON file for specific variables
		var gruntOpts = grunt.file.readJSON(srcDir+"/_gruntOpt.json");

		// Populate output names
		var htmlName = "/"+gruntOpts.htmlName+".html";
		var zipName = "/"+gruntOpts.zipName+".zip";

		// JS Scripts to concatenate and minify (read from json)
		var srcJS = prependDir(gruntOpts.srcJS);

		// CSS Scripts to concatenate and minify (read from json)
		var srcCSS = prependDir(gruntOpts.srcCss);
		cssObj[buildLoc+'/All.min.css'] = srcCSS;

		// Files to manually copy direct to Build (read from json)
		var manualCopy = prependDir(gruntOpts.manualCopy);

		//Temp object population please don't touch
		lineendingTempObj[tempLoc+'/temp2.js'] = [tempLoc+'/temp.js'];
		uglifyTempObj[buildLoc+"/All.min.js"] = [tempLoc+'/temp2.js'];
		targetHtmlTempObj[tempLoc+'/'] = [srcDir+"/src/**.html"];

		//create supply process list
		var supplyProcess = buildProcess.concat(['clean:supply', 'compress:supply'])



		/**************
		 *
		 *	THE GRUNT TASKS
		 *
		 **/
  	grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),

			/**
			 *	Cleans folders
			 */
			clean: {
			  build: 	{
						src: [ buildLoc, tempLoc ],
						options: { force: true }
					},
			  temp: 	{
						src: [ tempLoc ]
					},
			  supply: {
						src: [ supplyLoc ],
						options: { force: true }
					}
			},

			/**
			 *	Concatenates and minifies CSS
			 */
			cssmin: {
			  combine: {	files: cssObj	}
			},

			/**
			 *	Contatenates JS
			 */
			concat: {
				dist: {
					src: srcJS,
					dest: tempLoc+'/temp.js'
				}
			},

			/**
			 *	LineEnding UNIX fix for JS parsing
			 */
			lineending: {
		    dist: {
		      options: {
		        eol: 'crlf'
		      },
		      files: lineendingTempObj
		    }
		  },

			/**
			 *	Uglifies Concatenated JS
			 */
			uglify: {
				options: {
					banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				dist: {	files: uglifyTempObj	}
			},

			/**
			 *	Changes Links in the HTML to Concat & Uglified JS & CSS
			 */
			targethtml: {
				dist: {
					files: targetHtmlTempObj
				}
			},

			/**
			 *	Replaces Img src in CSS and JS scripts
			 */
			replace: {
				imgSrc: {
					src: tempLoc+'/**.html',
					dest: buildLoc+htmlName,
					replacements: [
              {			from: 'src="_img/',				to: 'src="'
						},{			from: "src='_img/",				to: "src='"
						},{			from: 'src="img/',				to: 'src="'
						},{			from: "src='img/",				to: "src='"
						  }]
				},
				cssSrc: {
					src: buildLoc+'/**.css',
					dest: buildLoc+"/",
					replacements: [
              {			from: 'url("../_img/',		to: 'url("'
						},{			from: 'url(../_img/',			to: 'url('
						},{			from: 'url("../img/',			to: 'url("'
						},{			from: 'url(../img/',			to: 'url('
							}]
				},
        vidSrcJS: {
          src: buildLoc+'/All.min.js',
					dest: buildLoc+"/",
					replacements: [
              {			from: '_vid/',				    to: '',
						  }]
        },
        vidSrcHTML: {
          src: buildLoc+'/**.html',
					dest: buildLoc+"/",
					replacements: [
              {			from: '_vid/',				    to: '',
						  }]
        },
				debugMode: {
					src: buildLoc+'/All.min.js',
					dest: buildLoc+"/",
					replacements: [
              {			from: 'debugMode: true',	to: 'debugMode: false',
						},{			from: 'debugMode:true',		to: 'debugMode:false',
						},{			from: 'debugMode = true',	to: 'debugMode = false',
						},{			from: 'debugMode=!0',			to: 'debugMode=0',
						},{			from: 'debugMode:!0',			to: 'debugMode:0',
						  }]
				}
			},

			/**
			 *	Minify All .Pngs
			 */
			pngmin: {
				compile: {
					options: {
						concurrency: 8,             // specify how many exucutables get spawned in parallel
						ext: '.png',
						//colors: 128,                // reduce colors to 128
						quality: gruntOpts.imgQual,           // output quality should be between 65 and 80 like jpeg quality
						speed: 10,                  // pngquant should be as fast as possible
					},
					files: [{
						src: srcDir+"/src/_img/**.png",
						dest: buildLoc
					},{
						src: srcDir+"/src/img/**.png",
						dest: buildLoc
					}]
				}
			},

			/**
			 *	Copy Jpg & Video (and any other media or files)
			 */
			copyto: {
				media: {
					files: [{
							expand: true,
							src: [
									srcDir+"/src/*.{jpg,svg,gif,mp4,ogv,webm}",
									srcDir+"/src/_img/*.{jpg,svg,gif,mp4,ogv,webm}",
									srcDir+"/src/_vid/*.{jpg,svg,gif,mp4,ogv,webm}",
									srcDir+"/src/img/*.{jpg,svg,gif,mp4,ogv,webm}",
									srcDir+"/src/vid/*.{jpg,svg,gif,mp4,ogv,webm}"
									],
							dest: buildLoc,
							flatten: true
						}]
				},
				manual: {
					files: [{
							expand: true,
							src: manualCopy,
							dest: buildLoc,
							flatten: true
						}]
				},
			},

			/**
			 *	Compresses everything into a suppliable zip
			 */
			compress: {
				supply: {
					options: {
						archive: srcDir+"/supply/"+zipName,
						pretty: true
					},
					files: [{
							expand: true,
							flatten: true,
							cwd: buildLoc+"/",
							src: ['**.**'],
							dest: "/"
						}]
				}
			}
		});

	//Loading the various grunt packages
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-copy-to');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-targethtml');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-pngmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.loadNpmTasks('grunt-lineending');+"/"

	//putting together the tasks
	grunt.registerTask('supply', supplyProcess);
	grunt.registerTask('default', buildProcess);

	/**
	 *	A function that prepends the cwd to the start of all specified files
	 *
	 *	@method prependDir
	 *	@param {Array} inputArr The array of values to prepend to
	 *	@return {Array} A prepended array
	 */
	function prependDir(inputArr){
		var outputArr = [];
		for (var i = 0; i < inputArr.length; i++){
			outputArr.push(srcDir+inputArr[i]);
		}
		return outputArr;
	}
};
