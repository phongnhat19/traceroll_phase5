const Const = {
	ZOOM: {
		min: 0.2,
		max: 6
	},
	SCALE_BY: 0.95,
	CURSOR: {
		pen: 'url(/img/tools/pen-tool.cur), url(/img/tools/pen-tool.png), auto',
		brush: 'url(/img/tools/brush-tool.cur), url(/img/tools/brush-tool.png), auto',
		pencil: 'url(/img/tools/pencil-tool.cur), url(/img/tools/pencil-tool.png), auto',
		eraser: 'url(/img/tools/eraser-tool.cur) 0 15, url(/img/tools/eraser-tool.png) 0 15, auto',
		select: 'url(/img/tools/choosen.cur) 10 15, url(/img/tools/choosen.png) 10 15, auto',
		'eraser-on': 'url(/img/tools/eraser-on.cur) 0 15, url(/img/tools/eraser-on.png) 0 15, auto',
		'select-on': 'pointer',
		default: 'default'
	},
	MODE: {
		PEN: 'pen',
		BRUSH: 'brush',
		PENCIL: 'pencil',
		ERASER: 'eraser',
		SELECT: 'select'
	},
	SHAPE_TYPE: {
		TEXT: 'text',
		IMAGE: 'image',
		VIDEO: 'video',
		PEN: 'drawing:pen',
		PENCIL: 'drawing:pencil',
		BRUSH: 'drawing:brush',
		GROUP: 'drawing:group'
	},
	// Base point for LineBrush
	BASE_POINT: {
		width: 10,
		height: 20
	},
	KONVA: {
		NEW_LINES_CONTAINER_NAME: 'groupNewLine',
		TIME_LINE_NODE: 'timeLine',
		PROFILE_IMAGE: 'profileImage',
		TRANSFORM: 'transform'
	},
	EVENTS: {
		REMOVE: 'remove',
		SHOW_ALERT_PROFILE_IMAGE: 'showalert',
		SHOW_TRANSFORM: 'showtransform',
		HIDE_TRANSFORM: 'hidetransform',
		STAGE_WHEEL: 'stagewheel'
	},
	FONT_SIZE_RATIO: 11,
	PADDING_CAPTION: 5,
	MOUSE_DIRECTION: {
		Left: 0,
		Right: 1,
		Up: 2,
		Down: 3
	},
	PROFILE_IMAGE_SIZE: 163,
	IMAGE_HEIGHT: 200,
	ToastType: {
		NO_PER: 0,
		SAVING: 1
	},
	MENU_HEIGHT: 80,
	INVALID_PASSWORD_MSG: 'Password should atleast have 6 characters and must have a capital letter, a small letter, a number',
	PASSWORD_REGEXP: '[\\d\\W\\w]{6,}', // Old regexp /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\d\W\w]{6,}/gm
	EMAIL_ERROR: 'Please enter a valid email address',
}
export default Const