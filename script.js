onload = function(){

	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	
	//頂点シェーダとフラグメントシェーダの生成
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//プログラムオブジェクトの生成とリンク
	var prg = create_program(v_shader, f_shader);

	//attributeLocationの所得
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'normal');
	attLocation[2] = gl.getAttribLocation(prg, 'color');

	//attributeの要素数(この場合はxyzの三要素)
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 3;
	attStride[2] = 4;


	//トーラスの頂点データを生成
	var torusData = torus(32, 32, 1.0, 2.0);
	var position = torusData[0];
	var normal = torusData[1];
	var color = torusData[2];
	var index = torusData[3];


	//VBOの生成
	var pos_vbo = create_vbo(position);
	var nor_vbo = create_vbo(normal);
	var col_vbo = create_vbo(color);

	//VBOを登録する
	set_attribute([pos_vbo, nor_vbo, col_vbo], attLocation , attStride);

	
	//IBOの生成
	var ibo = create_ibo(index);

	//
	//IBOをバインドして登録する
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	
	//uniformLocationの取得
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');


	//minMatriix.jsを用いた行列関連処理
	//matIVオブジェクトを生成
	var m = new matIV();

	//各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var invMatrix = m.identity(m.create());

	//ビュー座標変換行列
	m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);

	//プロジェクション座方変換行列
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);

	//各行列を掛け合わせ座標変換行列を完成させる
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	//平行光源の向き
	var lightDirection = [-0.5, 0.5, 0.5];

	//カウンタの宣言
	var count = 0;

	//カリングと深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);

	//恒常ループ
	(function(){
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		//canvasを初期化する際の深度を設定する
		gl.clearDepth(1.0);

		//canvasを初期化
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		count++;
		
		//カウンタをもとにラジアンを算出
		var rad = (count % 360) * Math.PI / 180;

		/*モデル1は円の軌道を描き移動する
		var x = Math.cos(rad);
		var y = Math.sin(rad);
		m.identity(mMatrix);
		m.translate(mMatrix, [x, y+1.0, 0.0], mMatrix);
		



		//モデル×ビュー×プロジェクション(一つ目のモデル)
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	
		//uniformLocationへ座標変換行列を登録
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

		//モデルの描画
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		*/

		//2つ目のモデルを移動するためのモデル座標変更行列
		m.identity(mMatrix);
		//m.translate(mMatrix, [1.0, -1.0, 0.0], mMatrix);

		m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		//モデル座標変換行列から逆行列を生成
		m.inverse(mMatrix, invMatrix);

		//uniformLocationへ座標変換行列を登録し描画する(2つ目のモデル)
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		gl.uniform3fv(uniLocation[2], lightDirection);

		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

		/*
		//モデル3は拡大縮小する
		var s = Math.sin(rad) + 1.0;
		m.identity(mMatrix);
		m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);
		m.scale(mMatrix, [s, s, 0.0], mMatrix);

		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		//uniformLocationへ座標変換行列を登録し描画する(2つ目のモデル)
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		*/

		//コンテキストの再描画
		gl.flush();

		//ループのために再帰呼び出し
		setTimeout(arguments.callee, 1000 / 100);

	})();

	//シェーダを生成する関数
	function create_shader(id){
		//シェーダを格納する変数
		var shader;
		
		//HTMLからscriptタグへの参照を所得
		var scriptElement = document.getElementById(id);

		//scriptタグが存在しない場合は抜ける
		if(!scriptElement){return;}

		//scriptタグのtype属性をチェック
		switch(scriptElement.type){

			//頂点シェーダの場合
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;

			//フラグメントシェーダの場合
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return ;
		}


		//生成されたシェーダにソースを割り当てる
		gl.shaderSource(shader, scriptElement.text);

		//シェーダをコンパイルする
		gl.compileShader(shader);

		//シェーダが正しくコンパイルされたかチェック
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			//成功していたらシェーダを返して終了
			return shader;
		}else{

			//失敗していたらエラーログをアラートする
			alert(gl.getShaderInfoLog(shader));
		}

	}


	function create_program(vs, fs){
		//プログラムオブジェクトの生成
		var program = gl.createProgram();

		//プログラムオブジェクトにシェーダを割り当てる
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		//シェーダをリンク
		gl.linkProgram(program);

		//シェーダのリンクが正しく行われたかチェック
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

			//成功していたらプログラムオブジェクトを有効にする
			gl.useProgram(program);

			//プログラムオブジェクトを返して終了
			return program;
		}else{
			//失敗していたらエラーログをアラートする
			alert(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data){
	//バッファオブジェクトの生成
	var vbo = gl.createBuffer();

	//バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	//バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	//バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//生成したVBOを返して終了
	return vbo;
	}


	//VBOをバインドし登録する関数
	function set_attribute(vbo, attL, attS){
		//引数として受け取った配列を処理する
		for(var i in vbo) {
			//バッファをバインドする
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

			//attributeLocationを有効にする
			gl.enableVertexAttribArray(attL[i]);

			//attributeLocationを通知しとうろくする
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}

	//IBOを生成する関数
	function create_ibo(data){
		var ibo = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ibo;
	}

	function torus(row, column, irad, orad){
		var pos = new Array(), nor = new Array(), col = new Array(), idx = new Array();
		for(var i = 0; i <= row; i++){
			var r = Math.PI * 2 / row * i;
			var rr = Math.cos(r);
			var ry = Math.sin(r);
			for(var ii = 0; ii <= column; ii++){
				var tr = Math.PI * 2 / column * ii;
				var tx = (rr * irad + orad) * Math.cos(tr);
				var ty = ry * irad;
				var tz = (rr * irad + orad) * Math.sin(tr);
				var rx = rr * Math.cos(tr);
				var rz = rr * Math.sin(tr);
				pos.push(tx, ty, tz);
				nor.push(rx, ry, rz);
				var tc = hsva(360 / column * ii, 1, 1, 1);
				col.push(tc[0], tc[1], tc[2], tc[3]);
			}
		}
		for(i = 0; i < row; i++){
			for(ii=0; ii<column; ii++){

				r = (column + 1) * i + ii;
				idx.push(r, r + column + 1, r + 1);
				idx.push(r + column + 1, r + column + 2, r + 1);
			}
		}
		return [pos, nor, col, idx];
	}

	function hsva(h, s, v, a){
		if(s>1 || v > 1 || a > 1){return;}
		var th = h % 360;
		var i = Math.floor(th / 60);
		var f = th / 60 - i;
		var m = v * (1 - s);
		var n = v * (1 - s * f);
		var k = v * (1 - s * (1 - f));
		var color = new Array();
		if(!s > 0 && !s < 0){
			color.push(v, v, v, a);
		}else{
			var r = new Array(v, n, m, m, k, v);
			var g = new Array(k, v, v, n, m, m);
			var b = new Array(m, m, k, v, v, n);
			color.push(r[i], g[i], b[i], a);
		}
		return color;
	}
};








