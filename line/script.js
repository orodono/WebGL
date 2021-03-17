


onload = function(){

	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;
	
	var ePointSize	= document.getElementById('point_size');
	var eLines 		= document.getElementById('lines');
	var eLineStrip	= document.getElementById('line_strip');
	var eLineLoop 	= document.getElementById('line_loop');

	c.addEventListener('mousemove', mouseMove, true);

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	var q = new qtnIV();
	var qt = q.identity(q.create());

	
	var pointSizeRange = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
	console.log('pointSizeRange: ' + pointSizeRange[0] + ' to ' + pointSizeRange[1]);

	//頂点シェーダとフラグメントシェーダの生成
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//プログラムオブジェクトの生成とリンク
	var prg = create_program(v_shader, f_shader);

	//attributeLocationの所得
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	
	//attributeの要素数(この場合はxyzの三要素)
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 4;
	
	var pointSphere = sphere(16, 16, 2.0);
	var pPos = create_vbo(pointSphere.p);
	var pCol = create_vbo(pointSphere.c);
	var pVBOList = [pPos, pCol];

	var position = [
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		-1.0,  1.0, 0.0,
		 1.0,  1.0, 0.0
	];
	
	//頂点色
	var color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];


	//VBOとIBOの生成	
	var lPos 	= create_vbo(position);
	var lCol	= create_vbo(color);
	var lVBOList		= [lPos, lCol];;

	
	//uniformLocationの取得
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'pointSize');
	
	
	//各種行列の生成と初期化
	var m = new matIV();
	var mMatrix 	= m.identity(m.create());
	var vMatrix		= m.identity(m.create());
	var pMatrix		= m.identity(m.create());
	var tmpMatrix	= m.identity(m.create());
	var mvpMatrix	= m.identity(m.create());
	var qMatrix		= m.identity(m.create());



	//カリングと深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	var count = 0;

	//恒常ループ
	(function(){

		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		//canvasを初期化する際の深度を設定する
		gl.clearDepth(1.0);

		//canvasを初期化
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		count++;
		
		var rad = (count % 360) * Math.PI / 180;

		var qMatrix = m.identity(m.create());
		q.toMatIV(qt, qMatrix);

		var camPosition = [0.0, 5.0, 10.0];
		m.lookAt(camPosition, [0, 0, 0], [0, 1, 0], vMatrix);
		m.multiply(vMatrix, qMatrix, vMatrix);
		m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
		m.multiply(pMatrix, vMatrix, tmpMatrix);
		

		var pointSize = ePointSize.value / 10;

		set_attribute(pVBOList, attLocation, attStride);

		//モデル座標変更行列の生成
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);


		
		//uniformLocationへ座標変換行列を登録し描画する(1つ目のモデル)
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1f(uniLocation[1], pointSize);

		gl.drawArrays(gl.POINTS, 0, pointSphere.p.length / 3);

		var lineOption = 0;

		if(eLines.checked){lineOption = gl.LINES;}
		if(eLineStrip.checked){lineOption = gl.LINE_STRIP;}
		if(eLineLoop.checked){lineOption = gl.LINE_LOOP;}

		set_attribute(lVBOList, attLocation, attStride);

		m.identity(mMatrix);
		m.rotate(mMatrix, Math.PI / 2, [1, 0, 0], mMatrix);
		m.scale(mMatrix, [3.0, 3.0, 1.0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.drawArrays(lineOption, 0, position.length / 3);


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

	function create_texture(source, number){
		var img = new Image();
		
		//データのオンロードをトリガーにする
		img.onload = function(){
			var tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			
			//テクスチャへイメージを適用
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

			gl.generateMipmap(gl.TEXTURE_2D);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

			texture = tex;


			//テクスチャのバインドを無効化
			gl.bindTexture(gl.TEXTURE_2D, null);

		};
		img.src = source;
	}


	function blend_type(prm){
		switch(prm){
			//透過処理
			case 0:
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
			//加算合成	
			case 1:
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
				break;
			default:
				break;
		}
	}

	function mouseMove(e){
		var cw = c.width;
		var ch = c.height;
		var wh = 1 / Math.sqrt(cw * cw + ch * ch);
		var x = e.clientX - c.offsetLeft - cw * 0.5;
		var y = e.clientY - c.offsetTop - ch * 0.5;
		var sq = Math.sqrt(x * x + y * y);
		var r = sq * 2.0 * Math.PI * wh;
		if(sq != 1){
			sq = 1 / sq;
			x *= sq;
			y *= sq;
		}
		q.rotate(r, [y, x, 0.0], qt);
	}




};






