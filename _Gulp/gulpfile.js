/*****
 *  Super Natural Gulp automation file
 *  v0.0.5 written 16/12/2015 by Steve
 *
 *  default terminal command is:
 *  gulp --src ../location/of/_gulpOpt/file/
 *  eg: gulp --src ../Multi/970x250_v1/
 *
 */

 var myGulp = myGulp || {}

    //gulp dependencies
var gulp =          require("gulp"),
    gutil =         require('gulp-util'),
    concat =        require("gulp-concat"),
    lec =           require('gulp-line-ending-corrector'),
    rename =        require('gulp-rename'),
    concatCss =     require('gulp-concat-css'),
    cssmin =        require("gulp-cssmin"),
    usemin =        require('gulp-usemin'),
    replace =       require("gulp-replace"),
    imagemin =      require('gulp-imagemin'),
    gzip =          require("gulp-gzip"),
    zip =           require("gulp-zip"),
    uglifycss =     require('gulp-uglifycss'),
    uglify =        require('gulp-uglify'),
    chmod =         require('gulp-chmod'),
    rimraf =        require('gulp-rimraf'),

    //node dependencies
    lazypipe =      require('lazypipe'),
    pngquant =      require('imagemin-pngquant'),
    fs =            require("fs"),

    originlocation,
    runningTasks = [],
    buildList = [];

/**
 *  Generic Log function
 *
 *  @method log
 *  @param {String} m Message to log
 */
myGulp.log = function(m){
  gutil.log(m)
}


/**
 *  Checks if doing multiple files TODO
 *
 *  @method setup
 */
 gulp.task("default", function(){
  console.log("");  console.log("");  console.log("");  console.log("");  console.log("");  console.log("");


  //The original curData.location, this is passed in through the terminal command
  originlocation, i = process.argv.indexOf("--src");
  if(i >- 1) {  originlocation = process.argv[i+1];}

  //are we doing one build? or all of the builds? TODO
  // allBuilds, i = process.argv.indexOf("--allBuilds");
  // if(i>-1) {  allBuilds = process.argv[i+1]; }
  var numBuilds = [originlocation]; //this will be a list of all the builds



  /**
   * Loop through all builds and run gulp commands
   */
  for (var i = 0; i < numBuilds.length; i++){
    var newData = myGulp.readJSON(numBuilds[i]);
    var buildType = myGulp.checkType(newData);

    var count = 1;
    buildType.forEach(function(curData){
      var l = curData.location,
          ds = curData.dataSrc,
          po = myGulp.pipeOpts,
          d = curData.dest,
          build = curData.buildName,
          name = curData.htmlName;

      console.log("")
      console.log("-------------- setting up build "+count+" of "+buildType.length+" ---------------")
      console.log("")
      count++;

      gulp.task(build+"_clean", function() {
          gulp
            .src(curData.supply+"**/*", { read: false})
            .pipe(rimraf({ force: true }));

          gulp
            .src(curData.supply+"**/*", { read: false})
            .pipe(rimraf({ force: true }));
      });

      gulp.task(build+"_html", function() {
        runningTasks.push(build+"_html")
          gulp
            .src(l+"*.html")
            .pipe(rename(name+".html"))
            .pipe(po.processHTML())
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_html")});
      });

      gulp.task(build+"_js", function() {
        runningTasks.push(build+"_js")

        for (var i = 0; i < ds.srcJS.length; i++){
          ds.srcJS[i] = l+ds.srcJS[i];
        }
          gulp
            .src(ds.srcJS)
            .pipe(po.processJS())
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_js")});
      });

      gulp.task(build+"_css", function() {
        runningTasks.push(build+"_css")

        for (var i = 0; i < ds.srcCss.length; i++){
          ds.srcCss[i] = l+ds.srcCss[i];
        }

          gulp
            .src(ds.srcCss)
            .pipe(po.processCSS())
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_css")});
      });

      gulp.task(build+"_imgMin", function() {
        runningTasks.push(build+"_imgMin")
          gulp
            .src([l+'_img/*', l+'img/*', l+'*.jpg', l+'*.png'])
            .pipe(po.imageMin())
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_imgMin")});
      });

      gulp.task(build+"_replaceSRC", function() {
        runningTasks.push(build+"_replaceSRC")
          gulp
            .src([d+'*.html', d+'*.css', d+'*.js'])
            .pipe(po.replaceSRC())
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_replaceSRC")});
      });

      gulp.task(build+"_copyFilesManual", function() {

          for (var i = 0; i < ds.manualCopy.length; i++){
            ds.manualCopy[i] = l+ds.manualCopy[i];
          }

          gulp
            .src(ds.manualCopy)
            .pipe(chmod(666)).pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_copyFilesManual")});
      });

      gulp.task(build+"_copyFilesAuto", function() {
          gulp
            .src([l+"_vid/*.mp4", l+"_vid/*.webm", l+"_vid/*.ogv",
                  l+"_font/*.woff", l+"_font/*.ttf", l+"_font/*.otf"])
            .pipe(chmod(666)).pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_copyFilesAuto")});
      });

      gulp.task(build+"_copyBackups", function() {
          gulp
            .src([l+"../backup/*.jpg", l+"../backup/*.png", l+"../backup/*.gif",
                  l+"../../backup/*.jpg", l+"../../backup/*.png", l+"../../backup/*.gif"])
            .pipe(chmod(666)).pipe(gulp.dest(curData.supply))
            .on('end', function(){myGulp.taskEnd(build, "_copyBackups")});
      });

      gulp.task(build+"_zipItUp", function() {
        runningTasks.push(build+"_zipItUp")
          gulp
            .src(d+"*")
            .pipe(zip(curData.zipName+'.zip'))
            .pipe(chmod(666))
            .pipe(gulp.dest(curData.supply))
      });

      gulp.task(build+"_FTReplace", function() {
        runningTasks.push(build+"_FTReplace")
        // console.log(curData)
          gulp
            .src(d+"manifest.js")
            .pipe(replace('src": "childSrc"'    , 'src": "'+curData.childFile+'"'))
            .pipe(chmod(666))
            .pipe(gulp.dest(d))
            .on('end', function(){myGulp.taskEnd(build, "_FTReplace")});
      });

      gulp.start(build+"_clean");


        var newBuild = {
          "name": build,
          "curTask": 0,
          "sequence": [
            [build+"_html"],
            [
              build+"_imgMin",
              build+"_copyFilesAuto",
              build+"_copyFilesManual"
            ],[
              build+"_js",
              build+"_css"
            ],
            [build+"_replaceSRC"],
            [
              build+"_zipItUp",
              build+"_copyBackups"
            ]
          ]
        }


        if (curData.childFile){
          newBuild.sequence.splice(2, 0, [build+"_FTReplace"]);
        }

        buildList.push(newBuild)

    });



    console.log("")
    console.log("-------------- awaiting task completions ---------------")
    console.log("")

    buildList.forEach(function(buildTask){
      myGulp.startTask(buildTask.name);
    })
  }
});


/**
 *  Called on task end
 *
 *  @method taskEnd
 *  @param {String} whatEnded The task that has just ended
 */
myGulp.taskEnd = function(whatBuild, whatTask){
  buildList.forEach(function(build){
    if (whatBuild === build.name){
      build.sequence.forEach(function(sequenceSeg){

          if (sequenceSeg.length <= 1){
            if(sequenceSeg[0] === whatBuild+whatTask){
              // console.log("Synchronous "+whatTask+" for "+whatBuild+" is complete");
              build.curTask ++;
              myGulp.startTask(build.name);
            };
          }

          else {
            for (var i = 0; i < sequenceSeg.length; i++){
              if (sequenceSeg[i] === build.name+whatTask){
                // console.log("Asynchronous "+whatTask+" for "+whatBuild+" is complete");
                sequenceSeg.splice(i, 1)
              }
            }
          }

      });
    };
  });
};


myGulp.checkSequence = function(build, sequenceSeg, whatTask){
  if (sequenceSeg.length <= 1){
    if(sequenceSeg[0] === whatBuild+whatTask){
      // console.log("Synchronous "+whatTask+" for "+whatBuild+" is complete");
      build.curTask ++;
      myGulp.startTask(build.name);
    };
  }

  else {

    for (var i = 0; i < sequenceSeg.length; i++){
      if (sequenceSeg === build.name+whatTask){
        // console.log("Asynchronous "+whatTask+" for "+whatBuild+" is complete");
        sequenceSeg.splice(i, 1);
      }
    }
  };
}


myGulp.startTask = function(what){
  buildList.forEach(function(build){
    if (what === build.name){
      build.sequence[build.curTask].forEach(function(newTask){
          gulp.start(newTask)
      })
    }
  });
}


myGulp.pipeOpts = {};
myGulp.pipeOpts.processHTML = lazypipe()
                  .pipe(usemin)
                  .pipe(chmod, 666);

myGulp.pipeOpts.processJS = lazypipe()
                  .pipe(concat, "All.min.js", {newLine: ''})
                  .pipe(lec, {verbose:true, eolc: 'LF', encoding:'utf8'})
                  .pipe(uglify)
                  // .pipe(gzip, { append: false })
                  .pipe(chmod, 666);

myGulp.pipeOpts.processCSS = lazypipe()
                  .pipe(concatCss, "All.min.css", {newLine: ''})
                  .pipe(uglifycss)
                  // .pipe(gzip, { append: false })
                  .pipe(chmod, 666);

myGulp.pipeOpts.imageMin = lazypipe()
                  .pipe(imagemin, {
                        optimizationLevel: 5,
                        progressive: true,
                        svgoPlugins: [{removeViewBox: false}],
                        use: [pngquant()]
                    })
                  .pipe(chmod, 666);

myGulp.pipeOpts.replaceSRC = lazypipe()
                  .pipe(replace,  "../img/"  , './')
                  .pipe(replace,  "../_img/" , './')
                  .pipe(replace,  "_img/"    , './')
                  .pipe(replace,  "img/"     , './')
                  .pipe(replace,  "debugMode:!0"  , 'debugMode:0')
                  .pipe(replace,  "_vid/"    , './')
                  .pipe(replace,  "vid/"     , './')
                  .pipe(replace,  "../_font/"  , './')
                  .pipe(replace,  "../font/"   , './')
                  .pipe(replace,  "_font/"  , './')
                  .pipe(replace,  "font/"   , './')
                  .pipe(chmod, 666);




/******************
    UTILS
******************/

/**
 *  Checks if doing multiple files TODO
 *
 *  @method readJSON
 */
myGulp.readJSON = function(target){
  var parseData = JSON.parse(fs.readFileSync(target+"/_gulpOpt.json"));
      parseData.originlocation = target;

  return parseData;
}


/**
 *  Checks if it is a FT ad or not and amends build queue
 *
 *  @method checkType
 *  @param {Object} newData What kind of build this is
 */
myGulp.checkType = function(newData){
  var r = []

  if (newData.adServer === "Flashtalking" || newData.adServer === "FT" ){
    myGulp.log("    --> Flashtalking Build");
    r.push({
      location: newData.originlocation + "/parent/parentSrc/",
      dest:     newData.originlocation + "/build/parent/parentSrc/",
      supply:   newData.originlocation + "/supply/",
      dataSrc:  newData.parentFiles,
      htmlName: "index",
      buildName: newData.htmlName+"_parent",
      zipName:  newData.zipName,
      childFile:newData.htmlName+"_child"
    },{
      location: newData.originlocation + "/richLoads/childSrc/",
      dest:     newData.originlocation + "/build/richLoads/"+newData.htmlName+"_child/",
      supply:   newData.originlocation + "/supply/",
      dataSrc:  newData.childFiles,
      htmlName: "index",
      buildName: newData.htmlName+"_child",
      zipName:  newData.zipName+"_child"
    });
  }
  else {
    myGulp.log("    --> Default Build");
    r.push({
      location: newData.originlocation + "/src/",
      dest:     newData.originlocation + "/build/",
      supply:   newData.originlocation + "/supply/",
      dataSrc:  newData,
      htmlName: newData.htmlName,
      buildName: newData.htmlName,
      zipName:  newData.zipName
    });
  }
  return r;
}
