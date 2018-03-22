const Const = {
	ZOOM: {
		min: 0.2,
		max: 6
	},
	SCALE_BY: 0.95,
	CURSOR: {
		pen: 'url(/img/tools/pen-tool.png),auto',
		brush: 'url(/img/tools/brush-tool.png),auto',
		pencil: 'url(/img/tools/pencil-tool.png),auto',
		eraser: 'url(/img/tools/eraser-tool.png) 6 12,auto',
		select: 'url(/img/tools/choosen.png) 10 15,auto',
		'eraser-on': 'url(/img/tools/eraser-on.png) 6 12,auto',
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
	IMAGE_HEIGHT: 200
}

export default Const