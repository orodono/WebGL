onload = function(){

	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;
	
	var elmRange	= document.getElementById('range');

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	
	//���_�V�F�[�_�ƃt���O�����g�V�F�[�_�̐���
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//�v���O�����I�u�W�F�N�g�̐����ƃ����N
	var prg = create_program(v_shader, f_shader);

	//attributeLocation�̏���
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');

	//attribute�̗v�f��(���̏ꍇ��xyz�̎O�v�f)
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;

	var position = [
		-1.0,  1.0, 0.0,
		 1.0,  1.0, 0.0,
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0
	];
	
	//���_�F
	var color = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];

	//�e�N�X�`�����W
	var textureCoord = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];

	//���_�C���f�b�N�X
	var index = [
		0, 1, 2,
		3, 2, 1
	];

	//VBO��IBO�̐���	
	var vPosition 	= create_vbo(position);
	var vColor		= create_vbo(color);
	var vTextureCoord = create_vbo(textureCoord);
	var VBOList		= [vPosition, vColor, vTextureCoord];
	var iIndex 		= create_ibo(index);

	//VBO��IBO�̓o�^
	set_attribute(VBOList, attLocation, attStride);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

	//uniformLocation�̎擾
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'vertexAlpha');
	uniLocation[2] = gl.getUniformLocation(prg, 'texture');
	uniLocation[3] = gl.getUniformLocation(prg, 'useTexture');

	
	//�e��s��̐����Ə�����
	var m = new matIV();
	var mMatrix 	= m.identity(m.create());
	var vMatrix		= m.identity(m.create());
	var pMatrix		= m.identity(m.create());
	var tmpMatrix	= m.identity(m.create());
	var mvpMatrix	= m.identity(m.create());

	//�r���[�~�v���W�F�N�V�������W�ϊ��s��
	m.lookAt([0.0, 0.0, 5.0], [0, 0, 0], [0, 1, 0], vMatrix);
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	//�J�����O�Ɛ[�x�e�X�g��L���ɂ���
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);


	//�e�N�X�`���p�ϐ��̐錾
	var texture = null;

	//�e�N�X�`���𐶐�
	create_texture('texture.png');
	gl.activeTexture(gl.TEXTURE0);

	var count = 0;

	//�P�탋�[�v
	(function(){
		blend_type(0);

		var vertexAlpha = parseFloat(elmRange.value / 100);

		gl.clearColor(0.0, 0.75, 0.75, 1.0);

		//canvas������������ۂ̐[�x��ݒ肷��
		gl.clearDepth(1.0);

		//canvas��������
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		count++;
		
		//�J�E���^�����ƂɃ��W�A�����Z�o
		var rad = (count % 360) * Math.PI / 180;

		//���f�����W�ύX�s��̐���
		m.identity(mMatrix);
		m.translate(mMatrix, [0.25, 0.25, -0.25], mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		gl.disable(gl.BLEND);

		
		//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(2�ڂ̃��f��)
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1f(uniLocation[1], 1.0);
		gl.uniform1i(uniLocation[2], 0);
		gl.uniform1i(uniLocation[3], true);

		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);


		m.identity(mMatrix);
		m.translate(mMatrix, [-0.25, -0.25, 0.25], mMatrix);
		m.rotate(mMatrix, rad, [0, 0, 1], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		gl.bindTexture(gl.TEXTURE_2D, null);
	
		gl.enable(gl.BLEND);

		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniform1f(uniLocation[1], vertexAlpha);
		gl.uniform1i(uniLocation[2], 0);
		gl.uniform1i(uniLocation[3], false);
		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);


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




};








