


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

	//���_�V�F�[�_�ƃt���O�����g�V�F�[�_�̐���
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//�v���O�����I�u�W�F�N�g�̐����ƃ����N
	var prg = create_program(v_shader, f_shader);

	//attributeLocation�̏���
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	
	//attribute�̗v�f��(���̏ꍇ��xyz�̎O�v�f)
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
	
	//���_�F
	var color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];


	//VBO��IBO�̐���	
	var lPos 	= create_vbo(position);
	var lCol	= create_vbo(color);
	var lVBOList		= [lPos, lCol];;

	
	//uniformLocation�̎擾
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'pointSize');
	
	
	//�e��s��̐����Ə�����
	var m = new matIV();
	var mMatrix 	= m.identity(m.create());
	var vMatrix		= m.identity(m.create());
	var pMatrix		= m.identity(m.create());
	var tmpMatrix	= m.identity(m.create());
	var mvpMatrix	= m.identity(m.create());
	var qMatrix		= m.identity(m.create());



	//�J�����O�Ɛ[�x�e�X�g��L���ɂ���
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	var count = 0;

	//�P�탋�[�v
	(function(){

		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		//canvas������������ۂ̐[�x��ݒ肷��
		gl.clearDepth(1.0);

		//canvas��������
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

		//���f�����W�ύX�s��̐���
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);


		
		//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(1�ڂ̃��f��)
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


		//�R���e�L�X�g�̍ĕ`��
		gl.flush();

		//���[�v�̂��߂ɍċA�Ăяo��
		setTimeout(arguments.callee, 1000 / 100);

	})();

	//�V�F�[�_�𐶐�����֐�
	function create_shader(id){
		//�V�F�[�_���i�[����ϐ�
		var shader;
		
		//HTML����script�^�O�ւ̎Q�Ƃ�����
		var scriptElement = document.getElementById(id);

		//script�^�O�����݂��Ȃ��ꍇ�͔�����
		if(!scriptElement){return;}

		//script�^�O��type�������`�F�b�N
		switch(scriptElement.type){

			//���_�V�F�[�_�̏ꍇ
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;

			//�t���O�����g�V�F�[�_�̏ꍇ
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return ;
		}


		//�������ꂽ�V�F�[�_�Ƀ\�[�X�����蓖�Ă�
		gl.shaderSource(shader, scriptElement.text);

		//�V�F�[�_���R���p�C������
		gl.compileShader(shader);

		//�V�F�[�_���������R���p�C�����ꂽ���`�F�b�N
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			//�������Ă�����V�F�[�_��Ԃ��ďI��
			return shader;
		}else{

			//���s���Ă�����G���[���O���A���[�g����
			alert(gl.getShaderInfoLog(shader));
		}

	}


	function create_program(vs, fs){
		//�v���O�����I�u�W�F�N�g�̐���
		var program = gl.createProgram();

		//�v���O�����I�u�W�F�N�g�ɃV�F�[�_�����蓖�Ă�
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		//�V�F�[�_�������N
		gl.linkProgram(program);

		//�V�F�[�_�̃����N���������s��ꂽ���`�F�b�N
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

			//�������Ă�����v���O�����I�u�W�F�N�g��L���ɂ���
			gl.useProgram(program);

			//�v���O�����I�u�W�F�N�g��Ԃ��ďI��
			return program;
		}else{
			//���s���Ă�����G���[���O���A���[�g����
			alert(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data){
	//�o�b�t�@�I�u�W�F�N�g�̐���
	var vbo = gl.createBuffer();

	//�o�b�t�@���o�C���h����
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	//�o�b�t�@�Ƀf�[�^���Z�b�g
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	//�o�b�t�@�̃o�C���h�𖳌���
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//��������VBO��Ԃ��ďI��
	return vbo;
	}


	//VBO���o�C���h���o�^����֐�
	function set_attribute(vbo, attL, attS){
		//�����Ƃ��Ď󂯎�����z�����������
		for(var i in vbo) {
			//�o�b�t�@���o�C���h����
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

			//attributeLocation��L���ɂ���
			gl.enableVertexAttribArray(attL[i]);

			//attributeLocation��ʒm���Ƃ��낭����
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}

	//IBO�𐶐�����֐�
	function create_ibo(data){
		var ibo = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ibo;
	}

	function create_texture(source, number){
		var img = new Image();
		
		//�f�[�^�̃I�����[�h���g���K�[�ɂ���
		img.onload = function(){
			var tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			
			//�e�N�X�`���փC���[�W��K�p
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

			gl.generateMipmap(gl.TEXTURE_2D);

			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

			texture = tex;


			//�e�N�X�`���̃o�C���h�𖳌���
			gl.bindTexture(gl.TEXTURE_2D, null);

		};
		img.src = source;
	}


	function blend_type(prm){
		switch(prm){
			//���ߏ���
			case 0:
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
			//���Z����	
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






