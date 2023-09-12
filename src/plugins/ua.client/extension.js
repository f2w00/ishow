module.exports = {
    extension: {
        activate: () => {},
        beforeClose: () => {
            const { commonEvent } = require('./event.bus')
            commonEvent.emit('main:uaclient.close')
        },
    },
}
