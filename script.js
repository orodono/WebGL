onload = function(){

	var c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;

	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

};

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



