import $ from 'jquery';
import Const from './const.js';

const Utils = {
    showProcessingBar() {
        document.getElementById("snackbar").className = "show";
    },
    hideProcessingBar() {
        document.getElementById("snackbar").className = "";
    },
    isLeftClick(button) {
        return button === 0;
    },
    getSelfRect(points) {
        let minX = points[0],
            maxX = points[0],
            minY = points[1],
            maxY = points[1],
            x, y;
        for (let i = 0, n =  points.length / 2; i < n; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    getClientRect(group) {
        let minX, minY, maxX, maxY;
        let selfRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        const children = group.getChildren();
        console.log(group, children)
        children.map(function(child) {
            const rect = child.attrs.rect
            let x = child.x(),
                y = child.y()

            if (child.className === 'Image') {
                x -= rect.x
                y -= rect.y
            }
            rect.x += x;
            rect.y += y;
            if (minX === undefined) {
                minX = rect.x;
                minY = rect.y;
                maxX = rect.x + rect.width;
                maxY = rect.y + rect.height;
            } else {
                minX = Math.min(minX, rect.x);
                minY = Math.min(minY, rect.y);
                maxX = Math.max(maxX, rect.x + rect.width);
                maxY = Math.max(maxY, rect.y + rect.height);
            }
            return rect;
        });

        if (children.length !== 0) {
            selfRect = {
                x: minX,
                y: minY,
                width: maxX - minX,
                height: maxY - minY
            };
        }
        return selfRect;
    },
    getRect(data) {
        const attrs = data.stage;
        if (attrs) {
            let rect = attrs.rect;
            if (rect === undefined) {
                rect = {
                    x: attrs.x,
                    y: attrs.y,
                    width: attrs.width,
                    height: attrs.height
                }
            }
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        }
    },
    distanceBetween(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    },
    angleBetween(point1, point2) {
        return Math.atan2( point2.x - point1.x, point2.y - point1.y );
    },
    isObjectContainString(obj, str) {
        if (typeof(obj) === 'object' && typeof(str) === 'string') {
            return Object.values(obj).some(val => str === val);
        }
        return false;
    },
    isLine(node) {
        if (node) {
            const name = node.getName();
            return name === Const.SHAPE_TYPE.PEN || name === Const.SHAPE_TYPE.PENCIL || name === Const.SHAPE_TYPE.BRUSH;
        }
    },
    getTimeLineElementList(stage) {
        return stage.find('.' + Const.KONVA.TIME_LINE_NODE)
    },

    /**
     * drag bound function with profile image
     * @param {Object} stage
     * @param {Object} group
     * @param {Object} pos
     * @param {Function} intersectFunc
     */
    dragBoundProfileImage(stage, group, pos, intersectFunc, callback) {
        const scale = stage.scaleX(),
            frame = group.findOne('Rect'),
            groupAP = group.getAbsolutePosition(),
            frameAP = frame ? frame.getAbsolutePosition() : { x: 0, y: 0 },
            offset = {
                x: groupAP.x - frameAP.x,
                y: groupAP.y - frameAP.y
            };

        let profileFrame = stage.find('.' + Const.KONVA.PROFILE_IMAGE);
            profileFrame = profileFrame.length > 0 ? profileFrame[0] : null;

        if (profileFrame && frame) {
            const profileFrameAP = profileFrame.getAbsolutePosition(),
                rect1 = {
                    x: profileFrameAP.x,
                    y: profileFrameAP.y,
                    width: profileFrame.width() * scale,
                    height: profileFrame.height() * scale
                },
                rect2 = {
                    x: (pos.x - offset.x),
                    y: (pos.y - offset.y),
                    width: frame.width() * scale,
                    height: frame.height() * scale
                };

            const ap = intersectFunc.call(this, rect1, rect2, pos, offset);
            if (ap) {
                callback && callback(true);
                profileFrame.fire(Const.EVENTS.SHOW_ALERT_PROFILE_IMAGE);
                return ap;
            }
            callback && callback(false);
            return pos;
        }
        callback && callback(false);
        return pos;
    },
    /**
     * check intersect between Text/Images/LineGroups with Profile Image
     * @param {Object} rect1  [Profile Image]
     * @param {Object} rect2  [Text/Images/LineGroups]
     * @param {Object} pos    [Text/Images/LineGroups absolute position]
     * @param {Object} offset [Distance absolute position between Konva.Group and Konva.Rect]
     * @return {Object} new valid position if is intersect. Otherwise null.
     */
    intersectProfileImage(rect1, rect2, pos, offset) {
        const rightSide = rect1.x + rect1.width < rect2.x,
            leftSide = rect2.x + rect2.width < rect1.x,
            botSide = rect1.y + rect1.height < rect2.y,
            topSide = rect2.y + rect2.height < rect1.y;
        if (!(leftSide || topSide || rightSide || botSide)) {
            if (!this.side) {
                this.side = {
                    leftSide: false,
                    topSide: false,
                    rightSide: true,
                    botSide: false
                }
            }
            if (this.side.leftSide) {
                return {
                    x: (rect1.x - rect2.width + offset.x),
                    y: pos.y
                }
            }
            if (this.side.topSide) {
                return {
                    x: pos.x,
                    y: (rect1.y - rect2.height + offset.y)
                }
            }
            if (this.side.rightSide) {
                return {
                    x: (rect1.x + rect1.width + offset.x),
                    y: pos.y
                }
            }
            if (this.side.botSide) {
                return {
                    x: pos.x,
                    y: (rect1.y + rect1.height + offset.y)
                }
            }
        }
        this.side = {
            leftSide: leftSide,
            topSide: topSide,
            rightSide: rightSide,
            botSide: botSide
        }
    },
    /**
     * update stroke when mouse enter/out rect
     * @param  {Object}  e      [event param default of Konva]
     * @param  {Boolean} isShow [If true, enabled stroke. Otherwise, disabled]
     */
    showBorder(e, isShow) {
        const rect = e.target;
        if (rect) {
            rect.strokeEnabled(isShow);
            rect.getLayer().draw();
        }
    },
    axiosError(err) {
        const res = err.response;
        if (res) {
            if (res.status === 401) {
                //alert('Your session has expired. Please login again!')
                window.location.href = '/login';
            }
            else if (res.status === 404) {
                alert('Page not found!')
                window.location.href = '/home';
            }
        }
    },

    validateEmail(email) {
        const regex = /^(\w([.-]?))+@\w+\.\w+$/g;
        return regex.test(String(email).toLowerCase());
    },
    isValidPassword(pwd) {
        const numberCheck = new RegExp("(?=.*[0-9])"),
            capitalCheck = new  RegExp("(?=.*[A-Z])"),
            smallCheck = new RegExp("(?=.*[a-z])"),
            lengthCheck = new RegExp("(?=.{6,})")
        return lengthCheck.test(pwd) && numberCheck.test(pwd) && capitalCheck.test(pwd) && smallCheck.test(pwd)
    },
    calculateTextSizeByTextLength(length) {
        if (length > 3000) {
            return 12;
        }

        if (length > 2000) {
            return 14;
        }

        if (length > 1000) {
            return 16;
        }

        if (length > 500) {
            return 17;
        }

        if (length > 100) {
            return 18;
        }

        return 22;
    },

    extractUserId(str) {
        const regex = /\d+/gm;
        let m, arr;

        while ((m = regex.exec(str)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            arr = m.map((match, groupIndex) => {
                return match
            });
        }
        if (arr && arr.length > 0) {
            return arr[0]
        }
        return -1
    },
    calculateImageSize(originWidth, originHeight) {
        const ratio = originWidth / originHeight;
        const imageHeight = Const.IMAGE_HEIGHT;
        const imageWidth = ratio * imageHeight;
        return {
            width: imageWidth,
            height: imageHeight
        }
    },
    getMainMenuSize() {
        const height = $('.navbar-inverse').outerHeight()
        const width = $('.navbar-inverse').outerWidth()
        return {
            width: width,
            height: height
        }
    },
    hideOverflow() {
        document.querySelector('body').style.overflow = 'hidden'
    },
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }
}

export default Utils;
