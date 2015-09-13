$(document).ready(function(){

	var level = 0;
	var tileset = 0;

	var helptext = [ 'Background for this level will be a randomly generate forest skyline using the dark blue forest tiles',
					 'Background for this level will be a uniform brick wall using the blue bricks, windows and candles',
					];

var data = [
/* 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'..............................................&&&.................................................................................................&&&..................................nlkn........................*..................................&&&.................................Immmmi.....................................................777..&&&...............................nIJsoooji.......888...........$..(...$.@.....................333..&&&..777.........................ImJsbbbboji......444............VcUucv..Xdx.$...]$............353.}&&&..333......................nnIJsobbbbbboji.....464..............Tt.........VUuv............n3%3NI&&&i.353.........*...........ImmJsbbbbbbbbboji....444..............Tt..........Tt............ImmmmmJ&&&ji3^3....................IJsoobbbbbbbbbbboji...444..............Tt......1...Tt..kL.......IJsooooo&&&ojmmmmg......&&.........IJsbbbbbbbbbbbbbbboji..464..~n$lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbb&&&booooo.................IJsbbbbbbbbbbbbbbbbboji.4!4.mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbb&&&bb[...................GJsbbbbbbbbbbbbbbbbbbbojmmmmmooooooooobbbboooooooooooooooobboofFooobbbbbbbb&&&bbfffffffffffffffffffffobbbbbbbbbbbbbbbbbbbbboooooo0',
'.............................................................................................................................$...............................................*..........................888.................................................@...............$..+.$......................888.444...............................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv......................444.464.......VcUucv..................VcUuCv.......Tt.....................Tt........................464.444.........Tt.............VUuv.....Tt.........Tt.....................Tt........................444.444.........Tt..............Tt......Tt.........Tt.....................Tt...........VUuv.........444.464....VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt..........464.4a4~n...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt......NkLN4!4Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt.....ImmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt.....JsoooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt.....sbbbbbbbb0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSjmi........i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaWBBBBBBBBBBBBBBBBBOOE........BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa]09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaaaaWBBBBBBBEaaaa........BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaaaa090$$Aaaaa09aaaaaaaWBBBBEaaaaa.....888BAAAAAaaaaaaaaazbbbbyaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBZaaaaaaaaaaaaaaaaa.....444BAAAAAaaaaaaaaaebbbbwaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBZaaaaaaaaaaaaaaa.....464BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBBZ09aaaaaaaaaaaaN....444BAAAAAaaaaaaaaaaaaaaaaaaaaaa$09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBBBBBaaaaaaaaaa0Ymi...444BZAAAAaa90aaaaaaaaaaaaa09aaaYBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBBBBEaaaaaaaaaYBBSji..464BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaWBBBBBBEaaa@aaaaaYBBBBSji.4!4BBBZaYBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaaBBBBBBaaaaXxaaaaBBBBBBSjMmmmBBBBBBBBBBBBBBBBBBBBBBBBBEaaWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBa$AaaaaWBBBBEaaaaaaaaaaWBBBBBBOOOOO0',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgtttVttttttttttttttttttttVtttttttVtttttttVtttttttVtttttttt3333333GbbbbPbbbbg..........d..Gbg......Gbg...D....................D.......D.......D.......D........3333333Gbbbbbbbbbg..........d..GPg......ttt...D....................D.......D.......D.......D........3p353p3Gtttttttvtt..........d.*Gbg............C....................D.......D.......D.......D........333!333G.......d............d..ttt.........IHhhF....@.........fHF..D.......D.......D.......D.......fhhhhhhhb.......d............d.............IJbbPg....Xwwwx.....Gbg..D.......D.......D.......D.......tEtEtEttG.......d............c.{..........IJbbbbg...$.1..).$...Gbg..D.......D.......D.......D........D.D.D..G.......d...........IhhHi.l..$.@..Gbbbbbg....fhhhhF....Gbg..D.......D.......D.......D........D.D.D..G.......c.N...l.$..IJBPbjhhhF..Xx.Gbbbbbg....tETTEt....Gbg..D.......D.......D.......D........D.D.D..G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg.....D..D.....Gbji.C.......C.......C.......C...1....C.C.C1IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhJb1',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttttttttttttttttttttttVtttttttVtttttttVtttttttVtttttttttttttttGbbbbbbbbbg..........d..Gbg......Gbg........................D.......D.......D.......D...............Gbbbbbbbbbg..........d..GPg......ttt........................D.......D.......D.......D...............Gtttttttvtt..........d.*Gbg.................................D.......D.......D.......D...............G.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D...............G.......d............d..............IJbPg#........XWwx@Gbg..D.......D.......D.......D...............G.......d............c.............IJbbbg..............Gbg..D.......D.......D.......D...............G.......d...........IhhHi.........IJbbbbg..............Gbg..D.......D.......D.......D...............G.......c.....l....IJBPbjhhhF#.Xx@Gbbbbbg..............Gbg..D.......D.......D.......D.............!.G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg..............Gbji.C.......C.......C.......C.............!IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhJb1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg12..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.....)&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.***..L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.**...&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.*..l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg12..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.CL..n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D.........D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D.........C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$.......&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3LC...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..A......D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..A......C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$A......&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3LC...n&&&&&&&&&A.....&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..3......D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..3......C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$3......&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&3.....&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'.............................................................................................................................$...............................................*..........................888.................................................@...............$..+.$......................888.444...............................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv......................444.464.......VcUucv..................VcUuCv.......Tt.....................Tt........................464.444.........Tt.............VUuv.....Tt.........Tt.....................Tt........................444.444.........Tt..............Tt......Tt.........Tt.....................Tt...........VUuv.........444.464....VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt..........464.4a4~n...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt......NkLN4!4Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt.....ImmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt.....JsoooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt.....sbbbbbbbb0',
'.............................................................................................................................$...............................................*..............................................................................@...............$..+.$......................888...................................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv......................444...........VcUucv..................VcUuCv.......Tt.....................Tt........................464.............Tt.............VUuv.....Tt.........Tt.....................Tt........................444.............Tt..............Tt......Tt.........Tt.....................Tt...........VUuv.........444........VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt..........464..NkLn...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt......N.N.4!4Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt.....ImmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt.....JsoooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt.....sbbbbbbbb0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.......................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaWBBBBB.......................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa]09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaa.......................BAAAAWBBEaaaa$a$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaaaa090$AAaaaa09aaa.......................BAAAAAaaaaaaaaazbbbbya@WBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBZaa.......................BAAAAAaaaaaa#aaebbbbwaXxaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBB.......................BAAAAAaaaaaaXxaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBB.......................BAAAAAaaaaaaaaaaaaaaaaaaaaaaa09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBB.......................BZAAAAaa90aaaaaaaaaaaaa09aa$YBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBB.......................BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaBBBBBB.......................BBBZ9YBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaBBBBBB.......................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBa$AaaaBBBBBB.......................0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.......................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaWBBBBB.......................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa]09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaa.......................BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaaaa090$AAaaaa09aaa.......................BAAAAAaaaaaaaaazbbbbyaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBZaa.......................BAAAAAaaaaaaaaaebbbbwaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBB.......................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBB.......................BAAAAAaaaaaaaaaaaaaaaaaaaaaaa09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBB.......................BZAAAAaa90aaaaaaaaaaaaa09aa$YBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBB.......................BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaBBBBBB.......................BBBZ9YBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaBBBBBB.......................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBaAAaaaBBBBBB.......................0',
'..............................................KLn................................................................................................Gmmmg.............................................................*..................................bbb............................................................................................777..bbb.............................................................$..(...$.@.....................333..bbb..............................................................VcUucv$.Xdx.$...]$............353.}bbb................................................................Tt.........VUuv............n3%3NIbbb................................................................Tt..........Tt............ImmmmmJbbb................................................................Tt......1...Tt..kL.......IJsooooobbb....................................................~n.lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbbbbb...................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbbbbb...................................................ooooooooobbbboooooooooooooooobboofFooobbbbbbbbbbb...................................................0',
'...................................................................................................................*.................................VcUucv..........................................................$..).$................................Tt..................n.nKLN.....................................VUuv....$n+N$...............nLN......Tt.................Immmmmmi...................888...............Tt.....Ghhhg.....]n$......GHHHg.....Tt................IJsoooooji..................444.....nnN.......Tt..............Immg................TtN.$n.].n.lN$$nlIJsbbbbbboji.LnN)))lk$.......464....Ghhhg......Ttn............IJoo................ImmmgGhhhhhhhhgGmmJswaaaaaaeojmmmmmmmmmi.......444..............Immmi..........IJsbblkn.......N....IJsoo............ooowaaaaaaaaeoooooooooob2......464.nlk~N..n....IJsooji........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa22.....4!4mmmmmmmmmg$kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb.-....KL..IJbbbyaaaaaaaaaaaaaaaaaaaa222.N.Immmooooooooo.GmJsbbbbboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0',
'..................................................[................................................................*.................................VcUucv..........................................................$..).$................................Tt..................n.nKLN.....................................VUuv....$n+N$...............-LN......Tt.................Immmmmmi...................888...............Tt.....Ghhhg.....]n$......GHHHg.....Tt................IJsoooooji..................444.....nnN.......Tt..............Immg................TtN.$n.].n.lN$$nlIJsbbbbbboji.LnN)))lk$.......464....Ghhhg......Ttn............IJoo................ImmmgGhhhhhhhhgGmmJswaaaaaaeojmmmmmmmmmi.......444..............Immmi..........IJsbblkn.......N....IJsoo............ooowaaaaaaaaeoooooooooob.......464.nlk~N..n....IJsooji........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa.1.....4!4mmmmmmmmmg$kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb.-....KL..IJbbbya(aaaaaaaaaaaaaaaaaa.11.N.Immmooooooooo.GmJsbbbbboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0',
'Xdx.................................................................................................fF.Nn...............................................................................................WWIGgl........VCCv..................................................................................EeiKkL........VUuv.....n.N................n.N......................................................................Tt.....Ghhhg......n.......GHHHg......................................................bhH...e........Tt..............Imm..................N...n...ne.N...n................................JB..Ghhhg......Ttn............IJoo................Immm.Ghhhhhhhhg.mmm...............................jSs...........Immmi..........IJsbblkn.......N....IJsoo............ooo................................nlk.N..n....IJsooji........IJsbbbmmm......mmmilIJsbbb...........Ibbb...............................mmmmmmmmm..kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb......KL..IJbbb...............................ooooooooo..mJsbbbbboji.nkLIJsbbbbbbbbmmm...bbbooobbbbbmmmmmmmmmmJsbbb..........................mmmmmbbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbb..........................ooooo0',
'..........................................................................................................................................................................................................................................................................................................................VUuv.....n.N................n.N......................................................................Tt.....Ghhhg......n.......GHHHg............................................................e........Tt..............Imm..................N...n...ne.N...n....................................Ghhhg......Ttn............IJoo................Immm.Ghhhhhhhhg.mmm.............................................Immmi..........IJsbblkn.......N....IJsoo............ooo................................nlk.N..n....IJsooji........IJsbbbmmm......mmmilIJsbbb...........Ibbb...............................mmmmmmmmm..kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb......KL..IJbbb...............................ooooooooo..mJsbbbbboji.nkLIJsbbbbbbbbmmm...bbbooobbbbbmmmmmmmmmmJsbbb..........................mmmmmbbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbb..........................ooooo0',
'...........................................................................................................................................................................................................................................................................................................................................................................................................................VUuv.................................................................................................Tt.............VUuv.................................................................................Tt..............Tt.............................................................................VUuv.Tt..............Tt.......................................................................NkLn...Tt..Tt..............Tt......................................................................mmmmmi..Tt..Tt.....VUuv.....Tt......................................................................OOOOSj..Tt..Tt......Tt......Tt......................................................................BBBBBS..Tt..Tt......Tt......Tt......................................................................0',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.............................................bbbbbbbbbgttttttttttvttGbgttttttGbgtttttttttttttttttttt.............................................bbbbbbbbbg..........d..Gbg......Gbg.................................................................bbbbbbbbbg..........d..GPg......ttt.................................................................tttttttvtt..........d..Gbg.................................................................................d............d..ttt..........IhhF..............f....................................................d............d..............IJbPg.........XWwx.G....................................................d............c.............IJbbbg..............G....................................................d...........IhhHi.........IJbbbbg..............G....................................................c.....l....IJBPbjhhhF.XwwxGbbbbbg..............G.................................................IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg..............G.............................................HHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYG.............................................1',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttttttttttttttttttttttVtttttttVtttttttVtttttttVtttttttttttttttGbbbbbbbbbg..........d..Gbg......Gbg........................D.......D.......D.......D...............Gbbbbbbbbbg..........d..GPg......ttt........................D.......D.......D.......D...............Gtttttttvtt..........d.*Gbg.................................D.......D.......D.......D...............G.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D...............G.......d............d..............IJbPg#........XWwx@Gbg..D.......D.......D.......D...............G.......d............c.............IJbbbg..............Gbg..D.......D.......D.......D...............G.......d...........IhhHi.........IJbbbbg..............Gbg..D.......D.......D.......D...............G.......c.....l....IJBPbjhhhF#.Xx@Gbbbbbg..............Gbg..D.......D.......D.......D.............!.G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg..............Gbji.C.......C.......C.......C.............!IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhJb1',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttvtttttttttttttttttttVtttttttVtttttttVtttttttVtttttttV3333333bbbbbbbbbbg..........d..Gbg......Gbg....d...................D.......D.......D.......D.......D3333333bbbbbbbbbbg..........d..GPg......ttt....d...................D.......D.......D.......D.......D3333333btttttttvtt..........d.*Gbg.............c...................D.......D.......D.......D.......D3333333b.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D.......D3333333b.......d............d..............IJbPg.........XWwx.Gbg..D.......D.......D.......D.......D3333333b.......d............c.............IJbbbg.....(........Gbg..D.......D.......D.......D.......D3333333b.......d...........IhhHi.........IJbbbbg.....fHHF.....Gbg..D.......D.......D.......D.......D3q333q3b.......c.....l....IJBPbjhhF...Xx.Gbbbbbg.....tttt.....Gbg..D.......D.......D.......D.......D3335333b.~..IHHHHHHHHF..fhJBBBbbbbgyyyyyyGbbbbbg..............Gbji.C.......C.......C.......C.......C333!333bHHHHJBBBBBBBBgyyGbBBBBbbbbgzZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmb1',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttvtttttttttttttttttttVtttttttVtttttttVtttttttVtttttttV3333333bbbbbbbbbbg..........d..Gbg......Gbg....d...............*...D.......D.......D.......D.......D3333333bbbbbbbbbbg..........d..GPg......ttt....d...................D.......D.......D.......D.......D3333333btttttttvtt..........d.*Gbg.............c...................D.......D.......D.......D.......D3333333b.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D.......D3333333b.......d............d..............IJbPg.........XWwx.Gbg..D.......D.......D.......D.......D3333333b.......d............c.............IJbbbg....$..(..$...Gbg..D.......D.......D.......D.......D3333333b.......d...........IhhHi..}$......Gbbbbg.....fhhhF....Gbg..D.......D.......D.......D.......D3q333q3b.......c.....l.$..IJBPbjhhF...Xx..Gbbbbg.....tEtEt....Gbg..D.......D.......D.......D.......D3335333b.~..IHHHHHHHHF..fhJBBBbbbbgyyyyyyyGbbbbg......D.D.....Gbji.C.......C....]..C...}.}.C.......C333!333bHHHHJBBBBBBBBgyyGbBBBBbbbbgzZZZZZZGbbbbgYYYYYYYYYYYYYYGbbjmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmb1',
*/

// level 1 - enforce certain concepts
'..........................................*....................................................................................................nL....VcUucv.......................................................................2nN............Ghhhg.....Tt..................n2nKLN....................888.........................Ghhhg..]..................Tt.................Immmmmmi...................444................................Ln$................Tt....$.nKL]n$....IJsoooooji.....+++..........464.....nn1.......................Immg................TtN...Ghhhhhhg$nlIJsbbbbbboji.LnN.NNlk$.......444....Ghhhg........+............IJso................Immmg..........GmmJswaaaaaaeojmmmmmmmmmi.......444NN~...............N..........IJsbblkn.......N....IJsoo............ooowa*aaaaaaeoooooooooob2......464mmmi.NKLn........Imi........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa22.....4!4ooojmmmmmg$lnnNKIJsji......IJsbbbbooon.L...ooojmJsbbbbn-.nn.KLn.IJbbbyaaaaaa(aaaaaaaaaaaaa222.N.Immmbbboooooo.GmmmmmJsboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoooooobbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0',
// more platforming, with a simple puzzle
'..............................................&&&............................GJsbbbbbbbbbbbbbbbbbbbb..............................................&&&.............................sbbwaaaaaaaaaebbbbbbbb...........*..................................&&&.............................bbwa$aaaaaaaaaaebbbbbb.........................................777..&&&.............................bwaaaaaa09aaaaaaebbbbb..........$..(...$.@.....................333.+&&&..777.........................aaaaaaabbyaaaaaabbbbb...........VcUucv..Xdx.$...]$............353..&&&..333......................n..aaaaaaabbbyaaaaaebbbb.............Tt.........VUuv............n3%3NI&&&i.353.........*...........Imi.aaaaaaabbbbyaaaaa444b.............Tt..........Tt............ImmmmmJ&&&ji3^3....................IJojmmaaaaaaebbbbyaaaa444b.............Tt......1...Tt..kL.......IJsooooo&&&ojmmmmg.................IJsboooaa#aaaabbbbbyaaa464b.~n.lkn..1+n.Tt.N.n-11..NTtnImmi)$$nLIJsbbbbbb&&&booooo.................IJsbbbbbaaXdxaabbbbbby094!4bmmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbb&&&bb[...................GJsbbbbbbaaaaaaabbbbbbbbbbbbbooooooooobbbboooooooooooooooobboofFooobbbbbbbb&&&bbfffffffffffffffffffffobbbbbbwaa$aaaaebbbbbbbbbbbb0',
// cave level
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSjmi........i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaWBBBBBBBBBBBBBBBBBOOE........BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa}09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaaaaWBBBBBBBEaaaa........BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa}aYBBBBZaaaBBBZaaaaaaa1090$$Aaaaa$09a}$aaaWBBBBEaaaaa.....888BAAAAAaaaaaaaaazbbbbyaaWBEaaWBBBEaaa90YBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBBBBZaaaaaaaaaaaaaa.....444BAAAAAaaaaaaaaaebbbbwaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBBBaaaaaaaaaaaaaa.....464BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBBBZ9aaaaaaaaaaaaN....444BAAAAAaaaaaaaaaaaaaaaaaaaaaa$09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBBBBBaaaaaaaaaa0Ymi...444BZAAAAaa90aaaaaaaaaaaaa09aaaYBBBBBBBBa*aaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBBBBEaaaaaaaaaYBBSji..464BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaWBBBBBBEaaa@aaaaaYBBBBSji.4!4BBBZaYBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaaBBBBBBaaaaXxaaa$BBBBBBSjMmmmBBBBBBBBBBBBBBBBBBBBBBBBBEaaWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBa$AaaaaWBBBBEaaaaaaaaaaWBBBBBBOOOOO0',
// toadstool level
'.............................................................................................................................$...............................................*................888...888.888.................................................@...............$..+.$................444...444.444...............................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv................464...464.464.......VcUucv..................VcUuCv.......Tt.....................Tt..................444...444.444.........Tt.............VUuv.....Tt.........Tt.....................Tt..................444888444.444.........Tt..............Tt......Tt.........Tt.....................Tt...........VUuv...444444444.464....VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt....444464444.4a4~n...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt....4444!4444Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt...ImmmmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt...JsoooooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt...sbbbbbbbbbb0',
// castle level
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgtttVttttttttttttttttVtttttttttVtttGbgtttVtttttttVtttttttt3333333GbbbbPbbbbg..........d..Gbg.....*Gbg...D................D.........D...Gbg...D.......D........3333333Gbbbbbbbbbg..........d..GPg......ttt...D................D.........D...Gbg...D.......D........3p353p3Gtttttttvtt..........d..Gbg............C................C.........C...Gbg...D.......D........333!333G.......d............d..ttt.........IHhhF.........@....fHF.......fhF..Gbg.2.D.......D.......fhhhhhhhb.......d............d.............IJbbPg.........XWx..GbgYYYYYYYGbg..GbbhhhhF......D.......tEtEtEttG.......d............c.{..........IJbbbbg...$.1..).$...GbgZZZZZZZGbg..GbgTTTET......D........D.D.D..G.......d...........IhhHi.l..$.@..Gbbbbbg....fhhhhF....GbgZZZZZZZGbg..TTT...D.......D........D.D.D..G.......c.N..)l.$..IJBPbjhhhF..Xx.Gbbbbbg....tETTEt....GbgZZZZZZZGbg........D.......D........D.D.D..G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg.....D..D.....GbgZZZZZZZGbg........C}.}.1..C........C.C.C.IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbgZZZZZZZGbgMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMhJb1',
// endboss
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg12..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.CL..n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
/*
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',

'................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................0',
'..............................................&&&.................................................................................................&&&..................................nlkn........................*..................................&&&.................................Immmmi.....................................................777..&&&...............................nIJsoooji.......888...........$..(...$.@.....................333..&&&..777.........................ImJsbbbboji......444............VcUucv..Xdx.$...]$............353.}&&&..333......................nnIJsobbbbbboji.....464..............Tt.........VUuv............n3%3NI&&&i.353.........*...........ImmJsbbbbbbbbboji....444..............Tt..........Tt............ImmmmmJ&&&ji3^3....................IJsoobbbbbbbbbbboji...444..............Tt......1...Tt..kL.......IJsooooo&&&ojmmmmg......&&.........IJsbbbbbbbbbbbbbbboji..464..~n$lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbb&&&booooo.................IJsbbbbbbbbbbbbbbbbboji.4!4.mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbb&&&bb[...................GJsbbbbbbbbbbbbbbbbbbbojmmmmmooooooooobbbboooooooooooooooobboofFooobbbbbbbb&&&bbfffffffffffffffffffffobbbbbbbbbbbbbbbbbbbbboooooo0',
'.............................................................................................................................$...............................................*..........................888.................................................@...............$..+.$......................888.444...............................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv......................444.464.......VcUucv..................VcUuCv.......Tt.....................Tt........................464.444.........Tt.............VUuv.....Tt.........Tt.....................Tt........................444.444.........Tt..............Tt......Tt.........Tt.....................Tt...........VUuv.........444.464....VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt..........464.4a4~n...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt......NkLN4!4Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt.....ImmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt.....JsoooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt.....sbbbbbbbb0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSjmi........i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaWBBBBBBBBBBBBBBBBBOOE........BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa]09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaaaaWBBBBBBBEaaaa........BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaaaa090$$Aaaaa09aaaaaaaWBBBBEaaaaa.....888BAAAAAaaaaaaaaazbbbbyaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBZaaaaaaaaaaaaaaaaa.....444BAAAAAaaaaaaaaaebbbbwaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBZaaaaaaaaaaaaaaa.....464BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBBZ09aaaaaaaaaaaaN....444BAAAAAaaaaaaaaaaaaaaaaaaaaaa$09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBBBBBaaaaaaaaaa0Ymi...444BZAAAAaa90aaaaaaaaaaaaa09aaaYBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBBBBEaaaaaaaaaYBBSji..464BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaWBBBBBBEaaa@aaaaaYBBBBSji.4!4BBBZaYBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaaBBBBBBaaaaXxaaaaBBBBBBSjMmmmBBBBBBBBBBBBBBBBBBBBBBBBBEaaWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBa$AaaaaWBBBBEaaaaaaaaaaWBBBBBBOOOOO0',

'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgtttVttttttttttttttttttttVtttttttVtttttttVtttttttVtttttttt3333333GbbbbPbbbbg..........d..Gbg......Gbg...D....................D.......D.......D.......D........3333333Gbbbbbbbbbg..........d..GPg......ttt...D....................D.......D.......D.......D........3p353p3Gtttttttvtt..........d.*Gbg............C....................D.......D.......D.......D........333!333G.......d............d..ttt.........IHhhF.........@....fHF..D.......D.......D.......D.......fhhhhhhhb.......d............d.............IJbbPg.........XWwx.Gbg..D.......D.......D.......D.......tEtEtEttG.......d............c.{..........IJbbbbg...$.1..).$...Gbg..D.......D.......D.......D........D.D.D..G.......d...........IhhHi.l..$.@..Gbbbbbg....fhhhhF....Gbg..D.......D.......D.......D........D.D.D..G.......c.N...l.$..IJBPbjhhhF..Xx.Gbbbbbg....tETTEt....Gbg..D.......D.......D.......D........D.D.D..G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg.....D..D.....Gbji.C.......C.......C.......C...1....C.C.C1IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjHhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhJb1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',

'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D...&..D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......L3%3Gbbbbg11..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..3......D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..3......C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$3......&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.C...n&&&&&&&&&3.....&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWB........................................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaaa09aaaaWBBBaaaaaaa........................................BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaa........................................BAAAAAaaaaaaaaaYBBBByaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZaa09a........................................BAAAAAaaaaaaaaaWBBBBEaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaa09YBBBBBEaaaaaaaaWBEaaBBBBEaaaa........................................BZAAAAaa90aaaaaaaaaaaaa0a0$aYBBBBBBBBaaaaaa0aaaaaaaWBEaaaaaa........................................BBZAAAaYBBZa)aaaaaaaaaYBBBaaBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09........................................BBBZ9YBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBB........................................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................0',
'....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWB........................................BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaaaaaaaaaWBBBaaaaaaa........................................BAAAAWBBEaaaaaa$-aaa$aWBBBBBBBBBBEaaaaa]aYBBBBZaaaBBBZaaaaaa........................................BAAAAAaaaaaaaaaYBBBByaaWBBBBBBBBEaaaaYBBBBBBBBBZaaWBBBZaaaaa........................................BAAAAAaaaaaaaaaWBBBBEaaaaaaaaaaaaaaYBBBBBBBBBBBBZaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBB........................................BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBEaaaaaaaaWBEaaBBBBEaaaa........................................BZAAAAaaaaaaaaaaaaaaaaaaaa$aYBBBBBBBBaaaaaaaaaaaaaaWBEaaaaaa........................................BBZAAAaYBBZa)aaaaaaaaaYBBBaaBBBBBBBBBaaaaaYBZaaaaaaaaaaaaaaa........................................BBBZAYBBBBBBBBZaaaa{aYBBBBaaBBBBBBBBBZaaYBBBBZaa+aaaaaYBBBBB........................................BBBBBBBBBBBBBBBBBBBBBBBBBBaaBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB........................................0',
'..............................................KLn................................................................................................Gmmmg.................................nlkn........................*..................................bbb.................................Immmmi.....................................................777..bbb...............................nIJsoooji.......888...........$..(...$.@.....................333..bbb..777.........................ImJsbbbboji......444............VcUucv$.Xdx.$...]$............353.}bbb..333......................nnIJsobbbbbboji.....464..............Tt.........VUuv............n3%3NIbbbi.353.........*...........ImmJsbbbbbbbbboji....444..............Tt..........Tt............ImmmmmJbbbji3^3....................IJsoobbbbbbbbbbboji...444..............Tt......1...Tt..kL.......IJsooooobbbojmmmmg.................IJsbbbbbbbbbbbbbbboji..464..~n.lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbbbbbbooooo.................IJsbbbbbbbbbbbbbbbbboji.4!4.mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbbbbbbb[...................GJsbbbbbbbbbbbbbbbbbbbojmmmmmooooooooobbbboooooooooooooooobboofFooobbbbbbbbbbbbbfffffffffffffffffffffobbbbbbbbbbbbbbbbbbbbboooooo0',
'..............................................KLn................................................................................................Gmmmg.............................................................*..................................bbb............................................................................................777..bbb.............................................................$..(...$.@.....................333..bbb..............................................................VcUucv$.Xdx.$...]$............353.}bbb................................................................Tt.........VUuv............n3%3NIbbb................................................................Tt..........Tt............ImmmmmJbbb................................................................Tt......1...Tt..kL.......IJsooooobbb....................................................~n.lkn.]1+n.Tt.N.n-11{.NTtnImmi)$$nLIJsbbbbbbbbb...................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbbbbb...................................................ooooooooobbbboooooooooooooooobboofFooobbbbbbbbbbb...................................................0',
'..........................................b...................................................................................................b...................................................................................................b......................................................................................888..........b...................................................................$..)...$.@.........444..........b....................................................................VcUucv$.Xdx......$464..........b......................................................................Tt.........VUuv.444........nNb......................................................................Tt..........Tt..444.......Immb......................................................................Tt..........Tt..464......IJsbb..........................................................~n.lkn.n1.n+Tt.N.n.-.2.NTtn.4!4n..nLIJsbbb.........................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMMMMMmgGmmJsbbbb.........................................................ooooooooobbbboooooooooooooooooooofFooobbbbb.........................................................0',
'.........................................................................................................................................................................................................................................................................................................................................888..............................................................................$..).(.$.@.........444...............................................................................VcUucv$.Xdx......$464.................................................................................Tt..............444........nN.......................................................................Tt..............444.......Imm.......................................................................Tt..............464......IJsb...........................................................~n..knnn2.n+TtN....-.12N.N..4!4n..n.IJsbb..........................................................mmmmmmmmmmmmmmMMMMMMMMMMMMMMMMMMmgGmmJsbbb..........................................................ooooooooobbbboooooooooooooooooooofFooobbbb..........................................................0',
'.................$%............................................................................................Ihhhhhhhhhhii......................................................................................Iaaaaaaaaaaaaii....................................................................................Ia..aaaaaaaa..aai..................................................................................Iaa..aaaaaaaa..aaai................................................................................Iaaaaaaaaaaaaaaaaaaai..............................................................................Iaaaaaaaaaaaaaaaaaaaaaa............................................................................Iaaaaaaaaaaaaaaaaaaaaaaaa......................................................................~...Iaaaaaaaaaaaaaaaaaaaaaaaaaa.....................................................................mmmIaaaaaa..............aaaaaaaa....................................................................baaaaaaaAAAAAAAbbbbbbbbbbbbbbbbbbbbbbbbbbbb.........................................................bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.........................................................0',
'.........................................................................................................................................................................................................................................................................................................................................888..............................................................................$......$.@.........444...............................................................................VcUucv$.Xdx......$464....................................................................................aaaaa........444........nN....................................................................nn....aaaaa........444.......Imm...................................................................Immi...aYBya........464......IJsb...........................................................~n..kL.IJsoji.NzbbBZ.12N.N..4!4n..n.IJsbb..........................................................mmmmmmmmJsbbojMMMMMMMMMMMMMMMMMMmgGmmJsbbb..........................................................ooooooooobbbboooooooooooooooooooofFooobbbb..........................................................0',
'...................................................................................................................*.................................VcUucv..........................................................$..).$................................Tt..................n.nKLN.....................................VUuv....$n+N$...............nLN......Tt.................Immmmmmi...................888...............Tt.....Ghhhg.....]n$......GHHHg.....Tt................IJsoooooji..................444.....nnN.......Tt..............Immg................TtN.$n.].n.lN$$nlIJsbbbbbboji.LnN)))lk$.......464....Ghhhg......Ttn............IJoo................ImmmgGhhhhhhhhgGmmJswaaaaaaeojmmmmmmmmmi.......444..............Immmi..........IJsbblkn.......N....IJsoo............ooowaaaaaaaaeoooooooooob2......464.nlk~N..n....IJsooji........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa22.....4!4mmmmmmmmmg$kIJsbbboji......IJsbbbbooon.L...ooojmJsbbbb.-....KL..IJbbbyaaaaaaaaaaaaaaaaaaaa222.N.Immmooooooooo.GmJsbbbbboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoobbbbbbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0',
'...........................................................................................................................................................................................................................................................................................................................................................................................................................VUuv.................................................................................................Tt.............VUuv.................................................................................Tt..............Tt.............................................................................VUuv.Tt..............Tt.......................................................................NkLn...Tt..Tt..............Tt......................................................................mmmmmi..Tt..Tt.....VUuv.....Tt......................................................................OOOOSj..Tt..Tt......Tt......Tt......................................................................BBBBBS..Tt..Tt......Tt......Tt......................................................................0',
'bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgttttvtttttttttttttttttttVtttttttVtttttttVtttttttVtttttttV5555555bbbbbbbbbbg..........d..Gbg......Gbg....d...................D.......D.......D.......D.......D5555555bbbbbbbbbbg..........d..GPg......ttt....d...................D.......D.......D.......D.......D5555555btttttttvtt..........d.*Gbg.............c...................D.......D.......D.......D.......D5555555b.......d............d..ttt..........IhhF..............fHF..D.......D.......D.......D.......D5555555b.......d............d..............IJbPg.........XWwx.Gbg..D.......D.......D.......D.......D5555555b.......d............c.............IJbbbg..............Gbg..D.......D.......D.......D.......D5555555b.......d...........IhhHi.........IJbbbbg..............Gbg..D.......D.......D.......D.......D5q555q5b.......c.....l....IJBPbjhhF...Xx.Gbbbbbg..............Gbg..D.......D.......D.......D.......D5553555b.~..IHHHHHHHHF..fhJBBBbbbbgyyyyyyGbbbbbg..............Gbji.C.......C.......C.......C.......C555!555bHHHHJBBBBBBBBgyyGbBBBBbbbbgzZZZZZGbbbbbgYYYYYYYYYYYYYYGbbjmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmb1', */
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
