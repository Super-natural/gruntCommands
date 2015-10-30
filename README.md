# Super natural Grunt commands

Terminal command for build:
```grunt supply --src=../Folder/Containing/_gruntOpt.json (ie: ../Multi/970x250_v2)```

Terminal command for supply:
```grunt --src=../Folder/Containing/_gruntOpt.json (ie: ../Multi/970x250_v2)```



# _gruntOpt.json setup
These JSON files control individual build variables including names of files and zips and all included scripts to copy, merge, contatenate, uglify etc.



### Default:
```
{
	"htmlName": "endHTMLName",
	"zipName": "endZipName",
	"imgQual": "65-80",
	"srcCss": [
		"/src/css/css_adMain.css"
	],
	"srcJS": [
	  "/src/js/js_timeline.js",
	  "/src/js/js_utils.js",
	  "/src/js/js_superTween.js",
	  "/src/js/js_dateLogic.js",
	  "/src/js/js_adMain.js"
	],
	"manualCopy": [

	]
}
```

### FT:
```
{
	"imgQual": "65-80",

	"parentFiles": {
		"name": "nameOfOutputParent",
		"srcCss": [
			"/parent/**/_css/css_parent.css"
		],
		"srcJS": [
		  "/parent/**/_js/js_loader_itv.js",
		  "/parent/**/_js/js_parent.js"
		],
		"manualCopy": [
			"/parent/**/manifest.js"
		]
	},

	"childFiles": {
		"name": "nameOfOutputChild",
		"srcCss": [
			"/richLoads/**/_css/css_vid.css",
			"/richLoads/**/_css/css_adMain.css"
		],
		"srcJS": [
		  "/richLoads/**/_js/lib/js_superTween.min.js",
		  "/richLoads/**/_js/js_ftVid.js",
		  "/richLoads/**/_js/js_dateLogic.js",
		  "/richLoads/**/_js/js_utils.js",
		  "/richLoads/**/_js/js_timeline.js",
		  "/richLoads/**/_js/js_adMain.js"
		],
		"manualCopy": [

		]
	}
}

```

# Folder setup
## Default
```
.
│  _gruntOpt.json
│  build
│  src
│   │─── index.html
│   │─── _img
│   │      imgFiles.jpg/svg/gif/png
│   │─── _vid
│   │      videoFiles.webm/ogv/mp4
│   │───_css
│   │      cssFiles.css
│   └───_js
│          jsFiles.js
│
│  backup
     backupImg.jpg
```

## FT
```
.
│  _gruntOpt_FT.json
│  backup
│    backupImg.jpg/gif/png
│  parent
│   └─── parentSrc
│           │─── _img
│           │      imgFiles.jpg/svg/gif/png
│           │─── _css
│           │      cssFiles.css
│           │─── _js
│           │      jsFiles.js
│           │ index.html
│           └ manifest.js
│
│  richLoads
│   └─── childSrc
│           │─── _img
│           │      imgFiles.jpg/svg/gif/png
│           │─── _css
│           │      cssFiles.css
│           │─── _vid
│           │      videoFiles.mp4/webm/ogv
│           │─── _js
│           │      jsFiles.js
│           └ index.html.js
```

