$(document).ready(function(){

	var level = 0;
	var tileset = 0;

	var helptext = [ 'Background for this level will be a randomly generate forest skyline using the dark blue forest tiles',
					 'Background for this level will be a uniform brick wall using the blue bricks, windows and candles',
					];

var data = [
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..3......D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..3......C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$3......&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&3.....&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWB........................................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaaa09aaaaWBBBaaaaaaa........................................BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaa........................................BAAAAAaaaaaaaaaYBBBByaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZaa09a........................................BAAAAAaaaaaaaaaWBBBBEaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaa09YBBBBBEaaaaaaaaWBEaaBBBBEaaaa........................................BZAAAAaa90aaaaaaaaaaaaa0a0$aYBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaa........................................BBZAAAaYBBZa)aaaaaaaaaYBBBaaBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09........................................BBBZ9YBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBB........................................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWB........................................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaaaaaaaaaWBBBaaaaaaa........................................BAAAAWBBEaaaaaa$-aaa$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaa........................................BAAAAAaaaaaaaaaYBBBByaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZaaaaa........................................BAAAAAaaaaaaaaaWBBBBEaaaaaaaaaaaaaaYBBBBBBBBBBBBZaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBEaaaaaaaaWBEaaBBBBEaaaa........................................BZAAAAaaaaaaaaaaaaaaaaaaaa$aYBBBBBBBBaaaaaaaaaaaaaaWBEaaaaaa........................................BBZAAAaYBBZa)aaaaaaaaaYBBBaaBBBBBBBBBaaaaaYBZaaaaaaaaaaaaaaa........................................BBBZAYBBBBBBBBZaaaa{aYBBBBaaBBBBBBBBBZaaYBBBBZaa+aaaaaYBBBBB........................................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................0',
'..............................................KLn................................................................................................Gmmmg.................................nlkn........................*..................................bbb.................................Immmmi.....................................................777..bbb...............................nIJsoooji.......888...........$..(...$.@.....................333..bbb..777.........................ImJsbbbboji......444............VcUucv$.Xdx.$...]$............353.}bbb..333......................nnIJsobbbbbboji.....464..............Tt.........VUuv............n3%3NIbbbi.353.........*...........ImmJsbbbbbbbbboji....444..............Tt..........Tt............ImmmmmJbbbji3^3....................IJsoobbbbbbbbbbboji...444..............Tt......1...Tt..kL.......IJsooooobbbojmmmmg.................IJsbbbbbbbbbbbbbbboji..464..~n.lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbbbbbbooooo.................IJsbbbbbbbbbbbbbbbbboji.4!4.mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbbbbbbb[...................GJsbbbbbbbbbbbbbbbbbbbojmmmmmooooooooobbbboooooooooooooooobboofFooobbbbbbbbbbbbbfffffffffffffffffffffobbbbbbbbbbbbbbbbbbbbboooooo0',
//'..............................................KLn................................................................................................Gmmmg.............................................................*..................................bbb............................................................................................777..bbb.............................................................$..(...$.@.....................333..bbb..............................................................VcUucv$.Xdx.$...]$............353.}bbb................................................................Tt.........VUuv............n3%3NIbbb................................................................Tt..........Tt............ImmmmmJbbb................................................................Tt......1...Tt..kL.......IJsooooobbb....................................................~n.lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbbbbb...................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbbbbb...................................................ooooooooobbbboooooooooooooooobboofFooobbbbbbbbbbb...................................................0',
'..........................................b...................................................................................................b...................................................................................................b......................................................................................888..........b...................................................................$..)...$.@.........444..........b....................................................................VcUucv$.Xdx......$464..........b......................................................................Tt.........VUuv.444........nNb......................................................................Tt..........Tt..444.......Immb......................................................................Tt..........Tt..464......IJsbb..........................................................~n.lkn.n1.n+Tt.N.n.-.2.NTtn.4!4n..nLIJsbbb.........................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMMMMMmgGmmJsbbbb.........................................................ooooooooobbbboooooooooooooooooooofFooobbbbb.........................................................0',
'.........................................................................................................................................................................................................................................................................................................................................888..............................................................................$..).(.$.@.........444...............................................................................VcUucv$.Xdx......$464.................................................................................Tt..............444........nN.......................................................................Tt..............444.......Imm.......................................................................Tt..............464......IJsb...........................................................~n..knnn2.n+TtN....-.12N.N..4!4n..n.IJsbb..........................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMMMMMmgGmmJsbbb..........................................................ooooooooobbbboooooooooooooooooooofFooobbbb..........................................................0',
'.................$%............................................................................................Ihhhhhhhhhhii......................................................................................Iaaaaaaaaaaaaii....................................................................................Ia..aaaaaaaa..aai..................................................................................Iaa..aaaaaaaa..aaai................................................................................Iaaaaaaaaaaaaaaaaaaai..............................................................................Iaaaaaaaaaaaaaaaaaaaaaa............................................................................Iaaaaaaaaaaaaaaaaaaaaaaaa......................................................................~...Iaaaaaaaaaaaaaaaaaaaaaaaaaa.....................................................................mmmIaaaaaa..............aaaaaaaa....................................................................baaaaaaaAAAAAAAbbbbbbbbbbbbbbbbbbbbbbbbbbbb.........................................................bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.........................................................0',
'.........................................................................................................................................................................................................................................................................................................................................888..............................................................................$......$.@.........444...............................................................................VcUucv$.Xdx......$464....................................................................................aaaaa........444........nN....................................................................nn....aaaaa........444.......Imm...................................................................Immi...aYBya........464......IJsb...........................................................~n..kL.IJsoji.NzbbBZ.12N.N..4!4n..n.IJsbb..........................................................mmmmmmmmJsbbojMMMMMMMMMMMMMMMMMMmgGmmJsbbb..........................................................ooooooooobbbboooooooooooooooooooofFooobbbb..........................................................0',
'...................................................................................................................*.................................VcUucv..........................................................$..).$................................Tt..................n.nKLN.....................................VUuv....$n+N$...............nLN......Tt.................Immmmmmi...................888...............Tt.....Ghhhg.....]n$......GHHHg.....Tt................IJsoooooji..................444.....nnN.......Tt..............Immg................TtN.$n.].n.lN$$nlIJsbbbbbboji.LnN)))lk$.......464....Ghhhg......Ttn............IJoo................ImmmgGhhhhhhhhgGmmJswaaaaaaeojmmmmmmmmmi.......444..............Immmi..........IJsbblkn.......N....IJsoo............ooowaaaaaaaaeoooooooooob2......464.nlk~N..n....IJsooji........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa22.....4!4mmmmmmmmmg$kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb.-....KL..IJbbbyaaaaaaaaaaaaaaaaaaaa222.N.Immmooooooooo.GmJsbbbbboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0',
'...........................................................................................................................................................................................................................................................................................................................................................................................................................VUuv.................................................................................................Tt.............VUuv.................................................................................Tt..............Tt.............................................................................VUuv.Tt..............Tt.......................................................................NkLn...Tt..Tt..............Tt......................................................................mmmmmi..Tt..Tt.....VUuv.....Tt......................................................................OOOOSj..Tt..Tt......Tt......Tt......................................................................BBBBBS..Tt..Tt......Tt......Tt......................................................................0',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttvtttttttttttttttttttVtttttttVtttttttVtttttttVtttttttV5555555bbbbbbbbbbg..........d..Gbg......Gbg....d...................D.......D.......D.......D.......D5555555bbbbbbbbbbg..........d..GPg......ttt....d...................D.......D.......D.......D.......D5555555btttttttvtt..........d.*Gbg.............c...................D.......D.......D.......D.......D5555555b.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D.......D5555555b.......d............d..............IJbPg.........XWwx.Gbg..D.......D.......D.......D.......D5555555b.......d............c.............IJbbbg..............Gbg..D.......D.......D.......D.......D5555555b.......d...........IhhHi.........IJbbbbg..............Gbg..D.......D.......D.......D.......D5q555q5b.......c.....l....IJBPbjhhF...Xx.Gbbbbbg..............Gbg..D.......D.......D.......D.......D5553555b.~..IHHHHHHHHF..fhJBBBbbbbgyyyyyyGbbbbbg..............Gbji.C.......C.......C.......C.......C555!555bHHHHJBBBBBBBBgyyGbBBBBbbbbgzZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmb1',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',

];
	var metachars = [ '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '+', '[', ']', '{', '}', '2', '1', '3', '4', '5', '6', '7', '8', '9', '0' ];

	// build table
	var height = 12;
	var width = 100;

	var table = $('#grid');
	var tbody = table.find('tbody');
	for (var y = 0; y < height; y++) {
		var row = "<tr class='cell'>";
		for (var x = 0; x < width; x++) {
			row += "<td data-id='.' data-counter='" + (y * width + x) + "'></td>";
		}
		row += "</tr>\n";
		tbody.append(row);
	}

	var setHelpText = function() {
		var l = $('#helptext');
		l.html(helptext[tileset]);
	}

	var buildtilemap = function() {
		// build tilemap
		var l = $('div.fixed ul#lower');

		l.empty();

		l.append('<li data-id="."></li>');
		for (var i = 0; i < 26; i++) {
			var style = 'width: 64px; height: 64px; background: url(spritesheet.png) ' + ( i * -64 ) + 'px ' + (tileset * 64) + 'px; background-size: 2600%;';
			l.append('<li data-id="' + String.fromCharCode( i + 97) + '" class="tile" style="' + style + '"></li>');
		}

		var l = $('div.fixed ul#upper');

		l.empty();

		l.append('<li data-id="."></li>');
		for (var i = 0; i < 26; i++) {
			var style = 'width: 64px; height: 64px; background: url(spritesheet.png) ' + ( i * -64 ) + 'px ' + (tileset * 64) + 'px; background-size: 2600%;';
			l.append('<li data-id="' + String.fromCharCode( i + 65) + '" class="tile flipped" style="' + style + '"></li>');
		}

		var l = $('div.fixed ul#meta');

		l.empty();

		for (var i = 0; i < metachars.length; i++) {
			var style = 'width: 64px; height: 64px; background: url(meta.png) ' + ( i * -64 ) + 'px 0px; background-size: 2700%;';
			l.append('<li data-meta="a" data-id="' + metachars[i] + '" class="tile" style="' + style + '"></li>');
		}

		/* var l = $('div.fixed ul#meta2');
		l.empty();

		for (var i = 0; i < 26; i++) {
			var style = 'width: 16px; height: 16px; background: url(spritesheet.png) ' + ( i * -16 ) + 'px ' + (2 * 16) + 'px;';
			l.append('<li data-id="' + metachars[i] + '" class="tile" style="' + style + '"></li>');
		} */
		/* var l = $('div.fixed ul#meta3');
		l.empty();

		for (var i = 0; i < 26; i++) {
			var style = 'width: 16px; height: 16px; background: url(spritesheet.png) ' + ( i * -16 ) + 'px ' + (3 * 16) + 'px;';
			l.append('<li data-id="' + metachars[i] + '" class="tile" style="' + style + '"></li>');
		} */

		// handle li click
		$("div.fixed ul li").click(function() {
			// clear selection from old
			if ( selected !== null ) {
				selected.removeClass('selected');
			}
			$(this).addClass('selected');

			selected = $(this);
		});

		setHelpText();
	}

	buildtilemap();

	// handle selection
	var selected = null;

	// handle li click
	/* $("div.fixed ul li").click(function() {
		// clear selection from old
		if ( selected !== null ) {
			selected.removeClass('selected');
		}
		$(this).addClass('selected');

		selected = $(this);
	}); */

	var replaceAt = function(index, character, string) {
	    return string.substr(0, index) + character + string.substr(index+character.length);
	};

	// handle cell click
	$("tr.cell td").click(function(e) {
		if ( selected !== null ) {
			var value = '' + $(selected).data("id");

			var counter = parseInt($(this).data("counter"), 10);
			$(this).data('id', value);
			console.log( value );
			var v = value.charCodeAt(0);

			//console.log( counter + ',' + data[level][counter] );
			data[level] = replaceAt( counter, value, data[level] );
			//console.log( counter + ',' + data[level][counter] );

			var flipped = false;

			if ( v > 96 ) {
				v -= 97;
				flipped = false;
			} else {
				v -= 65;
				flipped = true;
			}

			// console.log(value + ' - ' + v );

			if ( metachars.indexOf( value ) > -1 ) {
				$(this).css('background', 'url(meta.png) ' + ( metachars.indexOf( value ) * -64) + 'px 0px');
					$(this).css('background-size', '2700%');
					$(this).removeClass('flipped');
			}
			else
			{
				if (value !== '.' ) {
					$(this).css('background', 'url(spritesheet.png) ' + (v * -64) + 'px ' + (tileset * 64) + 'px');
					$(this).css('background-size', '2600%');
					if (flipped) {
						$(this).addClass('flipped');
					} else {
						$(this).removeClass('flipped');
					}
				}
				else
				{
					$(this).css('background', '');
					$(this).css('background-size', '');
					$(this).removeClass('flipped');
				}
			}

		}
	});

	// click on export button
	$("#export").click(function(e) {
		e.preventDefault();
		var result = '';
		$("#grid tr").each(function () {
			$('td', this).each(function () {
				var value = $(this).data( "id" );
				result += value;
			 });
		});
		result += tileset;

		console.log('-----------[ LEVEL ' + level + ' ]------------');
		console.log( result );
		console.log('---------------------------------------------');
		console.log( 'Total chars: ' + result.length );

		/*var nr = prepare( result );

		var encoded = enc( nr );

		console.log( encoded );
		console.log('---------------------------------------------');
		console.log( 'Total chars: ' + encoded.length ); */
	});

	var setLevelIndicator = function() {
		$('#levelindicator').html('' + level);
		$('#tilesetindicator').html('' + tileset);
	};

	var loadData = function() {
		var counter = 0;

		tileset = parseInt(data[level][1200],10);
		buildtilemap();

		$("#grid tr").each(function () {
			$('td', this).each(function () {
				$(this).data( "id", data[level][counter] );

				var value = data[level][counter];

				var v = value.charCodeAt(0);

				var flipped = false;

				if ( v > 96 ) {
					v -= 97;
					flipped = false;
				} else {
					v -= 65;
					flipped = true;
				}

				if ( metachars.indexOf( value ) > -1 ) {
					$(this).css('background', 'url(meta.png) ' + ( metachars.indexOf( value ) * -64) + 'px 0px');
					$(this).css('background-size', '2700%');
					$(this).removeClass('flipped');
				}
				else
				{

					if (value !== '.' ) {
						$(this).css('background', 'url(spritesheet.png) ' + (v * -64) + 'px ' + (tileset * 64) + 'px');
						$(this).css('background-size', '2600%');
						if (flipped) {
							$(this).addClass('flipped');
						} else {
							$(this).removeClass('flipped');
						}
					}
					else
					{
						$(this).css('background', '');
						$(this).css('background-size', '');
						$(this).removeClass('flipped');
					}
				}
				counter++;
			 });

		});

	};

	// load level
	/*
	$("#load").click(function(e) {
		e.preventDefault();

		loadData();
	}); */

	// prev button
	$("#prev").click(function(e) {
		e.preventDefault();

		if ( level > 0) {
			level--;
			loadData();
		}
		setLevelIndicator();
	});
	// next button
	$("#next").click(function(e) {
		e.preventDefault();

		if ( level < data.length) {
			level++;
			loadData();
		}
		setLevelIndicator();
	});

	// prev button
	$("#prevtileset").click(function(e) {
		e.preventDefault();

		if ( tileset > 0) {
			tileset--;
			data[level] = replaceAt( 1200, tileset, data[level] );
			buildtilemap();
			loadData();
		}
		setLevelIndicator();
	});
	// next button
	$("#nexttileset").click(function(e) {
		e.preventDefault();

		if ( tileset < 1) {
			tileset++;
			data[level] = replaceAt( 1200, tileset, data[level] );
			buildtilemap();
			loadData();
		}
		setLevelIndicator();
	});

	loadData();
	/*
	// generate level seed
	var seed = 1;

	function random() {
		var x = Math.sin(seed++) * 1000;
		return x - Math.floor(x);
	};

	function rand(min, max) {
		return Math.floor(random() * (max - min + 1)) + min;
    };


	var level = '';
	var t = 0;

	for (var s = 0; s < 1000; s++) {
		console.log(s);
		seed = s;

		level = '';
		for (var i = 0; i < 1201; i++ ) {
			t = rand(32, 126);
			level += String.fromCharCode(t);
		}

		if ( level.length !== data[0].length ) {
			console.log('barf! ' + level.length + ' != ' + data[0].length );
		}

		if (level[0] === data[0][0] ) {
			console.log('We\'ve got a start');
			if ( level === data[0] ) {
				console.log( 'Match! on seed ' + s );
				console.log( level );
				break;
			}
		}
	}

	console.log( 'no match found' );
	*/

	var prepare = function( d ) {
		d = String(d);

		var r = '';

		for (var i = 0; i < d.length; i++ ) {
			r += '' + d[i].charCodeAt(0);
		}

		return r;
	}

	var enc = function(num){
		// Stringify our number in case it was input as an integer.
		num = String(num);

		// Keep track of our encoded chunks.
		var encodedChunks = [];

		// Continue until we've processed the entire string.
		while(num.length){
			// Start somewhere.
			var splitPosition = 8;

			// Try incrementally larger pieces until we get one that's exectly
			// 8 characters long.
			var encodedNum = '';
			while(encodedNum.length < 8 && splitPosition < num.length && splitPosition < 15){
				// toString(36) converts decimal to base36.
				encodedNum = Number(num.substr(0, ++splitPosition)).toString(36);
			}

			// Push our chunk onto the list of encoded chunks and remove these
			// digits from our string.
			encodedChunks.push(encodedNum);
			num = num.substr(splitPosition);
		}

		// Return a big ol' string.
		return encodedChunks.join('');
	}
});
