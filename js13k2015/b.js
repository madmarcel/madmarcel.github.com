!function t(i,s,h){function a(b,n){if(!s[b]){if(!i[b]){var r="function"==typeof require&&require;if(!n&&r)return r(b,!0);if(e)return e(b,!0);var o=new Error("Cannot find module '"+b+"'");throw o.code="MODULE_NOT_FOUND",o}var l=s[b]={exports:{}};i[b][0].call(l.exports,function(t){var s=i[b][1][t];return a(s?s:t)},l,l.exports,t,i,s,h)}return s[b].exports}for(var e="function"==typeof require&&require,b=0;b<h.length;b++)a(h[b]);return a}({1:[function(t){!function(){"use strict";var i=t(6),s=t(12),h=t(8),a=null,e=0,b=1,n=2,r=3,o=function(){var t=this;this.images=[];var h=document.querySelector("#g");this.ctx=h.getContext("2d"),this.ctx.imageSmoothingEnabled=this.ctx.mozImageSmoothingEnabled=this.ctx.oImageSmoothingEnabled=!1,this.gameSize={width:h.width,height:h.height},this.state=e,this.keyboarder=new i,this.loadingScreen=new s(this,"#000",["Loading..."]),this.titleScreen=new s(this,"#6b036e",["Super Dragon Rescue","made for #js13k","Code by","madmarcel","Art by","surt & madmarcel"],"S","start",n),this.loadImgs();var a=1e3/60,b=function(){t.render(),requestAnimationFrame(b)};b();var r=function(){t.update(),setTimeout(r,a)};r()};o.prototype={render:function(){switch(this.ctx.clearRect(0,0,this.gameSize.width,this.gameSize.height),this.state){case e:this.loadingScreen.render(this.ctx);break;case b:this.titleScreen.render(this.ctx);break;case r:this.level.render(this.ctx)}},update:function(){switch(this.state){case e:this.loadingScreen.update();break;case b:this.titleScreen.update();break;case n:this.level=new h(0,this,!1),this.state=r;break;case r:this.level.update()}},loadImgs:function(){for(var t=this,i=["s"],s=function(s){s>=i.length&&(t.titleScreen.lvl=new h(0,t,!0),t.state=b)},a=0,e=0;e<i.length;e++){var n=new Image;n.onload=function(){a++,s(a)},n.src=i[e]+".png",t.images[e]=n}}},window.addEventListener("load",function(){a=new o})}()},{12:12,6:6,8:8}],2:[function(t,i){"use strict";var s=function(t,i){this.ss=t,this.data=i,this.c=0,this.s=4,this.ts=(new Date).getTime()};s.prototype={render:function(t,i,s,h){this.data;i?t.drawImage(this.ss,this.f(0),this.f(1),this.f(2),this.f(3),s,h,this.f(2)*this.s,this.f(3)*this.s):(t.save(),t.translate(t.canvas.width,0),t.scale(-1,1),t.drawImage(this.ss,this.f(0),this.f(1),this.f(2),this.f(3),t.canvas.width-s-this.f(2)*this.s,h,this.f(2)*this.s,this.f(3)*this.s),t.restore())},update:function(){var t=(new Date).getTime();t-this.ts>this.f(4)&&(this.ts=t,this.c=this.f(5))},f:function(t){return this.data[t+6*this.c]}},i.exports=s},{}],3:[function(t,i){"use strict";function s(t,i,s,a,e){this.lvl=t,this.x=i,this.y=s,this.width=64,this.height=64,this.velX=0,this.velY=0,this.speed=.5,this.gravity=.9,this.friction=.9,this.goingLeft=this.dead=!1,this.isMonster=this.grounded=!0,this.harmless=!1;var b=[112,32,16,16,300,1,128,32,16,16,300,2,144,32,16,16,300,3,160,32,16,16,300,4,144,32,16,16,300,5,128,32,16,16,300,0],n=[160,32,16,16,300,4];if(this.t=e,1===e&&(b=[176,32,16,16,400,1,192,32,16,16,400,0],n=[208,32,16,16,1e3,0],this.speed=.25),2===e&&(this.harmless=!0,this.speed=0,b=n=[48,48,16,16,1e3,0]),3===e&&(this.harmless=!0,this.speed=0,b=n=[48,32,16,16,1e3,0]),2>e&&a){for(var r=1;r<b.length;r+=6)b[r]+=16;n[1]+=16}this.anim=new h(this.lvl.parent.images[0],b),this.shan=new h(this.lvl.parent.images[0],n),this.blo=[],this.state=0,this.grabbed=!1,this.id=this.guid()}var h=t(2);s.prototype={guid:function(){var t=function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)};return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()},update:function(){if(this.dead)return this.y<800&&(this.velX=2,this.goingLeft&&(this.velX=-2),this.velY=15,this.y+=this.velY,this.x+=this.velX),void 0;if(1===this.state);else{this.t<2&&(this.goingLeft?this.velX>-this.speed&&this.velX--:this.velX<this.speed&&this.velX++),this.velX*=this.friction,this.velY+=this.gravity,this.grounded=!1;var t=this.blo,i=-1;this.goingLeft&&t.reverse(),this.state>0&&(t=t.filter(function(t){return!t.isPlayer&&!t.mb}));for(var s=this.lvl.player,h=0;h<t.length;h++)if(t[h].y!==i){var a=s.colCheck(this,t[h]);null!==a&&2===this.state&&t[h].isMonster&&!t[h].harmless&&(t[h].isBoss?t[h].hit():t[h].dead=!0,this.dead=!0),null!==a&&(this.state=0,this.grabbed=!1),"l"===a||"r"===a?s.onSlope(t[h],this)?i=t[h].y:(this.velX=0,this.harmless||(this.goingLeft=!this.goingLeft)):"b"===a&&(s.onSlope(t[h],this)?i=t[h].y:(this.grounded=!0,t[h].pl&&this.velX<.2&&(this.x+=2*t[h].velX)))}this.grounded&&(this.velY=0,this.state=0),this.x+this.velX>0&&this.x+this.width+this.velX<this.lvl.width&&(this.x+=this.velX),this.y+=this.velY}this.anim.update()},render:function(t){var i=this.x+this.lvl.viewport.x;this.y<800&&(this.state>0?this.shan.render(t,this.goingLeft,i,this.y):this.anim.render(t,this.goingLeft,i,this.y))},blockfilter:function(t){return t.exit||t.pickup||t.next||t.dest||t.isPlayer?!1:t.id&&t.id===this.id?!1:!0},grab:function(){this.state=1,this.grabbed=!0},chuck:function(t,i){this.state=2,this.velX=10,(t>.3||-.3>t)&&(this.velX=25),this.goingLeft&&(this.velX*=-1),this.velX+=t,this.velY=-6+i}},i.exports=s},{2:2}],4:[function(t,i){"use strict";function s(t,i,s,h){this.x=t,this.y=i,this.width=s,this.height=h,this.tr=this.tl=this.dead=this.pickup=this.exit=this.pl=this.mb=this.next=this.dest=this.kill=!1}i.exports=s},{}],5:[function(t,i){"use strict";function s(t,i,s,a,e,b,n){this.lvl=t,this.x=i,this.y=s,this.fb=!0,this.width=32,this.height=32,this.dead=!1,this.kill=!0,this.velX=a,this.velY=e,this.sx=b,this.sy=n;var r=[256,49,8,8,50,1,264,49,8,8,50,0];this.anim=new h(this.lvl.parent.images[0],r)}var h=t(2);s.prototype={update:function(){this.dead||(this.anim.update(),this.x+=this.velX,this.y+=this.velY,this.velX+=this.sx,this.velY+=this.sy,(this.x<0||this.y<0||this.y>800||this.x>3e3)&&(this.dead=!0))},render:function(t){if(!this.dead){var i=this.x+this.lvl.viewport.x;this.anim.render(t,!0,i,this.y)}}},i.exports=s},{2:2}],6:[function(t,i){"use strict";var s=function(){var t=this;this.keyState={},window.addEventListener("keydown",function(i){t.preventKeys.indexOf(i.keyCode)>-1&&(i.preventDefault(),i.stopPropagation()),t.keyState[i.keyCode]=!0}),window.addEventListener("keyup",function(i){t.keyState[i.keyCode]=!1}),this.KEYS={LEFT:37,RIGHT:39,UP:38,DOWN:40,SPACE:32,ENTER:13,ESC:27};for(var i=65;91>i;i++)this.KEYS[String.fromCharCode(i)]=i;this.preventKeys=[this.KEYS.LEFT,this.KEYS.RIGHT,this.KEYS.UP,this.KEYS.DOWN,this.KEYS.SPACE,this.KEYS.ENTER,this.KEYS.ESC]};s.prototype={isDown:function(t){return this.keyState[this.KEYS[t]]===!0},isUp:function(t){return this.keyState[this.KEYS[t]]===!1}},i.exports=s},{}],7:[function(t,i){"use strict";function s(t,i,s,a){this.lvl=t,this.x=i,this.y=s,this.width=56,this.height=108,this.dead=this.door=this.pickup=this.isKnight=!1;var e=[[333,32,14,27,1e3,0],[347,32,24,17,1e3,0],[64,48,16,16,1e3,0],[240,48,16,16,1e3,0]];this.anim1=new h(this.lvl.parent.images[0],e[0]),this.anim2=new h(this.lvl.parent.images[0],e[1]),0===a?this.isKnight=!0:1===a?(this.anim1.data=e[2],this.width=this.height=64,this.door=!0):(this.anim1.data=e[3],this.width=this.height=64,this.pickup=!0),this.t=a}var h=t(2);s.prototype={update:function(){},render:function(t){if(!this.dead){var i=this.x+this.lvl.viewport.x;this.t>0?this.anim1.render(t,!0,i,this.y):(this.anim1.render(t,!0,i,this.y),this.anim2.render(t,!0,i+50,this.y-50),t.font="50px Verdana",t.fillStyle="#fff",t.fillText("The End",i+20,this.y-100))}}},i.exports=s},{2:2}],8:[function(t,i){"use strict";function s(t,i,s){this.number=t,this.player=null,this.dud=s,this.data=["..........................................*....................................................................................................nL....VcUucv.......................................................................2nN............Ghhhg.....Tt..................n2nKLN....................888.........................Ghhhg..]..................Tt.................Immmmmmi...................444................................Ln$................Tt....$.nKL]n$....IJsoooooji.....+++..........464.....nn1.......................Immg................TtN...Ghhhhhhg$nlIJsbbbbbboji.LnN.NNlk$.......444....Ghhhg........+............IJso................Immmg..........GmmJswaaaaaaeojmmmmmmmmmi.......444NN~...............N..........IJsbblkn.......N....IJsoo............ooowa*aaaaaaeoooooooooob2......464mmmi.NKLn........Imi........IJsbbbmmmg....GmmmilIJsbbb...........Ibbbaaaaaaaaaaaaaaaaaaaaa22.....4!4ooojmmmmmg$lnnNKIJsji......IJsbbbbooon.L...ooojmJsbbbbn-.nn.KLn.IJbbbyaaaaaa(aaaaaaaaaaaaa222.N.Immmbbboooooo.GmmmmmJsboji-nkLIJsbbbbbbbbmmmg..bbbooobbbbbmmmmmmmmmmJsbbbbbbbbbbbyaazbbyaaaaazmmmmmmJsoobbbbbbbbbffoooooobbbojmmmmJsbbbbbbbbboooFFFbbbbbbbbbbbooooooooooobbbbbbbbbbbbbbbbbbbbbbbbbbbbbboobbb0","..............................................&&&............................GJsbbbbbbbbbbbbbbbbbbbb..............................................&&&.............................sbbwaaaaaaaaaebbbbbbbb...........*..................................&&&.............................bbwa$aaaaaaaaaaebbbbbb.........................................777..&&&.............................bwaaaaaa09aaaaaaebbbbb..........$..(...$.@.....................333.+&&&..777.........................aaaaaaabbyaaaaaabbbbb...........VcUucv..Xdx.$...]$............353..&&&..333......................n..aaaaaaabbbyaaaaaebbbb.............Tt.........VUuv............n3%3NI&&&i.353.........*...........Imi.aaaaaaabbbbyaaaaa444b.............Tt..........Tt............ImmmmmJ&&&ji3^3....................IJojmmaaaaaaebbbbyaaaa444b.............Tt......1...Tt..kL.......IJsooooo&&&ojmmmmg.................IJsboooaa#aaaabbbbbyaaa464b.~n.lkn..1+n.Tt.N.n-11..NTtnImmi)$$nLIJsbbbbbb&&&booooo.................IJsbbbbbaaXdxaabbbbbby094!4bmmmmmmmmmmmmmmMMMMMMMMMMMMMMJsojmgGmmJsbbbbbbb&&&bb[...................GJsbbbbbbaaaaaaabbbbbbbbbbbbbooooooooobbbboooooooooooooooobboofFooobbbbbbbb&&&bbfffffffffffffffffffffobbbbbbwaa$aaaaebbbbbbbbbbbb0","....ImmmJBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSjmi........i.~.BBBBBBEaaaaaaaaaaWBBBBBBBBBBBBBBBBEaaaaaaaaaWBBBBEaaaaWBEaaaaaAAaaaaaaaaaaWBBBBBBBBBBOOE........BAAAWBBBBEaaaaaaaaaaaaBBBBBBBBBBBBBEaaaaaa}09aaaaWBBBa{aaaaaaaaaaaAAaaaaaaaaaaaWBBBBBBBEaaaa........BAAAAWBBEaaaaaa$-09a$aWBBBBBBBBBBEaaaaa}aYBBBBZaaaBBBZaaaaaaa1090$$Aaaaaa09a}aaaaWBBBBEaaaaa.....888BAAAAAaaaaaaaaazbbbbyaaWBEaaWBBBEaaa90YBBBBBBBBZaaWBBBZ0a09aYBBBBZAAaaaYBBBBBZaaaaaaaaaaaaaa.....444BAAAAAaaaaaaaaaebbbbwaaaaaaaaaaaaa0YBBBBBBBBBBBBZaaBBBBBBBBBBBBBBEAAaaaBBBBBBBaaaaaaaaaaaaaa.....464BAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaaaYBBBBBBEaaaaWBBBaaBBBBBBBBBEaaaaaAAaaaBBBBBBBZ9aaaaaaaaaaaaN....444BAAAAAaaaaaaaaaaaaaaaaaaaaaa$09YBBBBBEaaaaaaaaWBEaaBBBBEaaaaaaaaaaAAaaaBBBBBBBBBaaaaaaaaaa0Ymi...444BZAAAAaa90aaaaaaaaaaaaa09aaaYBBBBBBBBa*aaaa0aaaaaaaWBEaaaaaaa$0aaaAAaaaBBBBBBBBEaaaaaaaaaYBBSji..464BBZAAAaYBBZa)aaaaaaaaaYBBZ$aBBBBBBBBBaaaaaYBZaaaaaaaaaaa0a09YBBZaa#AaaaWBBBBBBEaaa@aaaaaYBBBBSji.4!4BBBZaYBBBBBBBBZa09a{aYBBBBaaBBBBBBBBBZ09YBBBBZaa+aa09aYBBBBBBBBBZaXdxaaaBBBBBBaaaaXxaaa$BBBBBBSjMmmmBBBBBBBBBBBBBBBBBBBBBBBBBEaaWBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBa$AaaaaWBBBBEaaaaaaaaaaWBBBBBBOOOOO0",".............................................................................................................................$...............................................*................888...888.888.................................................@...............$..+.$................444...444.444...............................$.(..$.....VcUucv$Xx.....$.....Xx$VcUucv................464...464.464.......VcUucv..................VcUuCv.......Tt.....................Tt..................444...444.444.........Tt.............VUuv.....Tt.........Tt.....................Tt..................444888444.444.........Tt..............Tt......Tt.........Tt.....................Tt...........VUuv...444444444.464....VUuv.Tt..............Tt......Tt.........Tt.....................Tt............Tt....444464444.4a4~n...Tt..Tt....$...]$#...Tt......Tt.........Tt.....................Tt.$..(...$...Tt....4444!4444Nmmmmmi..Tt..Tt....VCUucvXdx.Tt......Tt.........Tt..$......].$.........Tt.VccUuCCv...Tt...ImmmmmmmmmmOOOOSj..Tt..Tt......Tt......TtVcUucvTt...VcUucvTt..VcccUuCCCv.....VUuvTt....Tt......Tt...JsoooooooooBBBBBS..Tt..Tt......Tt...$..Tt..Tt..TtVUuv.Tt..Tt......Tt...VUuv...Tt.Tt....Tt......Tt...sbbbbbbbbbb0","bbbbbbbbbbbbbbBBBBbbbbbBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbgttttttttttvttGbgttttttGbgtttVttttttttttttttttVtttttttttVtttGbgtttVtttttttVtttttttt3333333GbbbbPbbbbg..........d..Gbg.....*Gbg...D................D.........D...Gbg...D.......D........3333333Gbbbbbbbbbg..........d..GPg......ttt...D................D.........D...Gbg...D.......D........3p353p3Gtttttttvtt..........d..Gbg............C................C.........C...Gbg...D.......D........333!333G.......d............d..ttt.........IHhhF.........@....fHF.......fhF..Gbg.2.D.......D.......fhhhhhhhb.......d............d.............IJbbPg.........XWx..GbgYYYYYYYGbg..GbbhhhhF......D.......tEtEtEttG.......d............c.{..........IJbbbbg...$.1..).$...GbgZZZZZZZGbg..GbgTTTET......D........D.D.D..G.......d...........IhhHi.l..$.@..Gbbbbbg....fhhhhF....GbgZZZZZZZGbg..TTT...D.......D........D.D.D..G.......c.N..)l.$..IJBPbjhhhF..Xx.Gbbbbbg....tETTEt....GbgZZZZZZZGbg........D.......D........D.D.D..G.~..IHHHHHHHHF..fhJBBBbbbbbgyyyyyGbbbbbg.....D..D.....GbgZZZZZZZGbg........C}.}.1..C........C.C.C1IJHHHHJBBBBBBBBgyyGbBBBBbbbbbgZZZZZGbbbbbgYYYYYYYYYYYYYYGbgZZZZZZZGbgMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMhJb1","bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..................................TTTTVTTTTTTT333GbbbbgttttVttttttVtttVttGbgtTTTVtTTTTVTTTGbbbbbbbbb......................................D.......333Gbbbbg....D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.......353Gbbbbg1...D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D.....)L3%3Gbbbbg12..D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D......&&&&Gbbbbg&&&.D......D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....l&&&&&Gbbbbg333.D&.....D...D..Gbg....D.....D...Gbbbbbbbbb......................................D....&&&&&&Gbbbbg333.D......D...D..AAA....D.....D...Gbbbbbbbbb......................................D...&&&&&&&Gbbbbg333&D......D...D..AAA....C..U..C...Gbbbbbbbbb......................................D..&&&&&&&&Gbbbbg353.D...$..C.u.Cl$AAA....&&&&&&&...Gbbbbbbbbb...................................~.nC.&&&&&&&&&Gbbbbg3^3.CL..n&&&&&&&&&AAA...&&&&&&&&&..Gbbbbbbbbb..................................hhhhhhhhhhhhhhhBbbbbbmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmbbbbbbbbbb..................................1"],this.parent=i,this.height=12,this.width=0,this.tilesize=16,this.scale=4,this.tileset=0,s&&(this.number=this.rand(0,this.data.length-1)),this.setup(),this.init(this.buffers[0],!1),this.init(this.buffers[1],!0)}var h=t(10),a=t(13),e=t(9),b=t(4),n=t(3),r=t(11),o=t(7);s.prototype={rand:function(t,i){return Math.floor(Math.random()*(i-t+1))+t},genBG:function(t,i,s){if(1===this.tileset){for(var h=[10,15,16,17],a=0,e=0,b=0;100>b;b++)a=this.rand(0,i-1),e=this.rand(0,s-1),t[a][e]=14;for(e=5,a=this.rand(5,8);i>a;a+=this.rand(4,7)){var n=this.rand(0,3);e=this.rand(3,5),t[a][e]=h[n],3===n&&(t[a][e+1]=h[n]+1)}}else for(var r=[[17,0],[-16,-17],[16,15]],b=[[1,1,2,0],[0,0,1,1,2,0],[0,-1,2,-1,1,0]],o=0,l=0,B=this.rand(4,8),g=0;i>g;g++){t[g][B]=r[o][0],t[g][B+1]=r[o][1];for(var d=B+2;d<this.height;d++)t[g][d]=0;if(B>9){for(var v=-1;0>v;)l=2*this.rand(0,b[o].length/2-1),v=b[o][l+1];B-=b[o][l+1],o=b[o][l]}else if(2>B){for(var v=1;v>0;)l=2*this.rand(0,b[o].length/2-1),v=b[o][l+1];B-=b[o][l+1],o=b[o][l]}else l=2*this.rand(0,b[o].length/2-1),B-=b[o][l+1],o=b[o][l]}},genBlockers:function(t,i,s){this.blockers=[];for(var a=this.tilesize*this.scale,l={player:["~"],exit:["!","%","^"],blob:["-","+","(",")"],gblob:["(",")"],lblob:[")","+"],turt:["[","]","{","}"],bturt:["{","}"],lturt:["]","}"],items:["1","2"],chilli:["*"],monsterblock:["$"],ignore:["3","4","5","6","7","8","9","0","@","#"]},B=[{t_l:[-24,-8,25],t_r:[8,-7,24],ign:[6,-26,10,-22,11,-21,-13,19,-19,13,-32,0],half:[7,-25,-11,21,-12,20,-30,2,-28,4,-10,22],plat:[-29,3,-9,23],dead:[5,-27],item:[],boss:[],kni:[],door:[],merge:[-20,12,-18,14,-31,1,-12,20,-11,21,-30,2,-25,7,-59]},{t_l:[-24],t_r:[8],ign:[-21,11,-19,13,-30,2,-29,3,-17,15,-16,16],half:[-13,19,-11,21],plat:[-10,22,-9,23],dead:[-7,25,-8,24],item:[],boss:[20],kni:[-12],door:[-32],merge:[-31,1,-27,5,-26,6,-25,7,-23,9,-20,12,-59]}],g=[],d=B[this.tileset],v=l,f=0;s>f;f++)for(var u=0;i>u;u++){var m=t[u][f],c=String.fromCharCode(m+97);if(-51!==m){var p=new b(u*a,f*a,a,a),w=!1;if(this.io(v.player,c)&&(w=!0,this.player=new h(this.parent,u*a,f*a,this.viewport),t[u][f]=-51,this.chkCave(t,u,f)),this.io(v.monsterblock,c)&&(p.mb=!0,w=!1,this.chkCave(t,u,f)),this.io(v.items,c)){w=!0;var x=new n(this,u*a,f*a,!1,"1"===c?2:3);this.things.push(x),this.blockers.push(x),t[u][f]=-51,this.chkCave(t,u,f)}if(this.io(v.blob,c)){w=!0;var x=new n(this,u*a,f*a,this.io(v.gblob,c),0);x.goingLeft=this.io(v.lblob,c),this.things.push(x),this.blockers.push(x),t[u][f]=-51,this.chkCave(t,u,f)}if(this.io(d.boss,m)){w=!0;var y=new r(this,u*a,f*a);this.things.push(y),this.blockers.push(y),t[u][f]=-51}if(this.io(d.kni,m)){w=!0;var y=new o(this,u*a,f*a-44,0);this.things.push(y),this.blockers.push(y),t[u][f]=-51}if(this.io(v.chilli,c)){var y=new o(this,u*a,f*a,2);this.things.push(y),this.blockers.push(y),t[u][f]=-51,this.chkCave(t,u,f),w=!0}if(this.io(v.turt,c)){w=!0;var x=new n(this,u*a,f*a,this.io(v.bturt,c),1);x.goingLeft=this.io(v.lturt,c),this.things.push(x),this.blockers.push(x),t[u][f]=-51,this.chkCave(t,u,f)}if(this.io(v.ignore,c)&&(w=!0),this.io(v.exit,c)&&("%"===c?p.next=!0:"^"===c?p.dest=!0:p.exit=!0),this.io(d.door,m)){var y=new o(this,u*a,f*a,1);this.things.push(y),this.blockers.push(y),t[u][f]=-51,w=!0}if(this.io(d.plat,m)){var T=u*a,k=f*a,y=u,D=t[y][f],Y=!1,G=String.fromCharCode(t[y][f-1]+97);for(("#"===G||"@"===G)&&(t[u][f-1]=-51,this.chkCave(t,u,f-1),"#"===G&&(Y=!0));this.io(d.plat,D);)t[y][f]=-51,this.chkCave(t,y,f),y++,D=t[y][f];var X={b:null,c:null};this.createImage(y*a-T,a,X);var M=new e(this,X,y*a-T,a/2,T,k,Y);M.init(this.tileset,this.tilesize,this.tilesize*this.scale,y-u),this.things.push(M),this.blockers.push(M),w=!0}if(this.io(d.t_l,m))p.tr=!0,g.push([u,f+1]);else if(this.io(d.t_r,m))p.tl=!0,g.push([u,f+1]);else if(this.io(d.half,m))p.height=a/2;else if(this.io(d.ign,m))w=!0;else if(this.io(d.dead,m)){p.kill=!0,p.y+=a/2,p.height=a/2;for(var T=u*a,y=u+1,D=t[y][f];this.io(d.dead,D);)g.push([y,f]),this.chkCave(t,y,f),y++,D=t[y][f];p.width=y*a-T}for(var A=0;A<g.length;A++)g[A][0]===u&&g[A][1]===f&&(w=!0);if(!w){if(this.io(d.merge,m)&&i-1>u){for(var T=u*a,y=u,D=t[y][f];this.io(d.merge,D)&&i-1>y;)g.push([y,f]),y++,D=t[y][f];p.width=y*a-T}this.blockers.push(p)}}}this.player.boxes=this.blockers;for(var E=0;E<this.things.length;E++){var S=this.things[E];!S.isMonster||S.isKnight||S.pickup||(S.blo=this.blockers.filter(S.blockfilter,S))}},chkCave:function(t,i,s){(0===t[i-1][s]||0===t[i+1][s]||0===t[i][s-1])&&(t[i][s]=0)},init:function(t,i){this.viewport=new a(this.parent.gameSize);var s=[];this.tileset=parseInt(this.data[this.number][this.data[this.number].length-1],10),this.emptyTilemap(s,t.w,this.height,this.tileset-1),i?(this.convertTilemap(s,this.data[this.number],t.w),this.genBlockers(s,t.w,this.height)):this.genBG(s,t.w,this.height),this.createImage(t.w*this.tilesize*this.scale,this.parent.gameSize.height,t),this.drawTileMap(t.c,s,this.height,t.w)},update:function(){this.dud||this.player.update();for(var t=this.things.filter(this.viewport.vis,this.viewport),i=0;i<t.length;i++)t[i].update()},render:function(t){for(var i=0;i<this.buffers.length;i++)null!==this.buffers[i].b&&t.drawImage(this.buffers[i].b,Math.floor(this.buffers[i].xo),0,t.canvas.width,t.canvas.height,0,0,t.canvas.width,t.canvas.height);if(!this.dud){var s=0,h=this.things.filter(this.viewport.vis,this.viewport);for(s=0;s<h.length;s++)h[s].render(t,Math.floor(this.viewport.x));this.player.render(t,Math.floor(this.buffers[1].xo))}},drawTile:function(t,i,s,h,a,e){if(!(0>i)){var b=this.tilesize*this.scale,n=this.tileset;e>-1&&(n=e),a?(t.save(),t.translate(t.canvas.width,0),t.scale(-1,1),t.drawImage(this.parent.images[0],i*this.tilesize,n*this.tilesize,this.tilesize,this.tilesize,t.canvas.width-s*b-b,h*b,b,b),t.restore()):t.drawImage(this.parent.images[0],i*this.tilesize,n*this.tilesize,this.tilesize,this.tilesize,s*b,h*b,b,b)}},createImage:function(t,i,s){var h=document.createElement("canvas");h.width=t,h.height=i;var a=h.getContext("2d");a.imageSmoothingEnabled=a.mozImageSmoothingEnabled=a.oImageSmoothingEnabled=!1,s.b=h,s.c=a},move:function(t){this.buffers[1].xo+=t,this.buffers[0].xo+=t/2},emptyTilemap:function(t,i,s,h){for(var a=0;i>a;a++){t[a]=[];for(var e=0;s>e;e++)t[a].push(h)}},convertTilemap:function(t,i,s){for(var h=0,a=0,e=0;e<i.length;e++)t[h][a]=i[e].charCodeAt()-97,h++,h>s-1&&(h=0,a++)},drawTileMap:function(t,i,s,h){for(var a=["4","6","8"],e=["3","5","7"],b=["!","%","^"],n=["&","9","0"],r=!1,o=-1,l=0;s>l;l++)for(var B=0;h>B;B++){var g=String.fromCharCode(i[B][l]+97);r=!1,i[B][l]<-6&&(i[B][l]+=32,r=!0),this.io(a,g)&&(o=2,i[B][l]=parseInt(g,10)/2+2,r=!1),this.io(e,g)&&(o=3,i[B][l]=(parseInt(g,10)+1)/2+2,r=!1),this.io(b,g)&&(i[B][l]=0,o=0),this.io(n,g)&&(o=2,i[B][l]=14,r=!1,"&"===g&&(i[B][l]=15),"0"===g&&(o=3)),this.drawTile(t,i[B][l],B,l,r,o),o=-1}},io:function(t,i){return t.indexOf(i)>-1},next:function(t){this.number++,this.number>this.data.length-1&&(this.number=0),this.bl(),t&&(this.player.lives=t.lives,this.player.chi=t.chi)},bl:function(){this.setup(),this.init(this.buffers[0],!1),this.init(this.buffers[1],!0)},restart:function(t){this.bl(),this.player.lives=t.lives,this.player.chi=0},setup:function(){this.buffers=[{b:null,c:null,w:80,xo:0},{b:null,c:null,w:100,xo:0}],this.width=this.buffers[1].w*this.tilesize*this.scale,this.blockers=[],this.things=[],this.viewport=null}},i.exports=s},{10:10,11:11,13:13,3:3,4:4,7:7,9:9}],9:[function(t,i){"use strict";var s=function(t,i,s,h,a,e,b){this.x=a,this.y=e,this.width=s,this.height=h,this.lvl=t,this.buffer=i,this.velX=0,this.velY=0,this.speed=3,this.pl=!0,this.goesUp=b};s.prototype={render:function(t,i){t.drawImage(this.buffer.b,this.x+i,this.y)},update:function(){var t=this.lvl.blockers;t=t.filter(function(t){return!t.pl});for(var i=0;i<t.length;i++){var s=this.lvl.player.colCheck(this,t[i]);this.goesUp?("b"===s&&(this.velY=-1),"t"===s&&(this.velY=1)):("l"===s&&(this.velX=1),"r"===s&&(this.velX=-1))}this.x+=this.velX,this.y+=this.velY},init:function(t,i,s,h){var a=[[23,3,23],[23,22,23]],e=[],b=0;for(e.push(a[t][0]),b=0;h-2>b;b++)e.push(a[t][1]);e.push(a[t][2]);var n=!0;for(b=0;b<e.length;b++)this.lvl.drawTile(this.buffer.c,e[b],b,0,n,t),n=!1;this.goesUp?this.velY=1:this.velX=1}},i.exports=s},{}],10:[function(t,i){"use strict";function s(t,i,s,a){this.lives=3,this.chi=0,this.game=t,this.viewport=a,this.x=i,this.y=s,this.width=64,this.height=64,this.boxes=[],this.isPlayer=!0,this.mx=this.x+this.width/2,this.by=this.y+this.height,this.velX=0,this.velY=0,this.speed=5,this.jumping=!1,this.gravity=.2,this.grounded=!0,this.friction=.9,this.goingLeft=!1,this.vx=0,this.onPlatform=!1,this.holding=null;var e=[[16,32,16,8,1e3,0],[16,40,16,8,200,1,15,48,16,8,200,2,16,56,16,8,200,3,32,32,16,8,200,0],[33,40,15,14,1e3,0]],b=[[0,32,16,11,400,0],[0,54,16,11,400,0],[32,54,16,11,400,0],[347,49,25,16,1e3,0],[240,48,16,16,1e3,0]];this.ho=[[-12,12,0],[-12,12,0],[-12,12,-16]],this.cba=0,this.cha=0,this.ab=[new h(this.game.images[0],e[0]),new h(this.game.images[0],e[1]),new h(this.game.images[0],e[2])],this.ah=[new h(this.game.images[0],b[0]),new h(this.game.images[0],b[1]),new h(this.game.images[0],b[2]),new h(this.game.images[0],b[4])],this.ouch=new h(this.game.images[0],b[3]),this.release=!0}var h=t(2);s.prototype={died:function(){this.lives-=1,this.dead=!0},render:function(t){var i=this.x+this.viewport.x;this.ab[this.cba].render(t,this.goingLeft,i,this.y+32+this.ho[this.cha][2]),this.ah[this.cha].render(t,this.goingLeft,i+this.ho[this.cha][this.goingLeft?0:1],this.y-12),this.dead&&(this.ouch.render(t,!0,i+40,this.y-84),this.y>=790&&(t.fillStyle="#000",t.globalAlpha=.75,t.fillRect(262,200,500,250),t.globalAlpha=1,t.textAlign="center",t.fillStyle="#fff",t.font="35px Verdana",this.lives>0?this.drwLvs(t,440,270,0,this.lives):t.fillText("Game Over!",512,310),t.font="22px Verdana",t.fillText("Press R to continue",512,400))),this.drawHud(t)},drawHud:function(t){this.drwLvs(t,10,10,0,this.lives),this.drwLvs(t,10,60,3,this.chi)},drwLvs:function(t,i,s,h,a){t.font="35px Verdana",this.ah[h].render(t,!1,i,s),t.fillText("x "+a,i+110,s+40)},onSlope:function(t,i){if(t.tr||t.tl){var s=t.x,h=t.y+t.height;if(t.tr){var a=Math.floor(h-(i.x+i.width/2-s));i.y>=a-i.height&&(i.y=a-i.height,i.velY=0,i.grounded=!0,i.jumping=!1,this.cba=1,this.cha=1)}else if(t.tl){var a=Math.floor(h-(t.height-(i.x+i.width/2-s)));i.y>=a-i.height&&(i.y=a-i.height,i.velY=0,i.grounded=!0,i.jumping=!1,this.cba=1,this.cha=1)}return!0}return!1},update:function(){var t=this.game.keyboarder;if(this.dead){if(this.y<800)return this.velX=0,this.velY=8,this.y+=this.velY,this.cba=2,this.cha=2,this.ab[this.cba].update(),this.ah[this.cha].update(),void 0;t.isDown("R")&&(this.lives>0?this.game.level.restart(this):this.game.state=1)}if(t.isDown("LEFT")&&(this.velX>-this.speed&&(this.velX--,this.grounded?(this.cba=1,this.cha=1):(this.cba=2,this.cha=2)),this.goingLeft=!0),t.isDown("RIGHT")&&(this.velX<this.speed&&(this.velX++,this.grounded?(this.cba=1,this.cha=1):(this.cba=2,this.cha=2)),this.goingLeft=!1),(t.isDown("SPACE")||t.isDown("UP"))&&!this.jumping&&this.grounded&&(this.jumping=!0,this.grounded=!1,this.velY=2*-this.speed,this.cba=2,this.cha=2),t.isUp("Z")&&(this.release=!0),t.isDown("Z"))if(null!==this.holding&&this.release)this.holding.chuck(this.velX,this.velY),this.holding=null;else if(null===this.holding&&!this.jumping&&this.grounded){var i=this.game.level.blockers.filter(this.viewport.vis,this.viewport);i=i.filter(function(t){return!t.dead&&t.isMonster&&!t.boss}),this.y+=1;for(var s=0;s<i.length;s++){var h=this.colCheck(this,i[s]);if("b"===h){this.holding=i[s],i[s].grab(),this.release=!1;break}}}this.velX*=this.friction,this.velY+=this.gravity,this.grounded=!1;var i=this.game.level.blockers.filter(this.viewport.vis,this.viewport);i=i.filter(function(t){return!(t.dest||t.mb||t.dead||t.grabbed)});var a=-1;this.goingLeft&&i.reverse();for(var s=0;s<i.length;s++)if(i[s].y!==a){var h=this.colCheck(this,i[s]);if("l"!==h&&"r"!==h||i[s].pickup?"b"!==h||i[s].pickup?"t"!==h||i[s].pickup||(this.velY*=-1):this.onSlope(i[s],this)?a=i[s].y:(this.onPlatform&&this.jumping&&this.velY<0||(this.grounded=!0,this.jumping=!1),this.onPlatform=!1,(i[s].pl&&!i[s].goesUp||i[s].isMonster)&&this.velX<.2&&(this.x+=2*i[s].velX,this.viewport.x-=2*i[s].velX,this.game.level.move(2*i[s].velX),this.onPlatform=!0),i[s].pl&&i[s].goesUp&&(this.onPlatform=!0)):this.onSlope(i[s],this)?a=i[s].y:(this.velX=0,this.jumping=!1),null!==h&&i[s].kill&&this.died(),null!==h&&"b"!==h&&i[s].isMonster&&!i[s].harmless&&(this.dead=!0,this.died()),null!==h&&i[s].exit&&this.game.level.next(this),null!==h&&i[s].isKnight&&(this.game.state=1),null!==h&&i[s].pickup&&(this.chi+=1,i[s].dead=!0,this.chi>2&&(this.lives+=1,this.chi-=3)),null!==h&&i[s].next)for(var e=this.game.level.blockers,b=0;b<e.length;b++)if(e[b].dest){this.y=e[b].y;var n=-1*e[b].x-this.viewport.x+512;this.x-=n,this.viewport.x+=n,this.game.level.move(-1*n);break}}this.grounded&&!this.jumping&&(this.velY=0,this.cba=1,this.cha=1),this.grounded||!(this.velY>.2||this.velY<-.2)||this.onPlatform||(this.cba=2,this.cha=2),this.x+this.viewport.x>=this.viewport.minXmove&&this.x+this.viewport.x<=this.viewport.maxXmove||this.x+this.viewport.x<=this.viewport.minXmove&&this.velX>0||this.x+this.viewport.x>=this.viewport.maxXmove&&this.velX<0||Math.abs(this.viewport.x-this.game.gameSize.width)>=this.game.level.width-this.velX&&this.velX>0||this.viewport.x-this.velX>0&&this.velX<0||(this.viewport.x-=this.velX,this.game.level.move(this.velX)),this.x+this.velX>0&&this.x+this.width+this.velX<this.game.level.width&&(this.x+=this.velX),this.y+=this.velY,this.velX<.4&&this.velX>-.4&&this.grounded&&(this.cba=0,this.cha=0),this.y>770&&!this.dead&&this.died(),this.ab[this.cba].update(),this.ah[this.cha].update(),null!==this.holding&&(this.holding.x=this.x,this.holding.y=this.y-this.holding.height,this.holding.goingLeft=this.goingLeft)},colCheck:function(t,i){if(i.dead)return null;var s=t.x+t.width/2-(i.x+i.width/2),h=t.y+t.height/2-(i.y+i.height/2),a=t.width/2+i.width/2,e=t.height/2+i.height/2,b=null;if(Math.abs(s)<a&&Math.abs(h)<e){var n=a-Math.abs(s),r=e-Math.abs(h);if(n>=r)h>0?(b="t",i.tr||i.tl||i.pickup||t.pl&&i.isMonster||(t.y+=r)):(b="b",i.tr||i.tl||i.pickup||t.pl&&i.isMonster||t.isMonster&&i.mb||(t.y-=r));else{var o=20,l=2*o;if(t.isPlayer&&i.isMonster&&!i.harmless)return a=(t.width-l)/2+(i.width-l)/2,s=t.x+o+(t.width-l)/2-(i.x+o+(i.width-l)/2),s>0&&35>s?"l":0>s&&s>-35?"r":null;s>0?(b="l",i.tr||i.tl||i.pickup||(t.pl||t.harmless&&!i.harmless)&&i.isMonster||(t.x+=n)):(b="r",i.tr||i.tl||i.pickup||(t.pl||t.harmless&&!i.harmless)&&i.isMonster||(t.x-=n))}}return b}},i.exports=s},{2:2}],11:[function(t,i){"use strict";function s(t,i,s){this.lvl=t,this.x=i,this.y=s,this.width=84,this.height=68,this.velX=0,this.speed=1,this.friction=.5,this.goingLeft=!1,this.dead=!1,this.kill=!0,this.isMonster=!0,this.isBoss=!0,this.health=3;var a=[[256,32,21,17,300,0],[277,32,28,26,300,0],[305,32,28,29,1e3,1,277,32,28,26,1e3,0],[371,32,20,20,2e3,0]];this.anim={bd:new h(this.lvl.parent.images[0],a[0]),w:new h(this.lvl.parent.images[0],a[1]),b:new h(this.lvl.parent.images[0],a[2]),h:new h(this.lvl.parent.images[0],a[3])},this.blo=[],this.c="w",this.ho={b:[-12,-20],w:[-12,-20],h:[-12,-12]},this.s="w",this.tl=!1,this.st()}var h=t(2),a=t(5);s.prototype={update:function(){if(this.dead&&this.y<1e3)this.y+=this.velY,this.x+=this.velX;else{if("h"===this.s)this.gt()-this.ts>500&&(this.s="w");else if("w"===this.s){this.goingLeft?this.velX>-this.speed&&this.velX--:this.velX<this.speed&&this.velX++,this.velX*=this.friction;for(var t=this.blo,i=this.lvl.player,s=0;s<t.length;s++){var h=i.colCheck(this,t[s]);("l"===h||"r"===h)&&(this.goingLeft&&"w"===this.s&&this.tl?(this.s="s",this.c="b"):(this.velX=0,this.goingLeft=!this.goingLeft,"r"===h&&(this.tl=!0)))}this.x+=this.velX}else"p"===this.s?this.gt()-this.ts>2e3&&(this.st(),this.s="w",this.c="w"):this.gt()-this.ts>100&&0===this.anim[this.c].c&&(this.shootFireball(),this.st(),this.s="p",this.tl=!1);this.anim[this.c].update()}},render:function(t){var i=this.goingLeft,s=this.x+this.lvl.viewport.x;this.anim.bd.render(t,i,s,this.y),this.anim[this.c].render(t,i,s+this.ho[this.c][this.goingLeft?0:1],this.y-96),"h"===this.s&&this.anim[this.s].render(t,i,s+this.ho[this.s][this.goingLeft?0:1]+12,this.y-96+20)},blockfilter:function(t){return t.isMonster||t.fb?!1:!0},shootFireball:function(){for(var t=[-1,0,-.2,-.2,-1,0,-.2,-.1,-1,0,-.2,.2,-1,0,-.2,0,-1,0,-.2,.1],i=0;i<t.length;i+=4){var s=new a(this.lvl,this.x,this.y-8,t[i],t[i+1],t[i+2],t[i+3]);this.lvl.things.push(s),this.lvl.blockers.push(s)}},hit:function(){this.health-=1,this.s="h",this.c="w",this.st(),this.health<1&&this.dies()},st:function(){this.ts=this.gt()},gt:function(){return(new Date).getTime()},dies:function(){this.dead=!0,this.velX=.75,this.velY=8;for(var t=this.lvl.things,i=0;i<t.length;i++)t[i].door&&(t[i].dead=!0)}},i.exports=s},{2:2,5:5}],12:[function(t,i){"use strict";var s=function(t,i,s,h,a,e){this.height=t.gameSize.height,this.width=t.gameSize.width,this.halfwidth=this.width/2,this.bgcolour=i,this.text=s,this.continueKey=h||null,this.keyWord=a,this.nextstate=e,this.g=t,this.lvl=null,this.d=1,this.ctr=0};s.prototype={render:function(t){null!==this.lvl&&this.lvl.render(t),t.fillStyle=this.bgcolour,t.globalAlpha=.75,t.fillRect(262,0,500,this.height),t.globalAlpha=1,t.font="40px Verdana",t.textAlign="center",t.fillStyle="#FFF";
for(var i=100,s=0;s<this.text.length;s++)t.fillText(this.text[s],this.halfwidth,i),i+=40,s%2!==0&&(i+=30),t.font="24px Verdana";null!==this.continueKey&&t.fillText("Press "+this.continueKey+" to "+this.keyWord,this.halfwidth,this.height-80)},update:function(){null!==this.continueKey&&this.g.keyboarder.isDown(this.continueKey)&&(this.g.state=this.nextstate),null!==this.lvl&&(this.lvl.update(),this.lvl.move(this.d),this.ctr++,this.ctr>1200&&(this.d<0&&this.lvl.next(),this.d=-1*this.d,this.ctr=0))}},i.exports=s},{}],13:[function(t,i){"use strict";var s=function(t){this.width=t.width,this.height=t.height,this.x=0,this.y=0,this.minXmove=400,this.maxXmove=this.width-500};s.prototype={vis:function(t){if(t.isBoss)return!0;var i={r:t.x+t.width,l:t.x,t:t.y,b:t.y+t.height},s={r:-1*this.x+this.width,l:-1*this.x,t:this.y,b:this.y+this.height};return!(s.l>i.r||s.r<i.l||s.t>i.b||s.b<i.t)}},i.exports=s},{}]},{},[1]);