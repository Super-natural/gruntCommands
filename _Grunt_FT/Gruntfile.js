/******************************************
 *
 *	MASTER GRUNT SCRIPT FOR FT
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
	 'chmod',
	 'clean:supply',						// Clean Supply folder files
	 'clean:temp',					  	// Clean temp files
	 'cssmin', 									// CSS minify
	 'concat', 									// JS concatenate
	 'lineending',							// Unix newLine Concat fix
	 'uglify', 									// JS uglify
	 'targethtml', 							// HTML redirect src
   'replace:debugModeParent',	// Turns debugmode off
   'replace:debugModeChild',	// Turns debugmode off
   'replace:imgSrcParent',		// Turns debugmode off
   'replace:imgSrcChild',			// Turns debugmode off
   'replace:cssSrcParent',		// Turns debugmode off
   'replace:cssSrcChild',			// Turns debugmode off
	 'pngmin', 									// PNG compress
	 'copyto', 									// Directly copy media
	 'replace:manifest',				// Turns debugmode off
	 'compress',								// Make the zip folders
	 'clean:temp'								// Clean temp files
];



module.exports = function(grunt) {

		/**************
		 *
		 *	SETUP
		 *
		 **/

		// Get src directory from grunt input and populate or create all needed variables
		var srcDir = grunt.option('src'),

				tempLoc = "grunt",
				supplyLoc = srcDir+"/supply",
				buildLoc = "build",

				cssObj = {},
				lineendingObj = {},
				uglifyObj = {},
				targetHtmlTempObj = {};
				manualCopyObj = {};

		// Read the creative's JSON file for specific variables
		var gruntOpts = grunt.file.readJSON(srcDir+"/_gruntOpt_FT.json");

		// Populate output names
		var zipParent = "/"+gruntOpts.parentFiles.name+".zip";
		var zipChild = "/"+gruntOpts.childFiles.name+".zip";

		// JS Scripts to concatenate and minify (read from json)
		var srcJS_parent = prependDir(gruntOpts.parentFiles.srcJS);
    var srcJS_child = prependDir(gruntOpts.childFiles.srcJS);

		// CSS Scripts to concatenate and minify (read from json)
		var srcCSS_parent = prependDir(gruntOpts.parentFiles.srcCss);
		cssObj[tempLoc+'/parent/All.min.css'] = srcCSS_parent;

		var srcCSS_child = prependDir(gruntOpts.childFiles.srcCss);
    cssObj[tempLoc+'/child/All.min.css'] = srcCSS_child;

		//Temp object population please don't touch
		lineendingObj[tempLoc+'/parentTemp/lineEnded.js'] = [tempLoc+'/parentTemp/concatenated.js'];
		lineendingObj[tempLoc+'/childTemp/lineEnded.js'] = [tempLoc+'/childTemp/concatenated.js'];
		uglifyObj[tempLoc+"/parent/All.min.js"] = [tempLoc+'/parentTemp/lineEnded.js'];
		uglifyObj[tempLoc+"/child/All.min.js"] = [tempLoc+'/childTemp/lineEnded.js'];
		targetHtmlTempObj[tempLoc+'/parentTemp/'] = [srcDir+"/parent/**/**.html"];
		targetHtmlTempObj[tempLoc+'/childTemp/'] = [srcDir+"/richLoads/**/**.html"];
		manualCopyObj["parent"] = prependDir(gruntOpts.parentFiles.manualCopy);
		manualCopyObj["child"] = prependDir(gruntOpts.childFiles.manualCopy);

		//create supply process list
		//var supplyProcess = buildProcess.concat(['clean:supply', 'compress:supply'])



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
			  all: {	files: cssObj	},
				//child: {	files: cssObj_child	}
			},

			/**
			 *	Contatenates JS
			 */
			concat: {
				parent: {
					src: srcJS_parent,
					dest: tempLoc+'/parentTemp/concatenated.js'
				},
				child: {
					src: srcJS_child,
					dest: tempLoc+'/childTemp/concatenated.js'
				}
			},

			/**
			 *	LineEnding UNIX fix for JS parsing
			 */
			lineending: {
		    all: {
		      options: {
		        eol: 'crlf'
		      },
		      files: lineendingObj
		    }
		  },

			/**
			 *	Uglifies Concatenated JS
			 */
			uglify: {
				options: {
					banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
				},
				dist: {	files: uglifyObj	}
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
				debugModeParent: {
					src: tempLoc+'/parent/All.min.js',
					dest: tempLoc+'/parent/All.min.js',
					replacements: [{		from: 'debugMode: true',			to: 'debugMode: false',
											 },{		from: 'debugMode:true',				to: 'debugMode:false',
										 	 },{		from: 'debugMode = true',			to: 'debugMode = false',
										 	 },{		from: 'debugMode=!0',					to: 'debugMode=0',
										 	 },{		from: 'debugMode:!0',					to: 'debugMode:0',
										 		}]
				},
				debugModeChild: {
					src: tempLoc+'/child/All.min.js',
					dest: tempLoc+'/child/All.min.js',
					replacements: [{		from: 'debugMode: true',			to: 'debugMode: false',
											 },{		from: 'debugMode:true',				to: 'debugMode:false',
										 	 },{		from: 'debugMode = true',			to: 'debugMode = false',
										 	 },{		from: 'debugMode=!0',					to: 'debugMode=0',
										 	 },{		from: 'debugMode:!0',					to: 'debugMode:0',
										 		}]
				},
				imgSrcParent: {
					src: tempLoc+'/parentTemp/**.html',
					dest: tempLoc+'/parent/',
					replacements: [{		from: 'src="_img/',						to: 'src="'
											 },{		from: "src='_img/",						to: "src='"
											 },{		from: 'src="img/',						to: 'src="'
											 },{		from: "src='img/",						to: "src='"
											 }]
				},
				imgSrcChild: {
					src: tempLoc+'/childTemp/**.html',
					dest: tempLoc+'/child/',
					replacements: [{		from: 'src="_img/',						to: 'src="'
											 },{		from: "src='_img/",						to: "src='"
											 },{		from: 'src="img/',						to: 'src="'
											 },{		from: "src='img/",						to: "src='"
											 }]
				},
				cssSrcParent: {
					src: tempLoc+'/parent/All.min.css',
					dest: tempLoc+'/parent/All.min.css',
					replacements: [{		from: 'url("../_img/',				to: 'url("'
											 },{		from: 'url(../_img/',					to: 'url('
											 },{		from: 'url("../img/',					to: 'url("'
											 },{		from: 'url(../img/',					to: 'url('
											 }]
				},
				cssSrcChild: {
					src: tempLoc+'/child/All.min.css',
					dest: tempLoc+'/child/All.min.css',
					replacements: [{		from: 'url("../_img/',				to: 'url("'
											 },{		from: 'url(../_img/',					to: 'url('
											 },{		from: 'url("../img/',					to: 'url("'
											 },{		from: 'url(../img/',					to: 'url('
											 }]
				},
				manifest: {
						src: tempLoc+"/parent/manifest.js",
						dest: tempLoc+"/parent/manifest.js",
						replacements: [{		from: '"src": "childSrc"',				to: '"src": "'+gruntOpts.childFiles.name+'"'
												 },{		from: '"src":"childSrc"',					to: '"src": "'+gruntOpts.childFiles.name+'"'
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
						src: srcDir+"/parent/**/_img/**.png",
						dest: tempLoc+"/parent/"
					},{
						src: srcDir+"/richLoads/**/_img/**.png",
						dest: tempLoc+"/child/"
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
								srcDir+"/parent/**/_img/*.{jpg,svg,gif,mp4,ogv,webm}",
								],
						dest: tempLoc+"/parent/",
						flatten: true
						},{
						expand: true,
						src: [
								srcDir+"/richLoads/**/_img/*.{jpg,svg,gif,mp4,ogv,webm}",
								],
						dest: tempLoc+"/child/",
						flatten: true
						}]
				},
				extras: {
					files: [{
						expand: true,
						src: manualCopyObj.parent,
						dest: tempLoc+"/parent/",
						flatten: true
					},{
						expand: true,
						src: manualCopyObj.child,
						dest: tempLoc+"/child/",
						flatten: true
					}]
				},
				backup: {
					files: [{
						expand: true,
						src: srcDir+"/backup/**.**",
						dest: srcDir+"/supply/",
						flatten: true
					}]
				}
			},

			/**
			 *	Compresses everything into a suppliable zip
			 */
			compress: {
				parent: {
					options: {
						archive: srcDir+"/supply"+zipParent,
						pretty: true
					},
					files: [{
							expand: true,
							flatten: false,
							cwd: tempLoc+"/parent/",
							src: [
								'**.**',
								'**/**.**'
							],
							dest: "../"
						}]
				},
				child: {
					options: {
						archive: srcDir+"/supply"+zipChild,
						pretty: true
					},
					files: [{
							expand: true,
							flatten: false,
							cwd: tempLoc+"/child/",
							src: [
								'**.**',
								'**/**.**'
							],
							dest: "/"
						}]
				}
			},

			chmod: {
		    options: {
		      mode: '777',
					expand: true
		    },
		    yourTarget1: {
		      // Target-specific file/dir lists and/or options go here.
		      src: [
						srcDir+"/**.**",
						srcDir+"/**/**.**",
						srcDir+"/**/**/**.**",
						srcDir+"/**/**/**//**.**"
					]
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
	grunt.loadNpmTasks('grunt-lineending');
	grunt.loadNpmTasks('grunt-chmod');

	//putting together the tasks
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
