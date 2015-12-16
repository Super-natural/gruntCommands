/********************************
 *	Gulp File for all Super natural Builds
 *  v0.0.5
 *	16/12/2015
 *
 *  Written by Stephen Utting
 */


# Set up

	start off in terminal at start of campaign with an npm install

	The .html file script re-routing will look for this:

		<!-- build:css All.min.css -->
			<link rel="stylesheet" href="style.css" type="text/css">
		<!-- endbuild -->

	everything inside the build tags will be compacted into All.min.css
	likewise is js:

		<!-- build:js All.min.js -->
			<script src="myScript.js" type="text/javascript"></script>
    <!-- endbuild -->

	please see example folder for details.



# Terminal

	Gulp is launched by this command:

		gulp --src ../location/of/my/gulpOpts/json/

	so long as the .json file is filled out correctly (please see example for details) it should all work.



# Notes

	• Everything is _font, _img, and backup folders will be copied to src
	• The 'build' folder for flashtalking builds is for internal preview purposes
