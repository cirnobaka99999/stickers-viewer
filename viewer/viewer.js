// onload.min.js
function bindReady(handler){var called=false;function ready(){if(called)return;called=true;handler();}
function tryScroll(){if(called)return;if(!document.body)return;try{document.documentElement.doScroll('left');ready();}
catch(e){setTimeout(tryScroll,0);}}if(document.addEventListener){document.addEventListener('DOMContentLoaded',function(){ready();},false);}
else if(document.attachEvent){if(document.documentElement.doScroll&&window==window.top){tryScroll();}
document.attachEvent('onreadystatechange',function(){if(document.readyState==='complete'){ready();}});}
if(window.addEventListener)window.addEventListener('load',ready,false);else if(window.attachEvent)
window.attachEvent('onload',ready);else window.onload=ready;}var readyList=[];function onReady(handler)
{if(!readyList.length){bindReady(function(){for(var i=0;i<readyList.length;i++){readyList[i]();}});}readyList.push(handler);}

// min.js
function $$(els){
	return document.querySelectorAll(els);
}
Element.prototype.remove = function() {
	this.parentElement.removeChild(this);
};
NodeList.prototype.class_toggle = function(c) {
	for (var i = 0; i < this.length; i++) {
		this[i].classList.toggle(c);
	}
	return this;
};

// vars
var editor = false;
var load_local_img = false;
var stickers = {};
var filename = '';
var mimetype = '';
var stk_uri = {
	base:   'https://sdl-stickershop.line.naver.jp/products/0/0/1/',
	system: 'android',
	ext:    '.png;compress=true'
};

// load
onReady(function(){
	$$('#cfg_file')[0].onchange = function(e) {
		filename = $$('#cfg_file')[0].files[0].name;
		mimetype = $$('#cfg_file')[0].files[0].type;
		var reader = new FileReader();
		reader.readAsText(e.target.files[0]);
		reader.onload = function(e){
			stickers = JSON.parse(e.target.result);
			loadConfig();
		};
	};
});

// build
function loadConfig(){
	
	if($$('#list').length>0){
		$$('#list')[0].remove();
	}
	
	load_local_img = $$('#load_local_img')[0].checked ? true : false;
	$$('#edit_cfg')[0].removeEventListener('click', editor_switch, false);
	$$('#save_cfg')[0].removeEventListener('click', generateConfig, false);
	$$('#edit_cfg span')[0].textContent = 'off';
	$$('#extra_editor')[0].textContent = '';
	editor = false;
	
	// create main div
	var main_div = document.createElement('div');
	main_div.id = 'list';
	
	// title
	var title_div = document.createElement('div');
	title_div.id = 'set_title';
	title_div.className = 'card card_top card_bottom';
	var title_div_text = document.createElement('div');
	title_div_text.id = 'h1';
	title_div_text.textContent = stickers.title;
	title_div.appendChild(title_div_text);
	main_div.appendChild(title_div);
	
	// sticker cards
	for(var i=0;i<stickers.set.length;i++){
		
		// main div
		var card_div = document.createElement('div');
		card_div.className = 'card_inline';

		var pack_id = stickers.set[i].pack_id && stickers.set[i].pack_id > 0 ? stickers.set[i].pack_id : 0;
		var stck_id = stickers.set[i].sticker_id;
		
		// id
		var card_div_id = document.createElement('div');
		card_div_id.className = 'card card_top';
		card_div_id.textContent = 'Sticker #'+(parseInt(i,10)+1);
		card_div_id.title = (pack_id>0?pack_id:'')+'#'+stck_id;
		card_div.appendChild(card_div_id);
		
		// sticker
		var card_div_st = document.createElement('div');
		card_div_st.className = 'card card_image padding5';
		var card_div_st_img = document.createElement('img');
		card_div_st_img.className = 'sticker';
		card_div_st_img.alt = '[no image]';
		card_div_st_img.src = stk_url(pack_id,stck_id);
		card_div_st.appendChild(card_div_st_img);
		card_div.appendChild(card_div_st);
		
		// emoji
		var card_div_e0 = document.createElement('div');
		card_div_e0.className = 'card card_bottom';
		var card_div_e1 = document.createElement('div');
		card_div_e1.className = 'emojiFnt';
		card_div_e1.innerHTML = chk_emj(stickers.set[i].emoji,parseInt(i,10)+1);
		card_div_e0.appendChild(card_div_e1);
		card_div.appendChild(card_div_e0);
		
		// add
		main_div.appendChild(card_div);
		
	}
	
	// add generated
	$$('#sticker_cards')[0].appendChild(main_div);
	document.title = 'Stickers set: '+stickers.title;
	$$('#edit_cfg')[0].addEventListener('click', editor_switch, false);
	$$('#save_cfg')[0].addEventListener('click', generateConfig, false);
	$$('#editor')[0].style.display = 'block';
	
}

function stk_url(pack_id,sticker_id){
	if(pack_id>0&&!load_local_img){
		return stk_uri.base + pack_id + '/' + stk_uri.system + '/' + (sticker_id>0?'stickers/'+sticker_id:'main') + stk_uri.ext;
	}
	var sticker_id = filename.match(/^LINE_/) && sticker_id < 1 ? pack_id+'_main' : sticker_id;
	return '../stickers_img/' + filename.replace(/\.json$/,'') + '/' + sticker_id + '@2x.png';
}

function editor_switch(){
	var e, input, del, add, add_a;
	if(editor){
		// title save
		stickers.title = $$('#h1 input')[0].value;
		// emoji save
		stickers.set = [];
		for(var e=0;e<$$('.card_inline').length;e++){
			stickers.set[e] = {};
			if(filename.match(/^LINE_/)){
				stickers.set[e].pack_id = $$('.card_inline .card_top .pack_id')[e].value;
			}
			stickers.set[e].sticker_id = parseInt($$('.card_inline .card_top .sticker_id')[e].value,10);
			stickers.set[e].emoji = saveEmj($$('.card_inline .card_bottom input')[e].value,parseInt(e,10)+1);
		}
		// ----------
		loadConfig();
	}
	else{
		// add button
		add = document.createElement('div');
		add.className = 'card card_top card_bottom add_card';
		add_a = document.createElement('button');
		add_a.textContent = 'add';
		add_a.addEventListener('click', addStickerCard, false);
		add.appendChild(add_a);
		$$('#extra_editor')[0].appendChild(add);
		// title edit
		input = document.createElement('input');
		input.value = stickers.title;
		$$('#h1')[0].textContent = '';
		$$('#h1')[0].appendChild(input);
		$$('#h1')[0].classList.toggle('title_input');
		// emoji edit
		for(var e=0;e<$$('.card_inline').length;e++){
			$$('.card_inline .card_top')[e].textContent = '';
			$$('.card_inline .card_top')[e].title = '';
			$$('.card_inline .card_bottom')[e].textContent = '';
			if(filename.match(/^LINE_/)){
				input = document.createElement('input');
				input.className = 'pack_id';
				input.type = 'number';
				input.min = 0;
				input.value = stickers.set[e].pack_id;
				$$('.card_inline .card_top')[e].appendChild(input);
			}
			input = document.createElement('input');
			input.className = 'sticker_id';
			input.type = 'number';
			input.min = 0;
			input.value = stickers.set[e].sticker_id;
			$$('.card_inline .card_top')[e].appendChild(input);
			input = document.createElement('input');
			input.className = 'emojiFnt';
			input.value = stickers.set[e].emoji;
			$$('.card_inline .card_bottom')[e].appendChild(input);
			del = document.createElement('button');
			del.addEventListener('click', removeStickerCard, false);
			del.textContent = 'remove';
			$$('.card_inline .card_bottom')[e].appendChild(del);
		}
		// ----------
		editor = true;
		$$('#edit_cfg span')[0].textContent = 'on';
	}
}

function addStickerCard(){
	if(editor){
		// temp vars
		var card, card_top, card_img, card_btm, input, img, del;
		// main
		card = document.createElement('div');
		card.className = 'card_inline';
		// top
		card_top = document.createElement('div');
		card_top.className = 'card card_top';
		if(filename.match(/^LINE_/)){
			input = document.createElement('input');
			input.className = 'pack_id';
			input.type = 'number';
			input.value = 0;
			input.min = 0;
			card_top.appendChild(input);
		}
		input = document.createElement('input');
		input.className = 'sticker_id';
		input.type = 'number';
		input.value = 0;
		input.min = 0;
		card_top.appendChild(input);
		card.appendChild(card_top);
		// img
		card_img = document.createElement('div');
		card_img.className = 'card card_image padding5';
		img = document.createElement('img');
		img.className = 'sticker';
		img.alt = '[no image]';
		card_img.appendChild(img);
		card.appendChild(card_img);
		// btm
		card_btm = document.createElement('div');
		card_btm.className = 'card card_bottom';
		input = document.createElement('input');
		input.className = 'emojiFnt';
		card_btm.appendChild(input);
		del = document.createElement('button');
		del.addEventListener('click', removeStickerCard, false);
		del.textContent = 'remove';
		card_btm.appendChild(del);
		// add
		card.appendChild(card_btm);
		$$('#list')[0].appendChild(card);
	}
}

function removeStickerCard(){
	if(editor){
		this.parentElement.parentElement.remove();
	}
}

function chk_emj(emoji,sticker_id){
	return saveEmj(emoji,sticker_id,true);
}

function saveEmj(str,id,asImg){
	if(str.length<1){
		return asImg ? '[not set]' : '';
	}
	str = str.replace(/\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8\uFE0F/g,'\uD83D\uDC41\u200D\uD83D\uDDE8');
	var emj_arr = str.match(emjRegEx) ? uniqueArr(str.match(emjRegEx)) : [];
	var emj_err = str.replace(emjRegEx,'\0').split('\0').filter(function(n){return n !== '';});
	if (emj_err.length>0){
		console.log('sticker #'+id+': some images not found');
		console.log(emj_err,toCodePointArrTxt(emj_err));
	}
	if(!asImg){
		return emj_arr.join('');
	}
	if(emj_arr.length<1){
		return '[not set]';
	}
	return toCodePointStrImg(emj_arr);
}

function uniqueArr(arr){
	return [...new Set(arr)];
}

function eToUni(s,p) {
	var strUni = '';
	for(var is=0;is<s.length;is++){
		strUni += (!p?'\\u':'') + s.charCodeAt(is).toString(16).toUpperCase();
	}
	return strUni;
}

function b64EncodeUnicode(str) {
	return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,function(p0,p1){
		if(p0){} return String.fromCharCode('0x'+p1);
	}));
}

function generateConfig(){
	if(editor){
		editor_switch();
	}
	var cfg_prep = {};
	cfg_prep.title = stickers.title;
	cfg_prep.set = [];
	for(var s in stickers.set){
		cfg_prep.set[s] = {};
		if(!isNaN(parseInt(stickers.set[s].pack_id, 10)) && parseInt(stickers.set[s].pack_id, 10)>0){
			cfg_prep.set[s].pack_id = parseInt(stickers.set[s].pack_id, 10);
		}
		cfg_prep.set[s].sticker_id = parseInt(stickers.set[s].sticker_id, 10);
		cfg_prep.set[s].emoji      = stickers.set[s].emoji;
	}
	var cfg = '\ufeff'+(JSON.stringify(cfg_prep,null,'\t').replace(/\n/g,'\r\n'));
	var jlink = document.createElement('a');
	jlink.id = 'download_cfg';
	jlink.download = filename;
	jlink.href = 'data:'+mimetype+';base64,'+b64EncodeUnicode(cfg);
	document.body.appendChild(jlink);
	jlink.click();
	document.body.removeChild(jlink);
}

// parse emoji code
// http://www.unicode.org/Public/emoji/4.0/emoji-data.txt
// http://www.unicode.org/Public/emoji/4.0/emoji-sequences.txt
// http://www.unicode.org/Public/emoji/4.0/emoji-zwj-sequences.txt

var emjRegEx = /\ud83d[\udc68-\udc69](?:\ud83c[\udffb-\udfff])?\u200d(?:\u2695\ufe0f|\u2696\ufe0f|\u2708\ufe0f|\ud83c[\udf3e\udf73\udf93\udfa4\udfa8\udfeb\udfed]|\ud83d[\udcbb\udcbc\udd27\udd2c\ude80\ude92])|(?:\ud83c[\udfcb\udfcc]|\ud83d\udd75|\u26f9)(?:\ufe0f|\ud83c[\udffb-\udfff])\u200d[\u2640\u2642]\ufe0f|(?:\ud83c[\udfc3\udfc4\udfca]|\ud83d[\udc6e\udc71\udc73\udc77\udc81\udc82\udc86\udc87\ude45-\ude47\ude4b\ude4d\ude4e\udea3\udeb4-\udeb6]|\ud83e[\udd26\udd37-\udd39\udd3d\udd3e])(?:\ud83c[\udffb-\udfff])?\u200d[\u2640\u2642]\ufe0f|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68|\ud83d\udc68\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc68\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\u2764\ufe0f\u200d\ud83d[\udc68\udc69]|\ud83d\udc69\u200d\ud83d\udc66\u200d\ud83d\udc66|\ud83d\udc69\u200d\ud83d\udc67\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83c\udff3\ufe0f\u200d\ud83c\udf08|\ud83c\udff4\u200d\u2620\ufe0f|\ud83d\udc41\u200d\ud83d\udde8|\ud83d\udc68\u200d\ud83d[\udc66\udc67]|\ud83d\udc69\u200d\ud83d[\udc66\udc67]|\ud83d\udc6f\u200d\u2640\ufe0f|\ud83d\udc6f\u200d\u2642\ufe0f|\ud83e\udd3c\u200d\u2640\ufe0f|\ud83e\udd3c\u200d\u2642\ufe0f|(?:[\u0023\u002a\u0030-\u0039])\ufe0f?\u20e3|(?:(?:\ud83c[\udfcb\udfcc]|\ud83d[\udd74\udd75\udd90]|[\u261d\u26f7\u26f9\u270c\u270d])(?:\ufe0f|(?!\ufe0e))|\ud83c[\udf85\udfc2-\udfc4\udfc7\udfca]|\ud83d[\udc42\udc43\udc46-\udc50\udc66-\udc69\udc6e\udc70-\udc78\udc7c\udc81-\udc83\udc85-\udc87\udcaa\udd7a\udd95\udd96\ude45-\ude47\ude4b-\ude4f\udea3\udeb4-\udeb6\udec0\udecc]|\ud83e[\udd18-\udd1c\udd1e\udd26\udd30\udd33-\udd39\udd3d\udd3e]|[\u270a\u270b])(?:\ud83c[\udffb-\udfff]|)|\ud83c\udde6\ud83c[\udde8-\uddec\uddee\uddf1\uddf2\uddf4\uddf6-\uddfa\uddfc\uddfd\uddff]|\ud83c\udde7\ud83c[\udde6\udde7\udde9-\uddef\uddf1-\uddf4\uddf6-\uddf9\uddfb\uddfc\uddfe\uddff]|\ud83c\udde8\ud83c[\udde6\udde8\udde9\uddeb-\uddee\uddf0-\uddf5\uddf7\uddfa-\uddff]|\ud83c\udde9\ud83c[\uddea\uddec\uddef\uddf0\uddf2\uddf4\uddff]|\ud83c\uddea\ud83c[\udde6\udde8\uddea\uddec\udded\uddf7-\uddfa]|\ud83c\uddeb\ud83c[\uddee-\uddf0\uddf2\uddf4\uddf7]|\ud83c\uddec\ud83c[\udde6\udde7\udde9-\uddee\uddf1-\uddf3\uddf5-\uddfa\uddfc\uddfe]|\ud83c\udded\ud83c[\uddf0\uddf2\uddf3\uddf7\uddf9\uddfa]|\ud83c\uddee\ud83c[\udde8-\uddea\uddf1-\uddf4\uddf6-\uddf9]|\ud83c\uddef\ud83c[\uddea\uddf2\uddf4\uddf5]|\ud83c\uddf0\ud83c[\uddea\uddec-\uddee\uddf2\uddf3\uddf5\uddf7\uddfc\uddfe\uddff]|\ud83c\uddf1\ud83c[\udde6-\udde8\uddee\uddf0\uddf7-\uddfb\uddfe]|\ud83c\uddf2\ud83c[\udde6\udde8-\udded\uddf0-\uddff]|\ud83c\uddf3\ud83c[\udde6\udde8\uddea-\uddec\uddee\uddf1\uddf4\uddf5\uddf7\uddfa\uddff]|\ud83c\uddf4\ud83c\uddf2|\ud83c\uddf5\ud83c[\udde6\uddea-\udded\uddf0-\uddf3\uddf7-\uddf9\uddfc\uddfe]|\ud83c\uddf6\ud83c\udde6|\ud83c\uddf7\ud83c[\uddea\uddf4\uddf8\uddfa\uddfc]|\ud83c\uddf8\ud83c[\udde6-\uddea\uddec-\uddf4\uddf7-\uddf9\uddfb\uddfd-\uddff]|\ud83c\uddf9\ud83c[\udde6\udde8\udde9\uddeb-\udded\uddef-\uddf4\uddf7\uddf9\uddfb\uddfc\uddff]|\ud83c\uddfa\ud83c[\udde6\uddec\uddf2\uddf3\uddf8\uddfe\uddff]|\ud83c\uddfb\ud83c[\udde6\udde8\uddea\uddec\uddee\uddf3\uddfa]|\ud83c\uddfc\ud83c[\uddeb\uddf8]|\ud83c\uddfd\ud83c\uddf0|\ud83c\uddfe\ud83c[\uddea\uddf9]|\ud83c\uddff\ud83c[\udde6\uddf2\uddfc]|\ud800\udc00|\ud83c[\udccf\udd8e\udd91-\udd9a\udde6-\uddff\ude01\ude32-\ude36\ude38-\ude3a\ude50\ude51\udf00-\udf20\udf2d-\udf35\udf37-\udf7c\udf7e-\udf84\udf86-\udf93\udfa0-\udfc1\udfc5\udfc6\udfc8\udfc9\udfcf-\udfd3\udfe0-\udff0\udff4\udff8-\udfff]|\ud83d[\udc00-\udc3e\udc40\udc44\udc45\udc51-\udc65\udc6a-\udc6d\udc6f\udc79-\udc7b\udc7d-\udc80\udc84\udc88-\udca9\udcab-\udcfc\udcff-\udd3d\udd4b-\udd4e\udd50-\udd67\udda4\uddfb-\ude44\ude48-\ude4a\ude80-\udea2\udea4-\udeb3\udeb7-\udebf\udec1-\udec5\uded0-\uded2\udeeb\udeec\udef4-\udef6]|\ud83e[\udd10-\udd17\udd1d\udd20-\udd25\udd27\udd3a\udd3c\udd40-\udd45\udd47-\udd4b\udd50-\udd5e\udd80-\udd91\uddc0]|[\u23e9-\u23ec\u23f0\u23f3\u2640\u2642\u2695\u26ce\u2705\u2728\u274c\u274e\u2753-\u2755\u2795-\u2797\u27b0\u27bf\ue50a]|(?:\ud83c[\udc04\udd70\udd71\udd7e\udd7f\ude02\ude1a\ude2f\ude37\udf21\udf24-\udf2c\udf36\udf7d\udf96\udf97\udf99-\udf9b\udf9e\udf9f\udfcd\udfce\udfd4-\udfdf\udff3\udff5\udff7]|\ud83d[\udc3f\udc41\udcfd\udd49\udd4a\udd6f\udd70\udd73\udd76-\udd79\udd87\udd8a-\udd8d\udda5\udda8\uddb1\uddb2\uddbc\uddc2-\uddc4\uddd1-\uddd3\udddc-\uddde\udde1\udde3\udde8\uddef\uddf3\uddfa\udecb\udecd-\udecf\udee0-\udee5\udee9\udef0\udef3]|[\u00a9\u00ae\u203c\u2049\u2122\u2139\u2194-\u2199\u21a9\u21aa\u231a\u231b\u2328\u23cf\u23ed-\u23ef\u23f1\u23f2\u23f8-\u23fa\u24c2\u25aa\u25ab\u25b6\u25c0\u25fb-\u25fe\u2600-\u2604\u260e\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262a\u262e\u262f\u2638-\u263a\u2648-\u2653\u2660\u2663\u2665\u2666\u2668\u267b\u267f\u2692-\u2694\u2696\u2697\u2699\u269b\u269c\u26a0\u26a1\u26aa\u26ab\u26b0\u26b1\u26bd\u26be\u26c4\u26c5\u26c8\u26cf\u26d1\u26d3\u26d4\u26e9\u26ea\u26f0-\u26f5\u26f8\u26fa\u26fd\u2702\u2708\u2709\u270f\u2712\u2714\u2716\u271d\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u2764\u27a1\u2934\u2935\u2b05-\u2b07\u2b1b\u2b1c\u2b50\u2b55\u3030\u303d\u3297\u3299])(?:\ufe0f|(?!\ufe0e))/g;
var emjCfg = {
	base: 'https://cdn.rawgit.com/seiya-dev/apple-emoji/master/',
	size: 'img-apple-20',
	ext: '.png',
	sep: '-'
};
function toCodePoint(emj, sep){
	emj = emj.indexOf(String.fromCharCode(0x200D)) < 0 ? emj.replace(/\uFE0F/g, '') : emj;
	var r = [], c = 0, p = 0, i = 0;
	while (i < emj.length) {
		c = emj.charCodeAt(i++);
		if (p){
			r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
			p = 0;
		}
		else if (0xD800 <= c && c <= 0xDBFF) {
			p = c;
		} 
		else {
			c = c.toString(16);
			c = c.length < 4 ? '0'.repeat(4 - c.length) + c : c;
			r.push(c.toString(16));
		}
	}
	return r.join(sep || emjCfg.sep);
}
function fromCodePoint(codepoint){
	var code = typeof codepoint === 'string' ?
		parseInt(codepoint, 16) : codepoint;
	if (code < 0x10000) {
		return String.fromCharCode(code);
	}
	code -= 0x10000;
	return String.fromCharCode(
		0xD800 + (code >> 10),
		0xDC00 + (code & 0x3FF)
	);
}
function toCodePointArrTxt (arr,sep){
	var cpArr = []; sep = sep ? sep : emjCfg.sep;
	for (var ix = 0; ix < arr.length; ix++) {
		cpArr.push(toCodePoint(arr[ix],sep));
	}
	return cpArr;
};
function toCodePointStrImg (arr,sep){
	var outputStr = '', cp2txt;
	sep = sep ? sep : emjCfg.sep;
	for (var i = 0; i < arr.length; i++) {
		cp2txt = toCodePoint(arr[i]).split(emjCfg.sep).map(fromCodePoint).join('');
		outputStr += '<img class="emoji" src="'+emjCfg.base+emjCfg.size+'/'+toCodePoint(arr[i],sep)+emjCfg.ext+'" alt="'+cp2txt+'"/>';
	}
	return outputStr;
};