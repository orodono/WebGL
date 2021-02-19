onload = function(){

	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	
	//���_�V�F�[�_�ƃt���O�����g�V�F�[�_�̐���
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');

	//�v���O�����I�u�W�F�N�g�̐����ƃ����N
	var prg = create_program(v_shader, f_shader);

	//attributeLocation�̏���
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'normal');
	attLocation[2] = gl.getAttribLocation(prg, 'color');

	//attribute�̗v�f��(���̏ꍇ��xyz�̎O�v�f)
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 3;
	attStride[2] = 4;


	//�g�[���X�̒��_�f�[�^�𐶐�
	var torusData = torus(32, 32, 1.0, 2.0);
	var position = torusData[0];
	var normal = torusData[1];
	var color = torusData[2];
	var index = torusData[3];


	//VBO�̐���
	var pos_vbo = create_vbo(position);
	var nor_vbo = create_vbo(normal);
	var col_vbo = create_vbo(color);

	//VBO��o�^����
	set_attribute([pos_vbo, nor_vbo, col_vbo], attLocation , attStride);

	
	//IBO�̐���
	var ibo = create_ibo(index);

	//
	//IBO���o�C���h���ēo�^����
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	
	//uniformLocation�̎擾
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');


	//minMatriix.js��p�����s��֘A����
	//matIV�I�u�W�F�N�g�𐶐�
	var m = new matIV();

	//�e��s��̐����Ə�����
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var invMatrix = m.identity(m.create());

	//�r���[���W�ϊ��s��
	m.lookAt([0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0], vMatrix);

	//�v���W�F�N�V���������ϊ��s��
	m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);

	//�e�s����|�����킹���W�ϊ��s�������������
	m.multiply(pMatrix, vMatrix, tmpMatrix);

	//���s�����̌���
	var lightDirection = [-0.5, 0.5, 0.5];

	//�J�E���^�̐錾
	var count = 0;

	//�J�����O�Ɛ[�x�e�X�g��L���ɂ���
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);

	//�P�탋�[�v
	(function(){
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		//canvas������������ۂ̐[�x��ݒ肷��
		gl.clearDepth(1.0);

		//canvas��������
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		count++;
		
		//�J�E���^�����ƂɃ��W�A�����Z�o
		var rad = (count % 360) * Math.PI / 180;

		/*���f��1�͉~�̋O����`���ړ�����
		var x = Math.cos(rad);
		var y = Math.sin(rad);
		m.identity(mMatrix);
		m.translate(mMatrix, [x, y+1.0, 0.0], mMatrix);
		



		//���f���~�r���[�~�v���W�F�N�V����(��ڂ̃��f��)
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

	
		//uniformLocation�֍��W�ϊ��s���o�^
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);

		//���f���̕`��
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		*/

		//2�ڂ̃��f�����ړ����邽�߂̃��f�����W�ύX�s��
		m.identity(mMatrix);
		//m.translate(mMatrix, [1.0, -1.0, 0.0], mMatrix);

		m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		//���f�����W�ϊ��s�񂩂�t�s��𐶐�
		m.inverse(mMatrix, invMatrix);

		//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(2�ڂ̃��f��)
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		gl.uniform3fv(uniLocation[2], lightDirection);

		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

		/*
		//���f��3�͊g��k������
		var s = Math.sin(rad) + 1.0;
		m.identity(mMatrix);
		m.translate(mMatrix, [-1.0, -1.0, 0.0], mMatrix);
		m.scale(mMatrix, [s, s, 0.0], mMatrix);

		m.multiply(tmpMatrix, mMatrix, mvpMatrix);

		//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(2�ڂ̃��f��)
		gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		*/

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








