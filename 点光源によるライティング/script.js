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
	var torusData = torus(64, 64, 0.5, 1.5, [0.75, 0.25, 0.25, 1.0]);
	var position = torusData.p;
	var normal = torusData.n;
	var color = torusData.c;
	var index = torusData.i;
	
	//VBO�̐���
	var tPosition = create_vbo(position);
	var tNormal = create_vbo(normal);
	var tColor = create_vbo(color);
	var tVBOList = [tPosition, tNormal, tColor];

	//VBO��o�^����
	//set_attribute(tVBOList, attLocation , attStride);

	
	//IBO�̐���
	var tIndex = create_ibo(index);

	//
	//IBO���o�C���h���ēo�^����
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);

	//���̂̒��_�f�[�^����VBO�𐶐����z��Ɋi�[
	var sphereData = sphere(64, 64, 2.0, [0.25, 0.25, 0.75, 1.0]);
	var sPosition = create_vbo(sphereData.p);
	var sNormal = create_vbo(sphereData.n);
	var sColor = create_vbo(sphereData.c);
	var sVBOList = [sPosition, sNormal, sColor];

	//���̗pIBO�̐���	
	var sIndex = create_ibo(sphereData.i);


	
	//uniformLocation�̎擾
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'mMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[3] = gl.getUniformLocation(prg, 'lightPosition');
	uniLocation[4] = gl.getUniformLocation(prg, 'eyeDirection');
	uniLocation[5] = gl.getUniformLocation(prg, 'ambientColor');
	


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

	//�_�����̈ʒu
	var lightPosition = [0.0, 0.0, 0.0];

	//���_�x�N�g��
	var eyeDirection = [0.0, 0.0, 20.0];

	//���Z�̐F
	var ambientColor = [0.1, 0.1, 0.1, 1.0];

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
		var tx = Math.cos(rad) * 3.5;
 		var ty = Math.sin(rad) * 3.5;
		var tz = Math.sin(rad) * 3.5;

		//�g�[���X��VBO��IBO���Z�b�g
		set_attribute(tVBOList, attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);

		//���f�����W�ύX�s��̐���
		m.identity(mMatrix);
		m.translate(mMatrix, [tx, -ty, -tz], mMatrix);
		m.rotate(mMatrix, -rad, [0, 1, 1], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		//���f�����W�ϊ��s�񂩂�t�s��𐶐�
		m.inverse(mMatrix, invMatrix);

		//uniformLocation�֍��W�ϊ��s���o�^���`�悷��(2�ڂ̃��f��)
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);
		gl.uniform3fv(uniLocation[3], lightPosition);
		gl.uniform3fv(uniLocation[4], eyeDirection);
		gl.uniform4fv(uniLocation[5], ambientColor);

		gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);


		//���̂�VBO��IBO���Z�b�g
		set_attribute(sVBOList, attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIndex);

		//���f�����W�ϊ��s��̐���
		m.identity(mMatrix);
		m.translate(mMatrix, [-tx, ty, tz], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);

		//uniform�ϐ��̓o�^�ƕ`��
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, mMatrix);
		gl.uniformMatrix4fv(uniLocation[2], false, invMatrix);

		gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);

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
		return {p:pos, n: nor, c:col, i:idx};
	}

	//���̂𐶐�����֐�
	function sphere(row, column, rad, color){
		var pos = new Array(), nor = new Array(),col = new Array(), idx = new Array();

		for(var i = 0; i <= row; i++){
			var r = Math.PI / row * i;
			var ry = Math.cos(r);
			var rr = Math.sin(r);
			for(var ii = 0; ii <= column; ii++){
				var tr = Math.PI * 2 / column * ii;
				var tx = rr * rad * Math.cos(tr);
				var ty = ry * rad;
				var tz = rr * rad * Math.sin(tr);
				var rx = rr * Math.cos(tr);
				var rz = rr * Math.sin(tr);
				if(color){
					var tc = color;
				}else{
					tc = hsva(360 / row * i, 1, 1, 1);
				}
				pos.push(tx, ty, tz);
				nor.push(rx, ry, rz);
				col.push(tc[0], tc[1], tc[2], tc[3]);
			}
		}
		r = 0;
		for(i = 0; i < row; i++){
			for(ii = 0; ii < column; ii++){
				r = (column + 1) * i  + ii;
				idx.push(r, r + 1, r + column + 2);
				idx.push(r, r + column + 2, r + column + 1);
			}
		}
		return {p : pos, n : nor, c : col, i : idx};
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








