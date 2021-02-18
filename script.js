onload = function(){

	var c = document.getElementById('canvas');
	c.width = 300;
	c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	//canvas������������ۂ̐[�x��ݒ肷��
	gl.clearDepth(1.0);

	//canvas��������
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//���_�V�F�[�_�ƃt���O�����g�V�F�[�_�̐���
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//�v���O�����I�u�W�F�N�g�̐����ƃ����N
	var prg = create_program(v_shader, f_shader);

	//attributeLocation�̏���
	var attLocation = new Array(2);
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');

	//attribute�̗v�f��(���̏ꍇ��xyz�̎O�v�f)
	var attStride = new Array(2);
	attStride[0] = 3;
	attStride[1] = 4;


	//���f��(���_)�f�[�^
	var vertex_position = [
		0.0, 1.0, 0.0,
		1.0, 0.0, 0.0,
		-1.0, 0.0, 0.0
	];

	//���_�̐F�����i�[����z��
	var vertex_color = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];
	
	//VBO�̐���
	var position_vbo = create_vbo(vertex_position);
	var color_vbo = create_vbo(vertex_color);

	//VBO���o�C���h
	gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo);

	//attribute������L���ɂ���
	gl.enableVertexAttribArray(attLocation[0]);

	//attribute������o�^
	gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, false, 0, 0);

	//��L3�H����F���ł����{
	gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo);
	gl.enableVertexAttribArray(attLocation[1]);
	gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, false, 0, 0);


	//minMatriix.js��p�����s��֘A����
	//matIV�I�u�W�F�N�g�𐶐�
	var m = new matIV();

	//�e��s��̐����Ə�����
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());

	//�r���[���W�ϊ��s��
	m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], vMatrix);

	//�v���W�F�N�V���������ϊ��s��
	m.perspective(90, c.width / c.height, 0.1, 100, pMatrix);

	//�e�s����|�����킹���W�ϊ��s�������������
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	//��ڂ̃��f�����ړ����邽�߂̃��f�����W�ϊ��s��
	m.translate(mMatrix, [1.5, 0.0, 0.0], mMatrix);

	//���f���~�r���[�~�v���W�F�N�V����(��ڂ̃��f��)
	m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	//uniformLocation�̎擾
	var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');

	//uniformLocation�֍��W�ϊ��s���o�^
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

	//���f���̕`��
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	//2�ڂ̃��f�����ړ����邽�߂̃��f�����W�ύX�s��
	m.identity(mMatrix);
	m.translate(mMatrix, [-1.5, 0.0, 0.0], mMatrix);

	m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(2�ڂ̃��f��)
	gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	//�R���e�L�X�g�̍ĕ`��
	gl.flush();

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

};








