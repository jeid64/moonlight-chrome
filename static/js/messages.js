var callbacks = {}
var callbacks_ids = 1;

var sendMessage = function(method, params) {
    return new Promise(function(resolve, reject) {
        var id = callbacks_ids++;
        callbacks[id] = {'resolve': resolve, 'reject': reject};
        
        common.naclModule.postMessage({
            'callbackId': id,
            'method': method,
            'params': params
        });
    });
}

function handleMessage(msg) {
    if (msg.data.callbackId && callbacks[msg.data.callbackId]) {  // if it's a callback, treat it as such
        callbacks[msg.data.callbackId][msg.data.type](msg.data.ret);
        delete callbacks[msg.data.callbackId]
    } else {  // else, it's just info, or an event
        console.log(msg.data);
        if(msg.data === 'streamTerminated') {  // if it's a recognized event, notify the appropriate function
            api.refreshServerInfo().then(function (ret) {
                showAppsMode();
            });
        }
    }
}